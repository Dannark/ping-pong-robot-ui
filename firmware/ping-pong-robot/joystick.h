#ifndef JOYSTICK_H
#define JOYSTICK_H

#include "config.h"

void initJoystick();
void updateButton();
NavEvent readNavEvent();

extern bool swPressedEvent;
extern bool swLongPressEvent;

#endif
