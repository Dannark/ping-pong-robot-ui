# Ping Pong Robot

Robot that launches ping-pong balls, with a 3D-printed design, Arduino Mega, and interface via display + joystick and/or Android app over Bluetooth.

**Repository:** [github.com/Dannark/ping-pong-robot-ui](https://github.com/Dannark/ping-pong-robot-ui)

---

## About the project

The robot is built from **3D-printed** parts, with a focus on **low cost** and **modularity**: you can swap parts, reprint and adapt as needed. Most of the assembly is **snap-fit**, with minimal use of screws — only **M2×6 or M2×8** to fix the extra gearbox of the feeder motor.

### Why DC 130 motors?

The goal was to use **simple DC 130 motors**: despite being weak and underrated, they are light, cheap and easy to find. The project tries to **optimize launch performance** with them. Brushless motors would likely give better spin more easily, but the challenge here was to get similar performance with something **cheap and functional**. The DC 130s have enough power for:

- **Medium/strong straight shots**
- **Strong spin**, at the cost of some final range (less power on the shot)

The motors are rated for 6 V, but in this project **they work better at 7.5 V or 9 V** — enough to avoid burning them right away. **Note:** some low-quality DC 130s **are not compatible** with Arduino motor shields and only run when powered directly off the shield. It’s worth buying **quality DC 130 motors** (like those from Arduino wheel kits with gearbox).

### Why not a stepper on the feeder?

A stepper was used on the feeder at first, but it was slow and used **two shield channels (M3 and M4)**. Fine step control wasn’t that useful: what mattered was feeding the launcher with enough torque as fast as possible without jamming. With a **plain DC 130** on the feeder, you can set much higher speeds (configurable with more or less gearing or speed in software), which **increases balls per minute** and frees **three motors for the launcher only**, allowing **spin in all directions** (back, top, sides and diagonals).

### Performance

Shots are **stable**. At **7.5 V**, the rate is around **65–69 balls per minute**. Both the **display** UI and the **app** are highly customizable: servo limits, feeder frequency, pan/tilt randomization and other independent options. Overall the robot has **consistent, good performance**, with enough power to return medium and slow balls — not ultra-fast ones.

---

## Hardware

### Required

| Item | Notes |
|------|--------|
| **Arduino Mega 2560** | Main controller. |
| **Motor shield** | AFMotor-compatible (e.g. L293D). V1 is not a strict requirement; it’s what was used. |
| **4× DC 130 motors** | One **with 1:48 gearbox** (yellow double-shaft type; one shaft is cut) — that’s the **feeder** motor. The other three are for the **launcher** (spin). Prefer quality motors that work with the shield. |
| **7× 6700zz bearings** | Four on the launcher head (pan/tilt) to reduce friction; three in the feeder (two in the M4 motor reduction, one on the feeder itself). |
| **EVA sheet** | For the friction wheels. |
| **Flexible filament** (recommended) | For printing the wheels. |
| **2× servo extension cable (15 cm)** | To connect the pan and tilt servos to the Arduino. |

### Interface (at least one)

Without an interface you can’t control the robot. You need **one** of the following (or both):

| Option | Items |
|--------|--------|
| **Display + joystick** | **0.96" OLED** display (128×64, I²C) + analog **joystick**. Menu on display, navigation with joystick. |
| **Bluetooth** | **HM-10** (BLE) module. Control via **iOS/Android app**. |

### Optional

- **2 servos** for launcher head pan and tilt.
- **Display + joystick** and **Bluetooth** together: use the robot from the display or from the app.

---

## Repository structure and documentation

This repository contains the **firmware** (Arduino) and the **mobile app** (React Native). Each has its own README with hardware, protocol and usage details.

| Folder | Contents | Documentation |
|--------|----------|---------------|
| **[firmware/](firmware/)** | Arduino Mega code: display, joystick, motors, servos, Bluetooth. Pinout, modules, display screens, HM-10 wiring (with diagram). | **[firmware/README.md](firmware/README.md)** — firmware and robot hardware guide |
| **[mobile/](mobile/)** | iOS/Android app (React Native): BLE connection, protocol (CONFIG/START/STOP), screens, differences from the display. | **[mobile/README.md](mobile/README.md)** — app and robot communication guide |

Suggested reading order:

1. **Start with [firmware/README.md](firmware/README.md)** — full hardware (motors, M4 reductions, display, joystick, Bluetooth diagram), firmware architecture, and how to build/upload.
2. **Then [mobile/README.md](mobile/README.md)** — how the app connects to the Arduino, command format, screens, and app-specific behavior (presets, spin “random” in the UI, etc.).

---

## License and contributing

Open project. To contribute or report issues, use the repository: [github.com/Dannark/ping-pong-robot-ui](https://github.com/Dannark/ping-pong-robot-ui).
