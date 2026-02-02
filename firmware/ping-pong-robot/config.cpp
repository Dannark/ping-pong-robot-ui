#include "config.h"

const char* axisModeName(AxisMode m) {
  switch (m) {
    case AXIS_LIVE: return "LIVE";
    case AXIS_AUTO1: return "AUTO1";
    case AXIS_AUTO2: return "AUTO2";
    case AXIS_RANDOM: return "RANDOM";
    default: return "?";
  }
}

const char* feederModeLabel(FeederMode m) {
  switch (m) {
    case FEED_CONTINUOUS: return "CONT";
    case FEED_PULSE_1_1:  return "P1/1";
    case FEED_PULSE_2_2:  return "P2/2";
    default: return "?";
  }
}

const char* spinModeName(SpinMode s) {
  switch (s) {
    case SPIN_NONE: return "NONE";
    case SPIN_N:    return "N";
    case SPIN_NE:   return "NE";
    case SPIN_E:    return "E";
    case SPIN_SE:   return "SE";
    case SPIN_S:    return "S";
    case SPIN_SW:   return "SW";
    case SPIN_W:    return "W";
    case SPIN_NW:   return "NW";
    default: return "?";
  }
}

int spinModeToAngleDeg(SpinMode s) {
  switch (s) {
    case SPIN_NONE: return -1;
    case SPIN_N:    return 0;
    case SPIN_NE:   return 45;
    case SPIN_E:    return 90;
    case SPIN_SE:   return 135;
    case SPIN_S:    return 180;
    case SPIN_SW:   return 225;
    case SPIN_W:    return 270;
    case SPIN_NW:   return 315;
    default: return -1;
  }
}

const char* timerNameByIndex(int idx) {
  switch (idx) {
    case 0: return "OFF";
    case 1: return "15s";
    case 2: return "30s";
    case 3: return "1m";
    case 4: return "2m";
    case 5: return "5m";
    default: return "?";
  }
}

unsigned long timerMsByIndex(int idx) {
  switch (idx) {
    case 0: return 0;
    case 1: return 15000UL;
    case 2: return 30000UL;
    case 3: return 60000UL;
    case 4: return 120000UL;
    case 5: return 300000UL;
    default: return 0;
  }
}
