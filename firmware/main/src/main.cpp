#include <Arduino.h>
#include "alarms.h"
#include "keyboard.h"

using namespace std;

const uint8_t PACKET_SIZE = 15;
uint8_t dskyState[PACKET_SIZE];
uint8_t memoryLocation = 0;

// Initial debug state
bool serialByteReceived = false;
unsigned long lastRandomUpdate = 0;
unsigned long randomUpdateInterval = 1000; // Update every 1 second

void generateRandomDskyState() {
  for (int i = 0; i < PACKET_SIZE; i++) {
    if(i != 14) dskyState[i] = random(256); // Generate random byte values
    else dskyState[i] = 127; // Full brightness in christmas mode
  }
}

void setup() {
  Serial.begin(250000);
  initAlarms();
}

bool proPressed = false;
void loop() {
  // Generate random dskyState if no serial byte has ever been received
  if (!serialByteReceived && millis() - lastRandomUpdate >= randomUpdateInterval) {
    lastRandomUpdate = millis();
    generateRandomDskyState();
    updateAlarms(dskyState);
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
  // Update alarms in every cycle so that bad IO chips can still work
  updateAlarms(dskyState);
  char pressedKey = getKey();
  if(pressedKey){
    Serial.println(pressedKey);
    if(pressedKey == 'P') proPressed = true;
  }
  if(getState() == RELEASED && proPressed){
    proPressed = false;
    Serial.println("O");
  }
}