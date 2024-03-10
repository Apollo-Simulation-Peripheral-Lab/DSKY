#ifndef __MAIN_H_
#define __MAIN_H_

#include <stdint.h>

unsigned long testFillScreen(void);
unsigned long testText(void);
unsigned long testLines(uint16_t color);
unsigned long testFastLines(uint16_t color1, uint16_t color2);
unsigned long testRects(uint16_t color);
unsigned long testFilledRects(uint16_t color1, uint16_t color2);
unsigned long testFilledCircles(uint8_t radius, uint16_t color);
unsigned long testCircles(uint8_t radius, uint16_t color);
unsigned long testTriangles(void);
unsigned long testFilledTriangles(void);
unsigned long testRoundRects(void);
unsigned long testFilledRoundRects(void);

#endif // __MAIN_H_