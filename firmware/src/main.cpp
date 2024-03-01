#include <Arduino.h>

using namespace std;

const int ledPin = LED_BUILTIN;

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (Serial.available() >= 1) {
    // Read byte from serial
    uint8_t receivedByte = Serial.read();
    
    // Extract first 4 bits and second 4 bits
    uint8_t ProgramD1 = receivedByte >> 4;
    uint8_t ProgramD2 = receivedByte & 0x0F;
    
    // Check if ProgramD2 is 1
    if (ProgramD2 == 1) {
      digitalWrite(ledPin, HIGH);  // Turn on LED
    } else {
      digitalWrite(ledPin, LOW);   // Turn off LED
    }
  }
}