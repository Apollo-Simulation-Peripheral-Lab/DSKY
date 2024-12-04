#include "alarms.h"
#include "Adafruit_NeoPixel.h"

Adafruit_NeoPixel leds(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

uint8_t r = 255, g = 0, b = 0; // Initial color state.
int8_t deltaR = -1, deltaG = 1, deltaB = 0; // Direction of color changes.

// Initialize LEDs and set all to off.
void initAlarms() {
  leds.begin();      // Initialize the NeoPixel library.
  leds.show();       // Ensure all LEDs are off initially.
  leds.setBrightness(255); // Set full brightness.
}

// Smoothly updates the LED colors in the animation cycle.
void updateAlarms(uint8_t *dskyState) {
  
  // B6 Parsing
  uint8_t B6 = dskyState[6]; // B6 Value
  uint8_t UpLink = (B6 >> 4) & 0x01; // UpLink(A1) Value
  //toggleAlarm(UPLINK_ACTY,UpLink);

  // B9 Parsing
  uint8_t B9 = dskyState[9]; // B9 Value
  uint8_t OprErr = (B9 >> 4) & 0x01; // OprErr(A5) Value
  uint8_t KeyRel = (B9 >> 5) & 0x01; // KeyRel(A4) Value
  uint8_t Stby = (B9 >> 6) & 0x01; // KeyRel(A3) Value
  uint8_t NoAtt = (B9 >> 7) & 0x01; // NoAtt(A2) Value
  //toggleAlarm(OPR_ERR,OprErr);
  //toggleAlarm(KEY_REL,KeyRel);
  //toggleAlarm(STBY,Stby);
  //toggleAlarm(NO_ATT,NoAtt);

  // B12 Parsing
  uint8_t B12 = dskyState[12]; // B12 Value
  uint8_t Tracker = (B12 >> 1) & 0x01; // Tracker(A12) Value
  uint8_t Restart = (B12 >> 2) & 0x01; // Restart(A11) Value
  uint8_t Prog = (B12 >> 3) & 0x01; // Prog(A10) Value
  uint8_t GimbalLock = (B12 >> 4) & 0x01; // GimbalLock(A9) Value
  uint8_t Temp = (B12 >> 5) & 0x01; // Temp(A8) Value
  uint8_t PrioDisp = (B12 >> 6) & 0x01; // PrioDisp(A7) Value
  uint8_t NoDap = (B12 >> 7) & 0x01; // NoDap(A6) Value
  //toggleAlarm(TRACKER,Tracker);
  //toggleAlarm(RESTART,Restart);
  //toggleAlarm(PROG,Prog);
  //toggleAlarm(GIMBAL_LOCK,GimbalLock);
  //toggleAlarm(TEMP,Temp);
  //toggleAlarm(PRIO_DISP,PrioDisp);
  //toggleAlarm(NO_DAP,NoDap);

  // B13 Parsing
  uint8_t B13 = dskyState[13]; // B13 Value
  uint8_t Vel = (B13 >> 6) & 0x01; // Vel(A14) Value
  uint8_t Alt = (B13 >> 7) & 0x01; // Vel(A13) Value
  //toggleAlarm(VEL,Vel);
  //toggleAlarm(ALT,Alt);

  // Dimming byte goes from 1 to 127. We want values from 0 to 127
  uint8_t brightness = (uint8_t)(((dskyState[14] - 1) * 255) / 126);
  leds.setBrightness(brightness); // Set full brightness.
  
  // Update color values for the animation.
  r += deltaR;
  g += deltaG;
  b += deltaB;

  // Transition logic: when one color channel saturates, switch directions.
  if (r == 255 && g == 0 && b == 0) { deltaR = -1; deltaG = 1; deltaB = 0; } // Red to Green.
  if (r == 0 && g == 255 && b == 0) { deltaR = 0; deltaG = -1; deltaB = 1; } // Green to Blue.
  if (r == 0 && g == 0 && b == 255) { deltaR = 1; deltaG = 0; deltaB = -1; } // Blue to Red.

  // Set all LEDs to the updated color.
  for (int i = 0; i < NUM_LEDS; i++) {
    leds.setPixelColor(i, leds.Color(r, g, b));
  }
  leds.show();
}