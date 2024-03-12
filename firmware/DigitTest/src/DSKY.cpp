#include "DSKY.h"
#include "Fonts/FreeMonoBoldOblique18pt7b.h"
#include "Fonts/FreeSansBold9pt7b.h"
#include "Adafruit_GFX.h"
#include "Adafruit_ILI9488.h"

#define FULLBLANK;

Adafruit_ILI9488* tft;

void DSKY_init(int8_t CS, int8_t DC, int8_t RST)
{
    tft = new Adafruit_ILI9488(CS, DC, RST);
    tft->begin();

    // read diagnostics (optional but can help debug problems)
    uint8_t x = tft->readcommand8(ILI9488_RDMODE);
    Serial.print("Display Power Mode: 0x"); Serial.println(x, HEX);
    x = tft->readcommand8(ILI9488_RDMADCTL);
    Serial.print("MADCTL Mode: 0x"); Serial.println(x, HEX);
    x = tft->readcommand8(ILI9488_RDPIXFMT);
    Serial.print("Pixel Format: 0x"); Serial.println(x, HEX);
    x = tft->readcommand8(ILI9488_RDIMGFMT);
    Serial.print("Image Format: 0x"); Serial.println(x, HEX);
    x = tft->readcommand8(ILI9488_RDSELFDIAG);
    Serial.print("Self Diagnostic: 0x"); Serial.println(x, HEX); 

    Serial.println("DSKY: Blanking Display");
    tft->fillScreen(ILI9488_BLACK);
    yield();
    delay(500);

    tft->setRotation(1);

    // COMP ACTY light


    // PROG, VERB, NOUN
    tft->setFont(&FreeSansBold9pt7b);
    tft->setTextColor(0);  tft->setTextSize(1);

    // PROG
    tft->fillRect(180, 10, 88, 30, 0x2D60);
    tft->setCursor(197,30);
    tft->print("PROG");

    // VERB
    tft->fillRect(10, 110, 88, 30, 0x2D60);
    tft->setCursor(28,130);
    tft->print("VERB");

    // NOUN
    tft->fillRect(180, 110, 88, 30, 0x2D60);
    tft->setCursor(196,130);
    tft->print("NOUN");


    // PVN VALUES, R1, 2, 3
    tft->setFont(&FreeMonoBoldOblique18pt7b);
    tft->setTextColor(0x2D60);  tft->setTextSize(2);

    // PROG 88
    tft->setCursor(10, 98);
    tft->print("    88");

    // VERB 88, NOUN 88
    tft->setCursor(10, 200);
    tft->print("88  88");

    // R1, R2, R3 +88888
    tft->setCursor(10, 280);
    tft->print("+88888");
    tft->setCursor(10, 360);
    tft->print("+88888");
    tft->setCursor(10, 440);
    tft->print("+88888");

    return;
}

void DSKY_unitTest_blink(void) {
    static bool set = false;
    tft->fillRect(10, 10, 88, 88, 0x2D60*(int)set);
    tft->setFont(&FreeSansBold9pt7b);  tft->setTextSize(1);
    tft->setTextColor(0);
    tft->setCursor(26,45);
    tft->print("COMP");
    tft->setCursor(28,65);
    tft->print("ACTY");
    
    tft->setFont(&FreeMonoBoldOblique18pt7b);  tft->setTextSize(2);

    tft->setTextColor(0x2D60*(int)set);

    tft->setCursor(10, 200);
    tft->print("88  88");

    tft->setCursor(10, 98);
    tft->print("    88");

    tft->setCursor(10, 200);
    tft->print("88  88");

    tft->setCursor(10, 280);
    tft->print("+88888");
    tft->setCursor(10, 360);
    tft->print("+88888");
    tft->setCursor(10, 440);
    tft->print("+88888");

    delay(1);

    set ^= 1;
}

void writeProg(int8_t progNumber) {

  #ifdef FULLBLANK

  tft->fillRect(180, 40, 88, 70, 0);
  progNumber %= 100;

  tft->setTextColor(0);
  tft->setCursor(10, 98);
  tft->print("    88");

  if(progNumber < 0){
    return;
  }

  tft->setTextColor(0x2D60);
  tft->setCursor(10, 98);
  tft->print("    ");

  if(progNumber < 10)
    tft->print("0");

  tft->print(progNumber);

  #else
  progNumber %= 100;

  tft->setTextColor(0);
  tft->setCursor(10, 98);
  tft->print("    88");

  if(progNumber < 0){
    return;
  }

  tft->setTextColor(0x2D60);
  tft->setCursor(10, 98);
  tft->print("    ");

  if(progNumber < 10)
    tft->print("0");

  tft->print(progNumber);
  #endif
}
