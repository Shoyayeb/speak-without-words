# Speak Without Words - Connection Guide

Welcome to Speak Without Words! This guide will help you connect two devices so you can communicate silently with your partner.

## � Firebase Setup (Required for Cross-Device Connection)

For two different devices to communicate, you need to set up Firebase Realtime Database:

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Disable Google Analytics (optional, speeds up setup)

### Step 2: Enable Realtime Database
1. In your Firebase project, go to "Build" → "Realtime Database"
2. Click "Create Database"
3. Choose your region (closest to you)
4. Start in **Test Mode** (for hackathon demo)

### Step 3: Get Configuration
1. Go to "Project Settings" (gear icon)
2. Scroll to "Your apps" → Click "Web" (</> icon)
3. Register app with any name
4. Copy the `firebaseConfig` object

### Step 4: Update App Configuration
Open `src/services/firebase.ts` and replace the config:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // Your API key
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 5: Set Database Rules (Test Mode)
In Firebase Console → Realtime Database → Rules, use:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **Warning**: These rules are for demo only. For production, implement proper authentication.

---

## �📱 Requirements

- Both devices must have the Speak Without Words app installed
- Both devices need an active internet connection (for initial setup only)
- Camera permission is required for scanning QR codes

## 🔗 How to Connect Two Devices

### Method 1: QR Code Scanning (Recommended)

This is the fastest and most reliable way to connect.

#### On Device A (Host):
1. Open the app and tap the **"Connect"** button on the home screen
2. You'll see the **"Show QR"** tab selected by default
3. A QR code will be displayed along with a 6-character session code
4. Keep this screen open while your partner scans

#### On Device B (Scanner):
1. Open the app and tap the **"Connect"** button on the home screen
2. Switch to the **"Scan QR"** tab
3. Allow camera access when prompted
4. Point your camera at the QR code on Device A
5. The app will automatically detect and connect

#### Success!
Both devices will show a **"Connected!"** confirmation and return to the main screen.

---

### Method 2: Manual Session Code (Backup)

Use this if the camera isn't working or you're connecting remotely.

#### On Device A (Host):
1. Open Connect screen and note the **6-character session code** below the QR
2. Tap the **copy icon** to copy the code
3. Share this code with your partner (via text, call, etc.)

#### On Device B (Joiner):
1. Open Connect screen
2. *(Future feature)* Enter the session code manually
3. Tap Connect

---

## 🔄 Connection Status

The app shows your connection status on the main screen:

| Status | Meaning |
|--------|---------|
| 🔴 Disconnected | Not connected to any device |
| 🟡 Connecting | Connection in progress |
| 🟢 Connected | Successfully paired with partner |

---

## ⚠️ Troubleshooting

### QR Code Not Scanning

1. **Ensure good lighting** - The camera needs clear visibility
2. **Hold steady** - Keep the camera about 6-12 inches from the QR code
3. **Check camera permission** - Go to Settings > Speak Without Words > Camera
4. **Generate a new code** - Tap "Generate New Code" on the host device

### Connection Failed

1. **QR code expired** - Codes expire after 5 minutes. Generate a new one.
2. **Different app versions** - Ensure both devices have the latest app version
3. **Network issues** - Check that both devices have internet connectivity
4. **Try again** - Close the Connect screen on both devices and start fresh

### Lost Connection

1. The connection may time out after 5 minutes of inactivity
2. Simply reconnect using the QR code method
3. Your decks and settings will be preserved

---

## 🔒 Privacy & Security

- **Encrypted Connection**: All communication between devices is encrypted using NaCl cryptography
- **No Server Storage**: Your messages are peer-to-peer and never stored on external servers
- **Session Expiry**: Sessions automatically expire after 24 hours for security
- **Local Data Only**: Your decks and preferences stay on your device

---

## 📋 Quick Reference

| Action | Device A | Device B |
|--------|----------|----------|
| Start Connection | Tap Connect | Tap Connect |
| Show QR | Stay on "Show QR" | Switch to "Scan QR" |
| Scan | Keep screen visible | Point camera at QR |
| Confirm | Wait for "Connected!" | Wait for "Connected!" |

---

## 💡 Tips for Best Results

1. **Pair in advance** - Connect before you need silent communication
2. **Test first** - Send a test signal to confirm everything works
3. **Keep app open** - The connection works best with the app active
4. **Same WiFi helps** - Being on the same network improves reliability
5. **Fresh codes** - If connection fails, generate a new QR code

---

## 🆘 Still Having Issues?

If you continue to experience connection problems:

1. Force close the app on both devices
2. Reopen and try connecting again
3. Ensure both devices have the latest app version
4. Check that your device OS is up to date

---

## 🎯 Next Steps

Once connected, you can:
- **Send signals** - Tap icons from your deck to communicate
- **Receive signals** - See what your partner sends in real-time
- **Confirm understanding** - Use ✓, ✗, or ? to respond
- **Switch decks** - Change communication sets as needed

Happy communicating! 🤫✨
