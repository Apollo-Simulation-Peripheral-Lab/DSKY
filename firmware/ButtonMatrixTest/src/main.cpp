#include <Arduino.h>
#include "keyboard.h"
using namespace std;

const uint8_t ledPin = LED_BUILTIN;
const uint8_t PACKET_SIZE = 14;
uint8_t dskyState[PACKET_SIZE];
uint8_t memoryLocation = 0;

// Initial debug state
bool serialByteReceived = false;
unsigned long lastRandomUpdate = 0;
unsigned long randomUpdateInterval = 1000; // Update every 1 second

void setup() {
  Serial.begin(115200);
}

void loop() {
  char pressedKey = getKey();
  if(pressedKey){
    Serial.println(pressedKey);
  }
}