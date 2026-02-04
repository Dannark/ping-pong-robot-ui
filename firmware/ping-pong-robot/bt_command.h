#ifndef BT_COMMAND_H
#define BT_COMMAND_H

#include "config.h"

// Serial1 (pinos 18 TX, 19 RX) - mesmo esquema do bt_pairing_test (1k+2k no TX->RXD do HC-05)
#define BT_SERIAL Serial1
#define BT_BAUD 9600

// Buffer para uma linha de comando (ex: CONFIG:0,0,... ou START)
#define BT_LINE_BUF_SIZE 256

// Chama no setup() para inicializar Serial1
void initBTCommand();

// Chama no loop(); lê dados do BT, acumula linha e executa comando (CONFIG/START/STOP)
void processBTInput();

#endif
