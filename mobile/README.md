# Ping Pong Robot – Mobile App

React Native app that controls the ping-pong robot via **BLE** (HM-10 module). It replicates and extends the TFT display experience with a richer, more intuitive UI.

**Platform:** **iOS and Android** (Bluetooth Low Energy).

---

## Connecting to the robot

### Requirements
- **iOS or Android** device with Bluetooth.
- **Robot powered on** with **HM-10** module (BLE). No prior pairing needed; the app scans for BLE devices.
- **Permissions:** Bluetooth and (on Android 12+) `BLUETOOTH_SCAN` / `BLUETOOTH_CONNECT`. The app requests them at runtime.

### App flow
1. **Home** → tap **Connect**.
2. **Connect** screen starts a **BLE scan** and lists discovered devices (e.g. SpinRobot / HM-10).
3. User taps a device → `setBLETargetDevice(device)` and `dataSource.connect()`. The app connects via BLE, discovers services/characteristics, then sends the device name (`N,<name>\n`) so the robot display shows “connected”.
4. Once connected, status shows “Connected” and the app can send **CONFIG**, **START**, and **STOP**.

### Library
- **react-native-ble-plx**. Write to HM-10 characteristic (0xFFE1); line-based protocol with `\n`, UTF-8. The robot does not send data back; the app only sends commands.

---

## Communication protocol (app → Arduino)

Everything is **text, line-based** (terminator `\n`). The Arduino **does not send replies**; the app only sends commands and assumes they were received.

### Commands

| Command | Format | Effect on robot |
|--------|--------|-------------------|
| **Device name** | `N,<name>\n` | Sent after BLE connect; robot shows “connected” and the name on the display (max 24 chars). |
| **Start** | `S\n` or `START\n` | Calls `startRunning()`: starts motors at reduced speed and goes to RUNNING screen. |
| **Stop** | `P\n` or `STOP\n` | Stops all motors, `isRunning = false`, `currentScreen = SCREEN_HOME`. |
| **Config** | `C,v0,v1,...,v25\n` | Updates the robot `Config` struct with 26 integers (fixed order). |

### Config line format (`C,...`)

26 comma-separated integers in the order below. Float values in the app are sent × 1000 (integer).

| Index | Meaning on Arduino | Example (app → Arduino) |
|-------|--------------------|-------------------------|
| 0 | panMode (0=LIVE, 1=AUTO1, 2=AUTO2, 3=RANDOM) | 0 |
| 1 | tiltMode | 0 |
| 2 | panTarget × 1000 | 0 |
| 3 | tiltTarget × 1000 | 0 |
| 4–7 | panMin, panMax, tiltMin, tiltMax × 1000 | -1000, 1000, -1000, 1000 |
| 8 | panAuto1Speed × 1000 | 35 |
| 9 | panAuto2Step × 1000 | 250 |
| 10 | panAuto2PauseMs | 1000 |
| 11 | tiltAuto1Speed × 1000 | 35 |
| 12 | tiltAuto2Step × 1000 | 250 |
| 13 | tiltAuto2PauseMs | 1000 |
| 14 | panRandomMinDist × 1000 | 200 |
| 15 | panRandomPauseMs | 1500 |
| 16 | tiltRandomMinDist × 1000 | 200 |
| 17 | tiltRandomPauseMs | 1500 |
| 18 | launcherPower (0–255) | 255 |
| 19 | spinMode (0=NONE, 1=N, 2=NE, … 9=NW) | 0 |
| 20 | spinIntensity (0–512) | 255 |
| 21 | feederMode (0=CONT, 1=P1/1, 2=P2/1, 3=P2/2, 4=CUSTOM) | 0 |
| 22 | feederSpeed (0–255) | 200 |
| 23 | feederCustomOnMs | 1500 |
| 24 | feederCustomOffMs | 750 |
| 25 | timerIndex (0=OFF, 1=15s, … 5=5m) | 0 |

Line generation in the app is in **`src/data/btProtocol.ts`**: `getDeviceNameCommand(name)`, `configToConfigLine(config)`, `getStartCommand()`, `getStopCommand()`.

---

## How the Arduino interprets and “replies”

- **There is no reply channel.** The Arduino only reads from `Serial1` in `loop()` inside `processBTInput()`.
- It buffers characters until `\n` or `\r`, builds a line and calls `processLine()`:
  - **S** or **START** → `startRunning()` (enters RUNNING and starts motors).
  - **P** or **STOP** → stops motors and goes to `SCREEN_HOME`.
  - **C,v0,...,v25** → fills `cfg` (global struct), with value clamping.
- Real state (screens, motors, timer) lives only on the Arduino. The app keeps a local “mirror” (config + run state) for UI and timer; if the connection drops, the robot keeps the last config until it receives STOP or is powered off.

---

## App architecture (summary)

- **MVVM** per screen: `index.tsx` (container), `*.viewModel.ts` (logic), `*.view.tsx` (UI). Repositories for data; no direct API calls in the viewModel.
- **Navigation:** `RootStack.tsx` – stack with screens: Home, Connect, Wizard, Pan, Tilt, Launcher, Feeder, Timer, Running, TrainingComplete, Info, Settings, SettingsServoTilt, SettingsServoPan, SettingsMotorTest.

### Data layer

| Artifact | Role |
|----------|------|
| **RobotConfig** / **DEFAULT_CONFIG** | Type and default values for config (pan, tilt, launcher, spin, feeder, timer). |
| **RobotConfigRepository** | In-memory config; `getConfig`, `setConfig(partial)`, `subscribe`. Used by Wizard and adjustment screens. |
| **RobotConnectionDataSource** | Interface: `connect`, `disconnect`, `sendConfig`, `start`, `stop`, connection state. |
| **BLERobotConnectionDataSource** | Real implementation: uses `react-native-ble-plx`, `setBLETargetDevice`, `write(line)` to HM-10 characteristic. |
| **RobotConnectionRepository** | `startRun(config)` = `sendConfig(config)` + `start()`; `stopRun()` = `stop()`; holds `runStartTime` and `runConfig` for Running/TrainingComplete. |
| **btProtocol.ts** | `configToConfigLine`, `getStartCommand`, `getStopCommand` – exact line generation sent to the Arduino. |
| **PresetsRepository** | Wizard presets (AsyncStorage); load/save/delete; not present on the Arduino. |
| **HardwareSettingsRepository** (servos) | Servo limits (min/mid/max) in the app via AsyncStorage; **not sent to the Arduino**. On the robot, limits are adjusted on the display and stored in EEPROM. |

### “Start” flow from the app

1. User taps **Start** on **Wizard**.
2. `RobotConnectionRepository.startRun(config)`:
   - `dataSource.sendConfig(config)` → sends `C,<26 values>\n`.
   - `dataSource.start()` → sends `S\n`.
3. Navigate to **Running**; repository stores `runStartTime` and `runConfig`.
4. On **Running**, the app shows elapsed/remaining time and can call `stopRun()` (sends `P\n`) and go back.

---

## Main screens and Arduino equivalence

| App | Arduino (display) | Note |
|-----|-------------------|------|
| **Home** | HOME | App has cards: Connect, Start Wizard, Info, Settings. |
| **Connect** | — | App only: scan BLE devices and connect to HM-10. |
| **Wizard** | WIZARD | Pan, Tilt, Launcher, Feeder, Timer + Start. Rich visual preview (Aim, Feeder, Spin). |
| **Pan / Tilt** | SCREEN_PAN / SCREEN_TILT | Same modes (LIVE, AUTO1, AUTO2, RANDOM) and parameters. App has sliders/inputs; Arduino uses joystick. |
| **Launcher** | SCREEN_LAUNCHER + SCREEN_SPIN | Power and spin (direction + intensity). |
| **Feeder** | SCREEN_FEEDER | Modes and speed; CUSTOM with on/off in ms. |
| **Timer** | SCREEN_TIMER | OFF, 15s, 30s, 1m, 2m, 5m. |
| **Running** | SCREEN_RUNNING | App shows time, current config, previews; Stop button sends `P\n`. |
| **TrainingComplete** | — | App only: screen when timer ends (vibration/notification optional). |
| **Settings** | SCREEN_SETTINGS | Servo Tilt/Pan, M1–M4 test. Servo limits in the app stay in the app (AsyncStorage); on the robot they are in EEPROM. |
| **Info** | SCREEN_INFO | Version / stats. |

---

## Important differences (app vs Arduino)

1. **Spin “Random”**  
   The app has **spinRandom** and **spinRandomIntervalSec**. The protocol sends **only one spin direction** (field 19). The Arduino keeps that direction fixed. “Random” in the app is **visual only**: every N seconds the app changes the direction shown in the UI; the robot **does not** receive spin updates during the run. For truly random spin on the robot you would need to send new `C,...` lines periodically (not implemented).

2. **Timer and end of session**  
   The Arduino uses `timerMsByIndex` and stops by itself when the time is reached, going back to HOME. The app also computes remaining time; when it hits zero it can trigger notification/vibration (if enabled) and call `stopRun()`, then navigate to **TrainingComplete**.

3. **Servo limits**  
   On the Arduino: edited on the Settings screen and saved to EEPROM. In the app: **HardwareSettingsRepository** (ServoTilt/ServoPan) persists to AsyncStorage; **these values are not sent to the robot**. Two independent sources of truth.

4. **Presets**  
   App only (PresetsRepository, Wizard menu “Save/Load preset”). The Arduino does not know about presets.

5. **Connection**  
   The app must be connected for Start/Stop/Config to take effect. The robot’s display and joystick work without the app.

---

## What you need to connect to the robot

- **iOS or Android** with Bluetooth.
- App granted **Bluetooth** (and location on Android if required for BLE scan).
- Robot on with **HM-10** powered (BLE advertising).
- **Recommended order:** 1) Connect (Connect screen, select the robot in the list); 2) Configure in Wizard; 3) Start (sends config + start). To stop: Stop on Running screen or on the robot (long press to Home).

---

## Quick reference for contributors and agents

- **Protocol:** Lines ending with `\n`. Commands: `S`, `P`, `C,<26 ints>`. Generation code: `src/data/btProtocol.ts`.
- **Connection:** `src/data/BLERobotConnectionDataSource.ts` and `src/screens/Connect/`.
- **Global training config:** `RobotConfigRepository` + `RobotConfig` in `src/data/RobotConfig.ts`.
- **Run start/stop:** `RobotConnectionRepository.startRun` / `stopRun`; Wizard and Running screens.
- **Differences from firmware:** spinRandom only in app UI; servo limits not synced; presets and TrainingComplete only in app; Arduino never sends data back.

Hardware and firmware documentation (including HM-10 diagram): **`../firmware/README.md`**.

---

## Building on iOS

If `yarn ios` fails with **xcodebuild exited with error code 70**:

1. **Clean and reinstall**
   ```bash
   cd ios
   rm -rf build Pods Podfile.lock
   cd ..
   yarn install
   cd ios && pod install && cd ..
   ```

2. **Clear Xcode DerivedData**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

3. **Try building for simulator** (to see the real error in the log)
   ```bash
   yarn ios --simulator="iPhone 16"
   ```
   If the simulator build works, the issue may be device-specific (e.g. signing or stale device UDID).

4. **Build from Xcode** to get detailed errors: open `ios/PingPongRobotApp.xcworkspace` in Xcode, select your device/simulator, and run (⌘R). Check the Report navigator for the failing step.
