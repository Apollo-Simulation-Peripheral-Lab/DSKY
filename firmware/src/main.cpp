#include <Arduino.h>

using namespace std;

const uint8_t ledPin = LED_BUILTIN;
const uint8_t PACKET_SIZE = 14;
uint8_t dskyState[PACKET_SIZE];
uint8_t memoryLocation = 0;

void updateDisplay(){
  // B9 Parsing
  uint8_t B9 = dskyState[9]; // B9 Value
  uint8_t KeyRel = (B9 >> 5) & 0x01; // KeyRel(A4) Value
  if(KeyRel){
    digitalWrite(ledPin, HIGH);
  }else{
    digitalWrite(ledPin, LOW);
  }
}

void setup() {
  Serial.begin(250000);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  while(Serial.available() <= 0);
  uint8_t receivedByte = Serial.read(); // Read the incoming byte

  if (receivedByte == 0xFF) { // Check if received byte is 0xFF
    memoryLocation = 0; // Reset the array index
  } else {
    dskyState[memoryLocation] = receivedByte; // Store the byte in the array
    memoryLocation = (memoryLocation + 1) % PACKET_SIZE; // Increment array index and wrap around if necessary
  }
  updateDisplay();
}