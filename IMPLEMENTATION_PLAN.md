# Speak Without Words - Hackathon Implementation Plan

> **Theme:** When words go quiet, meaning still finds a way. Every look, sound and shape can tell a story. Understanding isn't read—it's felt.

---

## 🎯 Project Overview

### Elevator Pitch
An app where two people create and share meaning without typing or speaking. They build a shared visual/haptic language using micro-gestures, looks, lights, and patterns to communicate in real time. A companion learning mode explores how secret signaling has worked throughout history.

### Core Riddles Addressed

| Riddle | Implementation |
|--------|----------------|
| **"Two minds sharing a secret with no words or sound"** | Real-time nonverbal signal exchange with mutual confirmation UI |
| **"How have secrets traveled unseen through history"** | Interactive timeline of historical codes + encoding mini-games |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP (React Native + Expo)         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   CONNECT    │  │  LEARN &     │  │    SETTINGS          │   │
│  │   Screen     │  │  PLAY        │  │    Screen            │   │
│  │              │  │  Screen      │  │                      │   │
│  │ • Pairing    │  │ • Timeline   │  │ • Accessibility      │   │
│  │ • Live Chat  │  │ • Mini-games │  │ • Deck Management    │   │
│  │ • Deck View  │  │ • Stego Demo │  │ • Privacy Controls   │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      SHARED SERVICES LAYER                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │ P2P/WebRTC │ │ Crypto     │ │ Storage    │ │ Haptics/     │  │
│  │ Service    │ │ Service    │ │ Service    │ │ Feedback     │  │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      OPTIONAL RELAY SERVER                      │
│            (Node.js + Socket.IO for non-P2P fallback)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Feature Breakdown

### 1. CONNECT MODULE (Core Experience)

#### 1.1 Device Pairing
```
User Flow:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Generate   │ -> │  Scan QR /  │ -> │  Session    │
│  QR Code    │    │  Enter Code │    │  Established│
└─────────────┘    └─────────────┘    └─────────────┘
```

**Implementation:**
- Generate ephemeral session token (6-char alphanumeric)
- Display as QR code + manual entry option
- Use X25519 key exchange for session encryption
- Support: QR scan, proximity detection, manual code

#### 1.2 Shared Dictionary (Mini-Language Creator)
```
Deck Structure:
┌────────────────────────────────────────┐
│  DECK: "Travel Signals"                │
├────────────────────────────────────────┤
│  👁️  + double-tap  →  "I see you"     │
│  🚶  + swipe-right →  "Let's go"      │
│  ⚠️  + long-press  →  "Danger/Wait"   │
│  ✓   + tap-tap     →  "Yes/Agree"     │
│  ✗   + shake       →  "No/Disagree"   │
│  💚  + hold        →  "I'm okay"      │
└────────────────────────────────────────┘
```

**Features:**
- 6-slot deck with icon + gesture + meaning mapping
- Preset packs: Travel, Emergency, Strategy, Celebration, Custom
- Export/import deck via QR code
- Visual deck editor with drag-and-drop

#### 1.3 Live Signal Exchange
```
Signal Types:
┌─────────────────┬───────────────────────────────────────┐
│ Type            │ Implementation                        │
├─────────────────┼───────────────────────────────────────┤
│ TAP PATTERNS    │ Touch events → rhythm encoding        │
│ HAPTIC PULSES   │ Vibration patterns (short/long/pause) │
│ LIGHT FLASHES   │ Screen color changes (morse-like)     │
│ ICON DISPLAY    │ Emoji/shape from shared deck          │
│ DRAWN GESTURES  │ Canvas patterns (circle, zigzag, X)   │
└─────────────────┴───────────────────────────────────────┘
```

#### 1.4 Mutual Confirmation Flow
```
┌──────────────────────────────────────────────────────────┐
│                    CONFIRMATION FLOW                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  SENDER                           RECEIVER               │
│  ┌─────────┐                     ┌─────────┐            │
│  │ Sends   │ ──── signal ────>   │ Receives│            │
│  │ Signal  │                     │ Signal  │            │
│  └─────────┘                     └────┬────┘            │
│       │                               │                  │
│       │                         ┌─────▼─────┐           │
│       │                         │ Shows icon │           │
│       │                         │ + meaning  │           │
│       │                         └─────┬─────┘           │
│       │                               │                  │
│       │         ┌───────────────┬─────┴─────┐           │
│       │         │               │           │           │
│       │     [✓ Got it]    [? Confused]  [✗ Wrong]      │
│       │         │               │           │           │
│       │         ▼               ▼           ▼           │
│  ┌────▼────┐  ┌─────┐      ┌─────────┐  ┌───────┐      │
│  │ See     │  │Pulse│      │ Resend/ │  │ Edit  │      │
│  │ Confirm │  │Anim │      │ Clarify │  │ Deck  │      │
│  └─────────┘  └─────┘      └─────────┘  └───────┘      │
│                                                          │
│          "THOUGHT LINK" ANIMATION ON BOTH SCREENS        │
└──────────────────────────────────────────────────────────┘
```

---

### 2. LEARN & PLAY MODULE (Historical Exploration)

#### 2.1 Interactive Timeline
```
Historical Codes Timeline:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
 🔥 SMOKE       ⚓ SEMAPHORE    ✉️ INVISIBLE   🐦 CARRIER
 SIGNALS        FLAGS          INK            PIGEONS
 (Ancient)      (1790s)        (Ancient-WWII) (500 BC+)
    │               │              │              │
    ▼               ▼              ▼              ▼
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    │               │              │              │
    ▼               ▼              ▼              ▼
 📻 MORSE       🧶 KNITTING    ✋ HAND         🎵 MUSICAL
 CODE           CODES          SIGNALS        CIPHERS
 (1840s)        (WWII)         (Military)     (Renaissance)

Each card includes:
• Historical context (who, when, why)
• How it worked (technical explanation)
• Famous uses/stories
• Interactive demo to try it yourself
```

#### 2.2 Mini-Games
| Game | Description | Interaction |
|------|-------------|-------------|
| **Morse Decoder** | Tap out dots and dashes to spell words | Touch + Audio |
| **Semaphore Sender** | Position virtual flags to send letters | Drag + Visual |
| **Cipher Wheel** | Rotate wheels to decode Caesar cipher | Rotate + Visual |
| **Shredded Letter** | Reassemble torn message pieces | Drag + Puzzle |
| **Spot the Code** | Find hidden message in historical image | Tap + Visual |

#### 2.3 Steganography Demo (Educational)
```
┌────────────────────────────────────────────────────────────┐
│  HIDE A MESSAGE IN AN IMAGE (Educational Demo)            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐        ┌──────────────┐                 │
│  │              │        │              │                 │
│  │   ORIGINAL   │  ──>   │   ENCODED    │                 │
│  │    IMAGE     │        │    IMAGE     │                 │
│  │              │        │ (looks same) │                 │
│  └──────────────┘        └──────────────┘                 │
│                                                            │
│  Hidden Message: "HELLO" (6 chars max)                    │
│                                                            │
│  ⚠️ EDUCATIONAL DISCLAIMER:                               │
│  This demo shows LSB encoding for learning purposes.      │
│  Always use communication tools responsibly and legally.  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI/UX Design

### Screen Layouts

#### Connect Screen
```
┌─────────────────────────────────────────┐
│  ≡  Speak Without Words    [Settings]   │
├─────────────────────────────────────────┤
│                                         │
│     👤 ─────── 💫 ─────── 👤            │
│    You      Connected     Partner       │
│         "Session: XKCD42"               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   YOUR DECK          INCOMING SIGNAL    │
│  ┌─────────┐        ┌──────────────┐   │
│  │ 👁️ 🚶 ⚠️ │        │              │   │
│  │ ✓  ✗  💚 │        │     👁️       │   │
│  └─────────┘        │  "I see you"  │   │
│   [Edit Deck]       │              │   │
│                     │ [✓] [?] [✗]  │   │
│                     └──────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│   TAP AREA (for rhythm signals)         │
│  ┌─────────────────────────────────┐   │
│  │                                  │   │
│  │     [ TAP HERE TO SEND ]        │   │
│  │                                  │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│    [Connect]    [Learn]    [Settings]   │
└─────────────────────────────────────────┘
```

#### Learn & Play Screen
```
┌─────────────────────────────────────────┐
│  ←  History of Secret Signals           │
├─────────────────────────────────────────┤
│                                         │
│  ━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│    Ancient          Modern              │
│                                         │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │  🔥 SMOKE SIGNALS               │   │
│  │  Ancient civilizations          │   │
│  │  ─────────────────────────────  │   │
│  │  Used by Greeks, Chinese, and   │   │
│  │  Native Americans for long-     │   │
│  │  distance communication...      │   │
│  │                                  │   │
│  │  [Try It] [Read More]           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📻 MORSE CODE                  │   │
│  │  1840s - Samuel Morse           │   │
│  │  ─────────────────────────────  │   │
│  │  Dots and dashes that changed   │   │
│  │  communication forever...       │   │
│  │                                  │   │
│  │  [Try It] [Read More]           │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│    [Connect]    [Learn]    [Settings]   │
└─────────────────────────────────────────┘
```

### Visual Design Tokens
```
Colors:
  Primary:     #6C5CE7 (Purple - mystery/connection)
  Secondary:   #00CEC9 (Teal - communication)
  Success:     #00B894 (Green - confirmation)
  Warning:     #FDCB6E (Yellow - attention)
  Danger:      #E17055 (Orange-red - alerts)
  Background:  #1A1A2E (Dark blue - night sky)
  Surface:     #16213E (Slightly lighter)
  Text:        #EAEAEA (Off-white)

Typography:
  Headings:    Inter Bold
  Body:        Inter Regular
  Mono/Codes:  JetBrains Mono

Animations:
  Confirm pulse: radial gradient expanding
  Connection:    particles flowing between avatars
  Signal send:   ripple from touch point
```

---

## 📂 Project Structure

```
speak-without-words/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── connect.tsx           # Main connection screen
│   │   ├── learn.tsx             # History & games
│   │   └── settings.tsx          # App settings
│   ├── pair/
│   │   ├── scan.tsx              # QR scanner
│   │   └── show.tsx              # Show QR code
│   ├── deck/
│   │   ├── index.tsx             # Deck list
│   │   ├── [id].tsx              # Edit deck
│   │   └── create.tsx            # New deck
│   ├── learn/
│   │   ├── timeline.tsx          # Historical timeline
│   │   ├── [topic].tsx           # Topic detail
│   │   └── games/
│   │       ├── morse.tsx         # Morse code game
│   │       ├── semaphore.tsx     # Semaphore game
│   │       └── cipher.tsx        # Cipher wheel
│   └── _layout.tsx               # Root layout
│
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── IconButton.tsx
│   │   └── Modal.tsx
│   ├── connect/
│   │   ├── DeckGrid.tsx          # 6-icon deck display
│   │   ├── SignalDisplay.tsx     # Incoming signal view
│   │   ├── TapArea.tsx           # Touch input area
│   │   ├── ConfirmButtons.tsx    # ✓ ? ✗ buttons
│   │   └── ConnectionStatus.tsx  # Pairing status
│   ├── learn/
│   │   ├── TimelineCard.tsx      # Historical item card
│   │   ├── MorseInput.tsx        # Morse code input
│   │   └── StegoDemo.tsx         # Steganography demo
│   └── feedback/
│       ├── PulseAnimation.tsx    # Confirmation pulse
│       ├── HapticFeedback.tsx    # Vibration patterns
│       └── SoundPlayer.tsx       # Audio feedback
│
├── services/
│   ├── connection/
│   │   ├── PeerService.ts        # WebRTC P2P logic
│   │   ├── SocketService.ts      # Socket.IO fallback
│   │   └── QRService.ts          # QR generation/scanning
│   ├── crypto/
│   │   ├── KeyExchange.ts        # X25519 key exchange
│   │   ├── Encryption.ts         # Message encryption
│   │   └── SessionManager.ts     # Session lifecycle
│   ├── storage/
│   │   ├── DeckStorage.ts        # Deck CRUD operations
│   │   ├── SessionStorage.ts     # Session persistence
│   │   └── ProgressStorage.ts    # Learning progress
│   └── signals/
│       ├── SignalEncoder.ts      # Encode signals
│       ├── SignalDecoder.ts      # Decode signals
│       └── PatternRecognizer.ts  # Gesture patterns
│
├── hooks/
│   ├── useConnection.ts          # Connection state
│   ├── useDeck.ts                # Deck management
│   ├── useSignals.ts             # Signal send/receive
│   ├── useHaptics.ts             # Haptic feedback
│   └── useLearning.ts            # Learning progress
│
├── constants/
│   ├── SignalTypes.ts            # Signal type definitions
│   ├── PresetDecks.ts            # Default deck packs
│   ├── HistoricalData.ts         # Timeline content
│   └── Theme.ts                  # Design tokens
│
├── types/
│   ├── deck.ts                   # Deck interfaces
│   ├── signal.ts                 # Signal interfaces
│   ├── session.ts                # Session interfaces
│   └── learning.ts               # Learning interfaces
│
├── utils/
│   ├── morse.ts                  # Morse code utilities
│   ├── steganography.ts          # Image encoding (edu)
│   └── patterns.ts               # Pattern matching
│
├── assets/
│   ├── icons/                    # Signal icons
│   ├── images/                   # UI images
│   └── sounds/                   # Audio feedback
│
├── server/                       # Optional relay server
│   ├── index.ts                  # Entry point
│   ├── socket.ts                 # Socket.IO handlers
│   └── sessions.ts               # Session management
│
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ Data Models

### TypeScript Interfaces

```typescript
// types/deck.ts
interface DeckEntry {
  id: string;
  iconId: string;           // emoji or custom icon ID
  gesture: GestureType;     // tap, double-tap, long-press, swipe, shake
  meaning: string;          // user-defined meaning
  color?: string;           // optional accent color
}

interface Deck {
  id: string;
  name: string;
  entries: DeckEntry[];     // max 6
  createdAt: number;
  updatedAt: number;
  isPreset: boolean;
}

type GestureType = 
  | 'tap' 
  | 'double-tap' 
  | 'long-press' 
  | 'swipe-left' 
  | 'swipe-right' 
  | 'swipe-up' 
  | 'swipe-down'
  | 'shake'
  | 'circle'
  | 'zigzag';

// types/session.ts
interface Session {
  id: string;               // 6-char alphanumeric
  ephemeralKey: string;     // derived session key (encrypted)
  participants: Participant[];
  activeDeckId: string;
  createdAt: number;
  expiresAt: number;        // TTL: 24 hours
  connectionType: 'p2p' | 'relay';
}

interface Participant {
  id: string;
  displayName?: string;
  publicKey: string;
  isConnected: boolean;
}

// types/signal.ts
interface Signal {
  id: string;
  sessionId: string;
  fromParticipantId: string;
  toParticipantId: string;
  type: SignalType;
  payload: SignalPayload;
  timestamp: number;
  confirmation?: ConfirmationStatus;
}

type SignalType = 
  | 'icon'          // emoji/shape from deck
  | 'tap-pattern'   // rhythm of taps
  | 'haptic'        // vibration pattern
  | 'light'         // screen flash pattern
  | 'gesture';      // drawn gesture

interface SignalPayload {
  deckEntryId?: string;     // if icon signal
  pattern?: number[];       // timing array [ms]
  gestureData?: GestureData;
}

type ConfirmationStatus = 'confirmed' | 'confused' | 'rejected' | 'pending';

// types/learning.ts
interface LearningModule {
  id: string;
  title: string;
  era: string;
  description: string;
  fullContent: string;
  imageUrl: string;
  hasGame: boolean;
  gameType?: 'morse' | 'semaphore' | 'cipher' | 'puzzle';
}

interface LearningProgress {
  moduleId: string;
  completed: boolean;
  bestScore?: number;
  attempts: number;
  lastAttemptAt?: number;
}
```

---

## 🔐 Security Implementation

### Key Exchange Flow
```
Device A                              Device B
   │                                      │
   │  1. Generate keypair (X25519)        │
   │  2. Create session ID                │
   │  3. Show QR (sessionId + publicKeyA) │
   │                                      │
   │           ◄── scan QR ───            │
   │                                      │
   │                          4. Generate keypair
   │                          5. Derive shared secret
   │                          6. Send publicKeyB
   │                                      │
   │          ◄── publicKeyB ───          │
   │                                      │
   │  7. Derive shared secret             │
   │  8. Both have identical sessionKey   │
   │                                      │
   └──────────────────────────────────────┘
   
All subsequent signals encrypted with sessionKey (AES-256-GCM)
```

### Privacy Checklist
- [x] No accounts required (ephemeral sessions)
- [x] All decks stored locally (encrypted)
- [x] Sessions auto-expire (24h TTL)
- [x] No server stores message content
- [x] Optional relay only sees encrypted blobs
- [x] No analytics without explicit opt-in
- [x] Camera/gesture data processed on-device only

---

## 📅 Hackathon Sprint Plan (7 Days)

### Day 1-2: Foundation
```
[ ] Project setup (Expo + TypeScript)
[ ] Basic navigation (tabs + stack)
[ ] UI component library (buttons, cards, modals)
[ ] Design tokens implementation
[ ] Local storage setup (AsyncStorage / SecureStore)
```

### Day 3: Connection Module
```
[ ] QR code generation & scanning
[ ] Basic session creation (local-only first)
[ ] Participant pairing UI
[ ] Connection status display
```

### Day 4: Core Signal Exchange
```
[ ] Deck creation UI (6-slot editor)
[ ] Preset deck packs
[ ] Tap area component
[ ] Signal encoding/decoding
[ ] Basic send/receive flow
```

### Day 5: Confirmation & Feedback
```
[ ] Mutual confirmation UI
[ ] Haptic feedback patterns
[ ] Visual pulse animations
[ ] Connection status indicators
[ ] Sound effects
```

### Day 6: Learn & Play Module
```
[ ] Timeline UI with historical cards
[ ] 6 historical code entries (content)
[ ] Morse code mini-game
[ ] Steganography demo (educational)
```

### Day 7: Polish & Demo
```
[ ] End-to-end testing
[ ] Bug fixes
[ ] Demo flow optimization
[ ] Presentation preparation
[ ] Video recording (backup)
```

---

## 🎮 Demo Script for Judges

### 2-Minute Demo Flow

1. **Opening (15s)**
   - Show both phones side by side
   - "Speak Without Words - communication beyond language"

2. **Pairing (20s)**
   - Generate QR on Phone A
   - Scan with Phone B
   - Show "Connected" animation

3. **Create Mini-Language (30s)**
   - Show preset deck selection
   - Customize one entry: 👁️ + double-tap = "I see danger"
   - Show deck synced on both devices

4. **Live Communication (45s)**
   - Person A: double-tap → sends 👁️
   - Person B: sees icon + meaning, taps "✓ Got it"
   - Both screens show pulse animation
   - Person B responds with different signal
   - Show the "mutual understanding" achieved without words

5. **Historical Context (20s)**
   - Switch to Learn tab
   - Quick scroll through timeline
   - "Throughout history, secrets traveled this way..."

6. **Closing (10s)**
   - "Two minds, one understanding, zero words"
   - Show both screens with matching confirmation

---

## 🚀 Quick Start Commands

```bash
# Initialize project
pnpm create expo-app speak-without-words --template expo-template-blank-typescript
cd speak-without-words

# Install core dependencies
pnpm add expo-router expo-haptics expo-camera expo-barcode-scanner
pnpm add react-native-reanimated react-native-gesture-handler
pnpm add @react-native-async-storage/async-storage
pnpm add expo-secure-store expo-crypto
pnpm add socket.io-client
pnpm add tweetnacl tweetnacl-util  # for crypto

# Install UI libraries
pnpm add react-native-paper
pnpm add react-native-qrcode-svg react-native-svg

# Dev dependencies
pnpm add -D @types/react @types/react-native

# Start development
pnpm start
```

---

## ✅ Success Criteria

| Criteria | Target |
|----------|--------|
| Two devices can pair | ✓ Works in <10 seconds |
| Signals transmit correctly | ✓ <500ms latency |
| Mutual confirmation works | ✓ Both users see feedback |
| Historical timeline loads | ✓ 6+ code systems |
| At least one mini-game | ✓ Morse decoder works |
| Works offline (P2P) | Stretch goal |
| Accessibility mode | Stretch goal |

---

## 🎯 Judging Alignment

### Theme Fit: "When words go quiet, meaning still finds a way"
- ✅ Zero-text communication between paired devices
- ✅ Visual, haptic, and pattern-based signals
- ✅ Historical exploration of wordless communication
- ✅ "Understanding isn't read—it's felt" = confirmation pulse

### Riddle 1: "Two minds sharing a secret"
- ✅ Ephemeral encrypted sessions
- ✅ Private shared dictionary
- ✅ Mutual confirmation = "know they understand"

### Riddle 2: "How have secrets traveled unseen"
- ✅ Interactive historical timeline
- ✅ Hands-on encoding games
- ✅ Educational steganography demo

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [TweetNaCl.js](https://tweetnacl.js.org/)
- [WebRTC for React Native](https://github.com/react-native-webrtc/react-native-webrtc)
- [Morse Code Reference](https://morsecode.world/)
- [History of Cryptography](https://www.britannica.com/topic/cryptology)
