// ==================================================
// BIPOL TRACKING SYSTEM - SIM808 UDP GPS Tracker
// ==================================================

#define TINY_GSM_MODEM_SIM808
#define TINY_GSM_RX_BUFFER 1024

#include <TinyGsmClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "arduino_secrets.h"

// ==================================================
// DEVICE CONFIGURATION
// ==================================================
#define DEVICE_ID    "BUS-02"   // Change to "BUS-03" for third device
#define MODEM_RX_PIN 27         // RX pin (legacy wiring)
#define MODEM_TX_PIN 26         // TX pin (legacy wiring)

// ==================================================
// NETWORK CONFIGURATION
// ==================================================
const char server[] = SECRET_SERVER_IP;
const int  udp_port = SECRET_UDP_PORT;

const char apn[]  = SECRET_APN;
const char user[] = SECRET_GPRS_USER;
const char pass[] = SECRET_GPRS_PASS;

// ==================================================
// SERIAL DEFINITIONS
// ==================================================
#define SerialMon Serial
#define SerialAT  Serial2

TinyGsm modem(SerialAT);
LiquidCrystal_I2C lcd(0x27, 20, 4); // LCD 20x4

// ==================================================
// GLOBAL VARIABLES
// ==================================================
float lat = 0, lon = 0, speed = 0, alt = 0;
int vsat = 0, usat = 0;
int year = 0, month = 0, day = 0, hour = 0, minute = 0, second = 0;

unsigned long lastSendTime = 0;
unsigned long lastLcdTime  = 0;
const long sendInterval    = 1000;

// ==================================================
// HELPER FUNCTIONS
// ==================================================
String twoDigits(int number) {
  return (number < 10) ? "0" + String(number) : String(number);
}

String sendATCommandResp(const String& cmd, int timeout) {
  while (SerialAT.available()) SerialAT.read();

  SerialAT.println(cmd);
  String response;
  unsigned long start = millis();

  while (millis() - start < timeout) {
    while (SerialAT.available()) {
      char c = SerialAT.read();
      response += c;
      SerialMon.write(c);
    }
  }
  return response;
}

void sendATCommand(const String& cmd, int timeout) {
  sendATCommandResp(cmd, timeout);
}

// ==================================================
// CONNECTION FUNCTIONS
// ==================================================
void connectUDP() {
  lcd.setCursor(0,3); lcd.print("UDP Connecting...   ");
  sendATCommand("AT+CIPSTATUS=0", 1000);

  String cmd  = "AT+CIPSTART=0,\"UDP\",\"" + String(server) + "\",\"" + String(udp_port) + "\"";
  String resp = sendATCommandResp(cmd, 3000);

  if (resp.indexOf("CONNECT OK") >= 0 || resp.indexOf("ALREADY CONNECT") >= 0) {
    SerialMon.println("UDP Connected on Ch 0");
  } else {
    lcd.setCursor(0,3); lcd.print("UDP Retry...        ");
    SerialMon.println("CIPSTART Ch0 Failed. Retrying...");
    sendATCommand("AT+CIPSHUT", 1000);
  }
}

void connectGPRS() {
  if (!modem.isGprsConnected()) {
    SerialMon.print("Connecting to APN...");
    lcd.setCursor(0,3); lcd.print("GPRS Connecting...  ");

    if (!modem.gprsConnect(apn, user, pass)) {
      SerialMon.println("FAIL");
      delay(1000);
      return;
    }
    SerialMon.println("OK");
    connectUDP();
  }
}

// ==================================================
// DATA FUNCTIONS
// ==================================================
void sendDataUDP(const String& csvData) {
  if (!modem.isGprsConnected()) {
    SerialMon.println("GPRS Lost! Reconnecting...");
    connectGPRS();
    return;
  }

  SerialMon.print("UDP > "); SerialMon.println(csvData);

  String sendCmd = "AT+CIPSEND=0," + String(csvData.length());
  SerialAT.println(sendCmd);
  delay(100);

  SerialAT.print(csvData);
  SerialAT.write(0x1A);

  SerialMon.println(" [SENT]");
}

// ==================================================
// SETUP
// ==================================================
void setup() {
  SerialMon.begin(115200);
  delay(10);

  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();

  // Intro Screen
  lcd.setCursor(0,0); lcd.print("====================");
  lcd.setCursor(0,1); lcd.print("   BIPOL TRACKING   ");
  lcd.setCursor(0,2); lcd.print("   SYSTEM STARTUP   ");
  lcd.setCursor(0,3); lcd.print("====================");

  // Initialize Modem
  SerialAT.begin(9600, SERIAL_8N1, MODEM_RX_PIN, MODEM_TX_PIN);
  delay(1000);

  SerialMon.println("Setting Modem Baudrate to 115200...");
  modem.sendAT("+IPR=115200");
  modem.waitResponse();
  delay(100);

  SerialAT.updateBaudRate(115200);
  delay(1000);

  SerialMon.println("Initializing Modem...");
  if (!modem.restart()) {
    SerialMon.println("Modem Failed!");
    lcd.setCursor(0,2); lcd.print("   Modem Failed!    ");
    SerialAT.updateBaudRate(9600);
    if (!modem.restart()) while (true);
  }

  SerialMon.println("Configuring UDP...");
  sendATCommand("AT+CIPSHUT", 2000);

  lcd.setCursor(0,2); lcd.print("   GPS Starting...  ");
  modem.enableGPS();
  lcd.clear();
}

// ==================================================
// MAIN LOOP
// ==================================================
void loop() {
  if (!modem.isGprsConnected()) {
    connectGPRS();
    return;
  }

  // Get GPS Data
  float accuracy = 0;
  modem.getGPS(&lat, &lon, &speed, &alt, &vsat, &usat, &accuracy,
               &year, &month, &day, &hour, &minute, &second);

  if (speed < 1.0) speed = 0;

  // LCD Update
  if (millis() - lastLcdTime > 1000) {
    lastLcdTime = millis();

    // Line 1: Status & Time
    lcd.setCursor(0,0);
    lcd.print(modem.isGprsConnected() ? "[4G] ONLINE  " : "[!]  OFFLINE ");
    int jamWIB = (hour + 7) % 24;
    lcd.print(twoDigits(jamWIB) + ":" + twoDigits(minute));

    // Line 2: Device ID
    lcd.setCursor(0,1);
    lcd.print("ID: " + String(DEVICE_ID));
    for (int i = 4 + String(DEVICE_ID).length(); i < 20; i++) lcd.print(" ");

    // Line 3: Speed
    lcd.setCursor(0,2);
    lcd.print("SPEED: ");
    lcd.print((speed < 10) ? "  " : (speed < 100) ? " " : "");
    lcd.print((int)speed);
    lcd.print(" KM/H    ");

    // Line 4: System Status
    lcd.setCursor(0,3);
    if (modem.isGprsConnected()) {
      lcd.print(speed > 0 ? ">> UNIT MOVING    <<" : ">> UNIT STANDBY   <<");
    } else {
      lcd.print(">> SIGNAL LOST    <<");
    }
  }

  // Send UDP Data
  if (millis() - lastSendTime > sendInterval) {
    lastSendTime = millis();
    String csv = String(DEVICE_ID) + "," + String(lat, 6) + "," + String(lon, 6) + "," + String(speed, 1) + ",0";
    sendDataUDP(csv);
  }
}
