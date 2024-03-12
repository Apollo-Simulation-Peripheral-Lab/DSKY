#ifndef __DSKY_H_
#define __DSKY_H_

#define TFT_RST 3
#define TFT_DC 2
#define TFT_CS 10

#include <stdint.h>

typedef enum RegisterSign {
    UNSIGNED,
    POS,
    NEG
};


void DSKY_init(int8_t CS, int8_t DC, int8_t RST);
void writeProg(int8_t progNumber);
void writeVerb(int8_t verbNumber);
void writeNoun(int8_t nounNumber);
void writeRegister(uint8_t index, uint32_t value, RegisterSign sign);
void DSKY_unitTest_blink(void);

#endif // __DSKY_H_