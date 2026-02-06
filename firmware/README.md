# Ping Pong Robot – Firmware

Firmware for the ping-pong ball launcher robot. Controlled by a 0.96" TFT/OLED display, joystick, and (optionally) by the mobile app via HM-10 BLE.

---

## Robot hardware

### Controller and interface
- **Arduino Mega 2560** – main controller.
- **0.96" TFT/OLED display** (128×64) – I²C, address 0x3C (SSD1306 driver). Menu and visual feedback.
- **Analog joystick** – X/Y axes (A8, A9) and button (pin 52). Navigation and confirmation (short/long press).

### Motors and shield
- **Motor shield** (AFMotor-compatible) – 4 DC channels.
- **4× DC 130 motors**:
  - **M1, M2, M3** – launcher and spin. Angular positions on the wheel: M1 = 12 o’clock (0°), M2 = 4 o’clock (120°), M3 = 8 o’clock (240°). Speed and difference between them set spin direction and intensity.
  - **M4** – feeder: pushes balls through the vertical tube into the launcher.

### M4 motor (feeder) – gear reductions
M4 needs high torque to push balls along a long vertical path with clearance. It uses several reductions:

1. **First reduction** – yellow gearbox (common “car” type), **1:48**.
2. **Second stage** – in series on the same shaft: **1:3** and **1:4** (1:12 total for that stage).

Total reduction at the “propeller” (3-hole disc) shaft: **1:48 × 1:3 × 1:4 = 1:576**. The disc turns slowly with enough torque to feed the vertical tube.

### Servos
- **Servo 1 (TILT)** – pin 10. Tilt (up/down).
- **Servo 2 (PAN)** – pin 9. Horizontal aim (left/right).

Limits (MIN/MID/MAX) are configurable in the Settings screen and stored in EEPROM.

### Bluetooth (HM-10)
- **HM-10 module** (BLE) – connected to **Serial1** (TX pin 18, RX pin 19), **9600 baud**. Receives app commands (CONFIG/START/STOP, device name). Works with the **iOS/Android** app (BLE; no classic pairing required).

Wiring between Arduino Mega and HM-10. The module’s **RX** is 3.3 V; Arduino TX is 5 V, so use a voltage divider:

- **Arduino TX (pin 18)** → **1 kΩ** resistor to module **RX**; from that junction, **2 kΩ** to **GND**. Module RX sees ~3.3 V (5 V × 2k/(1k+2k)).
- **Module TX** → **Arduino RX (pin 19)**. HM-10 TX is 3.3 V; Mega RX accepts 3.3 V, so direct connection is fine.

Voltage divider (Arduino TX → module RX):

```
5V (Arduino pin 18 TX) ── 1k ──●── Module RX (HM-10 RXD)
                              │
                             2k
                              │
                             GND
```

Module TX (TXD) → Arduino pin 19 (RX) — direct.

---

## Firmware architecture

The project lives in `firmware/ping-pong-robot/`. A single sketch (.ino) pulls in several C++ modules.

### Main flow (`ping-pong-robot.ino`)

1. **setup()**  
   Initializes: Serial (debug), joystick, display, servos, motors, Bluetooth.

2. **loop()** (summary):
   - **processBTInput()** – reads Serial1, buffers lines, processes commands (START/STOP/CONFIG).
   - **updateButton()** – updates short/long press for the joystick button.
   - **updateRunningLogic()** – when `isRunning`, updates PAN/TILT (live or auto), servos, launcher motors (M1–M3) and feeder (M4); respects timer if set.
   - **updateAxisPreviewTargets()** – on PAN/TILT screens, updates target for auto/random preview.
   - **Long press** – from any screen (except Home) goes back to Home and stops motors if running.
   - **readNavEvent()** – reads joystick and emits NAV_UP/DOWN/LEFT/RIGHT (with debounce/repeat).
   - **Switch on `currentScreen`** – handles navigation and button per screen and calls the right `render*`.

### Modules

| File | Role |
|------|------|
| **config.h/cpp** | Defines (pins, display size, deadzone, etc.), enums (`Screen`, `NavEvent`, `AxisMode`, `FeederMode`, `SpinMode`), struct `Config` (pan/tilt, launcher, feeder, timer). Helpers for names and timers. |
| **utils.h/cpp** | `clampInt`, `clampFloat`, `joyToNorm` (analog → -1..1), `applyIncremental` (aim adjustment with stick). |
| **joystick.h/cpp** | `initJoystick`, `updateButton` (short/long press), `readNavEvent` (D-pad from JOY_X/JOY_Y). |
| **display.h/cpp** | OLED init, `drawHeader`, `drawMiniRadar`, `drawSpinVisualizer`, `drawFeederModeGraph`, `drawFeederRotor`. |
| **servos.h/cpp** | Init, `updateServos(panNorm, tiltNorm)` (maps -1..1 to angles with MIN/MID/MAX), load/save servo limits to EEPROM. |
| **motors.h/cpp** | Init of 4 motors (AF_DCMotor). `updateLauncherMotors(power, spinMode, spinIntensity)` (M1–M3 with spin by angle), `updateFeederMotor(speed, mode, customOnMs, customOffMs)` (M4 continuous or pulsed). `stopAllMotors`, `runSingleMotor` (Settings test), cache to avoid unnecessary writes. |
| **logic.h/cpp** | Global state (screens, menu indices, `cfg`, `isRunning`, etc.). Auto logic: AUTO1 (continuous speed), AUTO2 (step + pause), RANDOM (random target + pause). `updateRunningLogic()` applies pan/tilt (live or auto), updates servos and motors. `startRunning()` starts at reduced speed and ramps on next loop. |
| **screens.h/cpp** | `render*` functions for each screen: Home, Info, Wizard, Pan, Tilt, Launcher, Spin, Feeder, Timer, Running, Settings, Settings Servo, Settings Motor, Pan/Tilt Edit. |
| **bt_command.h/cpp** | `initBTCommand` (Serial1 9600), `processBTInput`. Line-based protocol: `S`/`START` = start, `P`/`STOP` = stop and go to Home, `C,<26 ints>` = apply config (panMode, tiltMode, targets, limits, launcher, feeder, timer, etc.). |

### Screens (enum `Screen`)

- **HOME** – Start Wizard, Info, Settings.
- **WIZARD** – Pan, Tilt, Launcher, Feeder, Timer, START (enters Running).
- **PAN / TILT** – Mode (LIVE, AUTO1, AUTO2, RANDOM), parameters (speed/step/min/max/pause), “Edit Target” in LIVE, Back.
- **PAN_EDIT / TILT_EDIT** – Adjust target with joystick in real time; servos follow.
- **LAUNCHER** – Power (0–255), Spin Config, Back.
- **SPIN** – Direction (N/NE/E/…/NONE), Intensity (0–512; >255 allows one motor in reverse), Back.
- **FEEDER** – Mode (CONT, P1/1, P2/1, P2/2, CUSTOM), Speed, On/Off for CUSTOM, Back.
- **TIMER** – OFF, 15s, 30s, 1m, 2m, 5m, Back.
- **RUNNING** – Shows state (timer, pan/tilt, power, spin); short press goes back to Wizard and stops.
- **INFO** – Version and “Max played” in seconds.
- **SETTINGS** – Servo 1, Servo 2, M1, M2, M3, M4 (individual test), Back.
- **SETTINGS_SERVO** – Adjust MIN/MID/MAX for selected servo; Back saves to EEPROM.
- **SETTINGS_MOTOR** – Test one motor (M1–M4) with speed bar.

### Config and Bluetooth

The `Config` struct holds all training parameters (pan/tilt, launcher, spin, feeder, timer). It is not stored in EEPROM in the current firmware; only servo limits are. The app can send a line `C,<26 values>` to sync the full config before sending START.

---

## Build and upload

1. Open `firmware/ping-pong-robot/ping-pong-robot.ino` in Arduino IDE (or PlatformIO).
2. Board: **Arduino Mega 2560**.
3. Install libraries: **Adafruit GFX**, **Adafruit SSD1306**, **AFMotor** (or the **AFMotor_R4** variant used in the code).
4. Build and upload to the Mega.

---

## Mobile app

The React Native app in the `mobile/` folder connects to the robot over Bluetooth and sends the same config and commands (CONFIG/START/STOP). Full app documentation: **`../mobile/README.md`**.
