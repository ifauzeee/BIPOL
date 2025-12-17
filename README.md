# BIPOL - Real-Time Bus Tracker & Smart Transit System

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/Platform-ESP32%20%7C%20Web-orange)](https://espressif.com)

**BIPOL** is an advanced, real-time public transportation tracking system designed to enhance commuter experience and fleet management. It combines IoT hardware (ESP32 + GPS/GPRS) with a robust web platform to provide live bus tracking, safety monitoring (gas leaks/speed), and direct passenger-admin communication.

---

## 🚀 Key Features

### 📡 Real-Time Fleet Tracking
- **Live GPS Position**: Tracks bus locations in real-time with high precision.
- **Status Updates**: Automatically detects if a bus is "Moving", "Stopping", or "Parked" based on speed and dwell time.
- **Estimated Time of Arrival (ETA)**: Calculates arrival times based on current traffic and speed.

### 🛡️ Safety & Monitoring System
- **Gas Leak Detection**: Integrated MQ-2 sensors monitor air quality/gas levels inside the bus, alerting admins instantly if thresholds are breached.
- **Speed Monitoring**: Tracks vehicle speed to ensure driver compliance with safety regulations.
- **Geofencing**: Defines operational zones and alerts if a bus deviates from its designated route.

### 📱 User & Admin Experience
- **Interactive Map**: Passengers can view all buses on a live map.
- **Lost & Found**: Dedicated module for reporting and managing lost items.
- **Feedback Loop**: Passengers can send feedback directly to the administration.
- **Admin Dashboard**: Comprehensive control panel for managing fleet, announcements, and responding to user reports.

---

## 🛠️ System Architecture

### 1. Hardware (Firmware)
- **Controller**: ESP32
- **Connectivity**: SIM808 Module (GPRS/GSM + GPS)
- **Sensors**: MQ-2 (Gas/Smoke), GPS
- **Communication Protocol**: UDP (User Datagram Protocol) for lightweight, fast data transmission.
- **Display**: LCD 16x2 for driver status (Speed, Satellite status, Connectivity).

### 2. Backend (Server)
- **Runtime**: Node.js & Express
- **Database**: Supabase (PostgreSQL)
- **Real-Time Engine**: Socket.io (WebSocket) for instant frontend updates.
- **Security**: 
  - Rate Limiting (DDoS protection)
  - Helmet (Header security)
  - Session-based Authentication

### 3. Frontend (Web Client)
- **Interface**: HTML5, CSS3, Vanilla JavaScript
- **Maps**: Leaflet.js
- **Design**: Responsive, mobile-first design with smooth animations and glassmorphism elements.

---

## 📦 Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)
- A Supabase account (Free tier works great)
- Hardware components (if deploying the firmware side)

### Step 1: Clone the Repository
```bash
git clone https://github.com/ifauzeee/BIPOL.git
cd BIPOL
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
Create a `.env` file in the root directory by copying the example:
```bash
cp .env.example .env
```
Open `.env` and fill in your credentials:
```properties
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SESSION_SECRET=your_secure_random_string
GAS_ALERT_THRESHOLD=600
BUS_STOP_TIMEOUT_MINUTES=5
```

### Step 4: Database Setup
Run the SQL scripts located in the `database/` folder in your Supabase SQL Editor in the following order:
1. `01_admin_schema.sql` (Creates admin tables)
2. `02_tracker_schema.sql` (Creates tracking data tables)
3. `03_app_info_schema.sql` (Creates announcement tables)
...and so on for all schema files.

Alternatively, you can use the provided seeding scripts to set up initial data:
```bash
node scripts/seed_admin.js
```

### Step 5: Run the Server
**Development Mode:**
```bash
npm run dev
```
**Production Mode:**
```bash
npm start
```
Access the dashboard at `http://localhost:3000`.

---

## 🔧 Hardware Setup (ESP32)

1. **Wiring**:
   - SIM808 TX -> ESP32 RX (Pin 26)
   - SIM808 RX -> ESP32 TX (Pin 27)
   - MQ-2 Analog -> ESP32 Pin 34
   - LCD SDA -> ESP32 Pin 21
   - LCD SCL -> ESP32 Pin 22
2. **Configuration**:
   - Rename `firmware/arduino_secrets.h.example` to `firmware/arduino_secrets.h`.
   - Update `SECRET_AS` (APN), `SECRET_SERVER_IP` (Your VPS IP), and `SECRET_UDP_PORT` (Default: 3000 or as configured).
3. **Upload**: Use Arduino IDE to upload `firmware/esp32_tracker_udp.ino`.

---

## 📂 Project Structure

```bash
BIPOL/
├── database/           # SQL schemas for database structure
├── firmware/           # Arduino/ESP32 code
├── public/             # Static frontend files (HTML, CSS, JS, Assets)
├── scripts/            # Database seeding and utility scripts
├── server.js           # Main Core Backend Logic
├── .env.example        # Environment variable template
└── package.json        # Project dependencies and scripts
```

---

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---

## 📄 License
This project is licensed under the **ISC License**.

---
*Developed with ❤️ by Zee*
