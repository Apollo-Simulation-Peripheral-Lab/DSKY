#include <Arduino.h>
#include "alarms.h"
#include "keyboard.h"

using namespace std;

const uint8_t ledPin = LED_BUILTIN;
const uint8_t PACKET_SIZE = 14;
uint8_t dskyState[PACKET_SIZE];
uint8_t memoryLocation = 0;

void setup() {
  Serial.begin(250000);
  initAlarms();
}

void loop() {
  if(Serial.available() > 0){
    uint8_t receivedByte = Serial.read(); // Read the incoming byte

    if (receivedByte == 0xFF) { // Check if received byte is 0xFF
      memoryLocation = 0; // Reset the array index
    } else {
      dskyState[memoryLocation] = receivedByte; // Store the byte in the array
      memoryLocation = (memoryLocation + 1) % PACKET_SIZE; // Increment array index and wrap around if necessary
    }
  }
  updateAlarms(dskyState);
  char pressedKey = getKey();
  if(pressedKey){
    Serial.println(pressedKey);
  }
}