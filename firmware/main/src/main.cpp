#include <Arduino.h>
#include "alarms.h"
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

void generateRandomDskyState() {
  for (int i = 0; i < PACKET_SIZE; i++) {
    dskyState[i] = random(256); // Generate random byte values
  }
}

void setup() {
  Serial.begin(250000);
  initAlarms();
}

void loop() {
  // Generate random dskyState if no serial byte has ever been received
  if (!serialByteReceived && millis() - lastRandomUpdate >= randomUpdateInterval) {
    lastRandomUpdate = millis();
    generateRandomDskyState();
    updateAlarms(dskyState); // Update alarms with the generated random state
  }

  if(Serial.available() > 0){
    uint8_t receivedByte = Serial.read(); // Read the incoming byte
    serialByteReceived = true;

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