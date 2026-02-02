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
  SCREEN_SPIN,
  SCREEN_FEEDER,
  SCREEN_TIMER,
  SCREEN_RUNNING,
  SCREEN_INFO,
  SCREEN_SETTINGS,
  SCREEN_SETTINGS_SERVO,
  SCREEN_SETTINGS_MOTOR,

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

// 0°=N(12h), 90°=E(3h), 180°=S(6h), 270°=W(9h)
enum SpinMode {
  SPIN_NONE = 0,
  SPIN_N,    // 0°
  SPIN_NE,   // 45°
  SPIN_E,    // 90° (3h)
  SPIN_SE,   // 135° (4h)
  SPIN_S,    // 180°
  SPIN_SW,   // 225° (8h)
  SPIN_W,    // 270° (9h)
  SPIN_NW,   // 315°
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

  int launcherPower = 255;  // 0..255 - velocidade máxima dos motores
  SpinMode spinMode = SPIN_NONE;
  int spinIntensity = 255;  // 0..512 - >255 permite valores "negativos" (motor em REVERSE)

  int feederSpeed = 160;    // 0..255 - 6V: 80 insuficiente, 160 adequado
  FeederMode feederMode = FEED_CONTINUOUS;

  // 0=OFF, 1=15s, 2=30s, 3=1m, 4=2m, 5=5m
  int timerIndex = 0;
};

// ================= Name helpers =================
const char* axisModeName(AxisMode m);
const char* feederModeLabel(FeederMode m);
const char* spinModeName(SpinMode s);
int spinModeToAngleDeg(SpinMode s);  // -1 se NONE, senão 0..315

// ================= Timer helpers =================
const char* timerNameByIndex(int idx);
unsigned long timerMsByIndex(int idx);

#endif
