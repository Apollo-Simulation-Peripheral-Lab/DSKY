/* Derived from https://github.com/adafruit/Adafruit_ILI9341 */
/***************************************************
  This is our GFX example for the Adafruit ILI9341 Breakout and Shield
  ----> http://www.adafruit.com/products/1651

  Check out the links above for our tutorials and wiring diagrams
  These displays use SPI to communicate, 4 or 5 pins are required to
  interface (RST is optional)
  Adafruit invests time and resources providing this open source code,
  please support Adafruit and open-source hardware by purchasing
  products from Adafruit!

  Written by Limor Fried/Ladyada for Adafruit Industries.
  MIT license, all text above must be included in any redistribution
 ****************************************************/

// 480x320 hxw
// EL panel is 4.42x2.62in
// COMP acty is 0.88x0x88, pos @ 0.13, 0.18
// each digit block is 0.375in wide
// each digit within the block is 0.32in wide, neglecting skew, and 0.5in tall

// 108.60ppi in Y, 122.14ppi in X
// digit block is 46px wide
// digit is 39px wide
// digit is 54px tall

#include "SPI.h"
#include "Adafruit_GFX.h"
#include "Adafruit_ILI9488.h"
#include "main.h"
#include "Fonts/FreeMonoBoldOblique18pt7b.h"
#include "Fonts/FreeSansBold9pt7b.h"
#include "DSKY.h"

#define BITBANG 0

// Configuration for the Arduino Uno
#define TFT_RST 3
#define TFT_DC 2
#define TFT_CS 10

#if BITBANG == 1
#define TFT_MOSI 11
#define TFT_MISO 12
#define TFT_CLK 13
#endif
// Use hardware SPI (on Uno, #13, #12, #11) and the above for CS/DC
// If using the breakout, change pins as desired

void setup() {
  Serial.begin(9600);

  DSKY_init(TFT_CS, TFT_DC, TFT_RST);

}

void loop(void) {
  static int8_t index = 0;

  if(index >= 100){
    index = 0;
    for(int i = 0; i < 6; i++){
        DSKY_unitTest_blink();
    }
  }
  else{
    for(int i = 0; i < 6; i++){
      setChar(i, index++);
      delay(100);
    }

    delay(100);
  }
}