#ifndef CONFIG_H
#define CONFIG_H

// ================= OLED =================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_ADDR 0x3C

// ================= Joystick =================
#define JOY_X A8
#define JOY_Y A9
#define JOY_SW 52

// ================= Layout =================
#define BODY_Y 16

// ================= Input tuning =================
#define DEADZONE 70
#define REPEAT_MS 140

// incremental aim tuning
#define AIM_STEP 0.025f
#define AIM_FAST 2.8f

// ================= UI States =================
enum Screen {
  SCREEN_HOME = 0,
  SCREEN_WIZARD,
  SCREEN_PAN,
  SCREEN_TILT,
  SCREEN_LAUNCHER,
  SCREEN_FEEDER,
  SCREEN_TIMER,
  SCREEN_RUNNING,
  SCREEN_INFO,

  SCREEN_PAN_EDIT,
  SCREEN_TILT_EDIT
};

// ================= D-Pad events =================
enum NavEvent { NAV_NONE, NAV_UP, NAV_DOWN, NAV_LEFT, NAV_RIGHT };

// ================= Config enums =================
enum AxisMode {
  AXIS_LIVE = 0,
  AXIS_AUTO1,
  AXIS_AUTO2,
  AXIS_RANDOM,
  AXIS_MODE_COUNT
};

enum FeederMode {
  FEED_CONTINUOUS = 0,
  FEED_PULSE_1_1,
  FEED_PULSE_2_2,
  FEED_MODE_COUNT
};

enum SpinMode {
  SPIN_NONE = 0,
  SPIN_TOP,
  SPIN_BACK,
  SPIN_LEFT,
  SPIN_RIGHT,
  SPIN_MODE_COUNT
};

// ================= Config =================
struct Config {
  AxisMode panMode = AXIS_LIVE;
  AxisMode tiltMode = AXIS_LIVE;

  float panTarget = 0.0f;
  float tiltTarget = 0.0f;

  // AUTO1 speed per tick (0.005 .. 0.08)
  float panAuto1Speed = 0.035f;
  float tiltAuto1Speed = 0.035f;

  // AUTO2 step size (0.05 .. 0.5)
  float panAuto2Step = 0.25f;
  float tiltAuto2Step = 0.25f;

  int launcherPower = 200;  // 0..255
  SpinMode spinMode = SPIN_NONE;

  int feederSpeed = 80;     // 0..255
  FeederMode feederMode = FEED_CONTINUOUS;

  // 0=OFF, 1=15s, 2=30s, 3=1m, 4=2m, 5=5m
  int timerIndex = 0;
};

// ================= Name helpers =================
const char* axisModeName(AxisMode m);
const char* feederModeLabel(FeederMode m);
const char* spinModeName(SpinMode s);

// ================= Timer helpers =================
const char* timerNameByIndex(int idx);
unsigned long timerMsByIndex(int idx);

#endif
