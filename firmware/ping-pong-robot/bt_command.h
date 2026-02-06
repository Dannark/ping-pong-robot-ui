#ifndef BT_COMMAND_H
#define BT_COMMAND_H

#include "config.h"

// BT state is owned only by this module. Screens/display must only READ via getBtConnected()
// and getBtDeviceName(). State is updated on: (1) receiving "N,name" from app -> connected,
// (2) updateBTState() -> sets connected when STATE pin HIGH. Robot never clears connected state.

#define BT_SERIAL Serial1
#define BT_BAUD 9600
#define BT_LINE_BUF_SIZE 256

#define BT_AT_INIT_AT_STARTUP 1

void initBTCommand();
void processBTInput();
void updateBTState();

bool getBtConnected(void);
const char* getBtDeviceName();

void notifyLiveAimToApp(float pan, float tilt);

#endif
