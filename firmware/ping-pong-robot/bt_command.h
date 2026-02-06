#ifndef BT_COMMAND_H
#define BT_COMMAND_H

#include "config.h"

// Serial1 (pin 18 TX, 19 RX) - HM-10 UART (1k+2k divider on TX -> module RX)
#define BT_SERIAL Serial1
#define BT_BAUD 9600

#define BT_LINE_BUF_SIZE 256

// DSD TECH / Keyes HM-10: AT format is "without \r or \n" per datasheet.
// AT+RENEW = factory restore, AT+RESET = reboot. Run at startup so module advertises.
#define BT_AT_INIT_AT_STARTUP 1

void initBTCommand();
void processBTInput();

// Call each loop; reads STATE pin (HM-10 connection status)
void updateBTState();

// TRUE when STATE pin is HIGH (BLE device connected)
extern bool btConnected;

// Device name sent by app (N,name); empty if never set
extern char btDeviceName[BT_DEVICE_NAME_LEN + 1];
const char* getBtDeviceName();

#endif
