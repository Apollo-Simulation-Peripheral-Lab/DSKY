#include "keyboard.h"
//#define REVB 1

const byte ROWS = 5; //four rows
const byte COLS = 4; //four columns

#ifdef REVB
char hexaKeys[ROWS][COLS] = {
    {'+','-','0','V'},
    {'7','4','1','N'},
    {'8','5','2',' '},
    {'9','6','3','R'},
    {'C','P','K','E'}
};
byte rowPins[ROWS] = { 7, 6, 4, 3, 2 };
byte colPins[COLS] = { A0, 8, 9, 10 };
#else
char hexaKeys[ROWS][COLS] = {
    {'+','V','N','0'},
    {'7','-','4','1'},
    {'8','5',' ','2'},
    {'9','P','6','3'},
    {'C','E','R','K'}
};
byte rowPins[ROWS] = { 7, 6, 4, 3, 2 }; 
byte colPins[COLS] = { A0, A1, 9, 10 };
#endif

//initialize an instance of class NewKeypad
Keypad customKeypad = Keypad( makeKeymap(hexaKeys), rowPins, colPins, ROWS, COLS);

char getKey(){
    return customKeypad.getKey();
}

KeyState getState(){
    return customKeypad.getState();
}