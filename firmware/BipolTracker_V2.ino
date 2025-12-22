#define TINY_GSM_MODEM_SIM808
#define TINY_GSM_RX_BUFFER 1024

#include <TinyGsmClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "arduino_secrets.h"

// ==========================================
// KONFIGURASI ALAT BARU (PROJECT BIPOL)
// ==========================================
#define DEVICE_ID    "BUS-01"   // ID untuk Alat Baru
#define MODEM_RX_PIN 26         // Pin RX Baru
#define MODEM_TX_PIN 27         // Pin TX Baru
#define MQ2_PIN      34         // Sensor Gas
// ==========================================

const char server[]   = SECRET_SERVER_IP;
const int  udp_port   = SECRET_UDP_PORT;

const char apn[]  = SECRET_APN;
const char user[] = SECRET_GPRS_USER;
const char pass[] = SECRET_GPRS_PASS;

#define SerialMon Serial
#define SerialAT Serial2

TinyGsm modem(SerialAT);
LiquidCrystal_I2C lcd(0x27, 16, 2);

float lat = 0, lon = 0, speed = 0, alt = 0;
int vsat = 0, usat = 0, mq2Value = 0;

unsigned long lastSendTime = 0;
unsigned long lastLcdTime = 0;
const long sendInterval = 1000;

String sendATCommandResp(String cmd, int timeout);
void sendATCommand(String cmd, int timeout);
void connectGPRS();

void setup() {
  SerialMon.begin(115200);
  delay(10);

  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.print("BIPOL NEW SYSTEM");

  // Inisialisasi Serial Modem
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
    lcd.setCursor(0,1); lcd.print("Modem Fail!   ");
    SerialAT.updateBaudRate(9600);
    if(!modem.restart()) while(true);
  }

  SerialMon.println("Configuring UDP...");
  sendATCommand("AT+CIPSHUT", 2000);

  lcd.setCursor(0,1); lcd.print("GPS Starting...");
  modem.enableGPS();

  lcd.clear();
  lcd.print("Ready " + String(DEVICE_ID));
}

void connectUDP() {
  lcd.setCursor(0,1); lcd.print("UDP Connecting..");

  sendATCommand("AT+CIPSTATUS=0", 1000);

  String cmd = "AT+CIPSTART=0,\"UDP\",\"" + String(server) + "\",\"" + String(udp_port) + "\"";
  String resp = sendATCommandResp(cmd, 3000);

  if (resp.indexOf("CONNECT OK") >= 0 || resp.indexOf("ALREADY CONNECT") >= 0) {
     lcd.setCursor(0,1); lcd.print("UDP Connected!  ");
     SerialMon.println("UDP Connected on Ch 0");
     delay(500);
  } else {
     lcd.setCursor(0,1); lcd.print("UDP Fail! Retry ");
     SerialMon.println("CIPSTART Ch0 Failed. Retrying...");
     delay(1000);
     sendATCommand("AT+CIPSHUT", 1000);
  }
}

void connectGPRS() {
  if (!modem.isGprsConnected()) {
    SerialMon.print("Connecting to APN...");
    lcd.setCursor(0,1); lcd.print("GPRS...        ");
    if (!modem.gprsConnect(apn, user, pass)) {
      SerialMon.println("FAIL");
      delay(1000);
      return;
    }
    SerialMon.println("OK");
    lcd.setCursor(0,1); lcd.print("GPRS OK        ");

    connectUDP();
  }
}

String sendATCommandResp(String cmd, int timeout) {
  while(SerialAT.available()) SerialAT.read();

  SerialAT.println(cmd);
  String response = "";
  unsigned long t = millis();
  while(millis() - t < timeout) {
    while(SerialAT.available()) {
      char c = SerialAT.read();
      response += c;
      SerialMon.write(c);
    }
  }
  return response;
}

void sendATCommand(String cmd, int timeout) {
  sendATCommandResp(cmd, timeout);
}

void sendDataUDP(String csvData) {
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

void loop() {
  if (!modem.isGprsConnected()) {
    connectGPRS();
    return;
  }

  // Ambil Data GPS & Waktu
  int year = 0, month = 0, day = 0, hour = 0, minute = 0, second = 0;
  float accuracy = 0;
  modem.getGPS(&lat, &lon, &speed, &alt, &vsat, &usat, &accuracy, &year, &month, &day, &hour, &minute, &second);

  if (speed < 1.0) speed = 0;

  mq2Value = analogRead(MQ2_PIN);

  // Cycling Display Logic (Ganti tampilan setiap 2 detik)
  if (millis() - lastLcdTime > 2000) {
    lastLcdTime = millis();
    static bool showPage = false;
    showPage = !showPage;

    // === BARIS 1: SELALU TAMPIL (ID & SPEED) ===
    lcd.setCursor(0,0);
    lcd.print(DEVICE_ID);
    
    // Rata Kanan untuk Speed
    lcd.setCursor(10,0);
    if(speed < 10) lcd.print(" ");
    lcd.print((int)speed);
    lcd.print("KM/H");

    // === BARIS 2: BERGANTIAN ===
    lcd.setCursor(0,1);
    if (showPage) {
        // TAMPILAN A: SINYAL & JAM
        if(modem.isGprsConnected()) lcd.print("[ON] 4G   ");
        else                        lcd.print("[!] LOST  ");
        
        int jamWIB = (hour + 7) % 24;
        if (minute < 10) lcd.print(" " + String(jamWIB) + ":0" + String(minute));
        else             lcd.print(" " + String(jamWIB) + ":" + String(minute));
    } else {
        // TAMPILAN B: SENSOR GAS / STATUS
        if (mq2Value > 500) {
             lcd.print("WARNING: GAS!");
        } else if (speed > 5) {
             lcd.print(">> MOVING <<    ");
        } else {
             lcd.print("GAS LEVEL: ");
             lcd.print(mq2Value);
             lcd.print("   ");
        }
    }
  }

  if (millis() - lastSendTime > sendInterval) {
    lastSendTime = millis();

    String csv = String(DEVICE_ID) + "," + String(lat, 6) + "," + String(lon, 6) + "," + String(speed, 1) + "," + String(mq2Value);

    sendDataUDP(csv);
  }
}
