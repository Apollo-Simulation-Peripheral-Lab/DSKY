#include "PCF8575.h"

#define PWM_PIN 10
#define DUTY_OFF 0
#define DUTY_MIN 1
#define DUTY_MAX 255

#define DELAY 100

#define PCF_PIN_QTY 18

#define LAMP_QTY 14
#define LAMP_QTY_ORANGE 9
#define LAMP_QTY_WHITE 5

// Index offset.
const uint8_t offset = 22;

uint16_t duty = 1;
uint8_t index = 0;
uint8_t cycle = 0;
bool setting = true;

#define REV_C

PCF8575 PCF(0x20);

/*           LHC   RHC
UPLINK ACTY    7: :10       TEMP
NO ATT         6: :11       GIMBAL LOCK
STBY           5: :12       PROG
KEY REL        4: :13       RESTART
OPR ERR        3: :14       TRACKER
NO DAP         2: :15       ALT
PRIO DISP      1: :16       VEL
*/
enum alarmLamp {
  PRIO_DISP = 1,
  NO_DAP = 2,
  OPR_ERR = 3,
  KEY_REL = 4,
  STBY = 5,
  NO_ATT = 6,
  UPLINK_ACTY = 7,
  TEMP = 8,
  GIMBAL_LOCK = 9,
  PROG = 10,
  RESTART = 11,
  TRACKER = 12,
  ALT = 13,
  VEL = 14,
};

const alarmLamp lampMapLeftColumnFirst[14] = {
  UPLINK_ACTY, NO_ATT, STBY, KEY_REL, // lhc
  OPR_ERR, NO_DAP, PRIO_DISP,
  TEMP, GIMBAL_LOCK, PROG, RESTART, // rhc
  TRACKER, ALT, VEL
};

const alarmLamp lampMapRightColumnFirst[14] = {
  TEMP, GIMBAL_LOCK, PROG, RESTART, // rhc
  TRACKER, ALT, VEL,  
  UPLINK_ACTY, NO_ATT, STBY, KEY_REL, // lhc
  OPR_ERR, NO_DAP, PRIO_DISP
};

const alarmLamp lampMapLeftRightDown[14] = {
  UPLINK_ACTY, TEMP, NO_ATT, GIMBAL_LOCK,
  STBY, PROG, KEY_REL, RESTART,
  OPR_ERR, TRACKER, NO_DAP, ALT,
  PRIO_DISP, VEL
};

const alarmLamp lampMapOrange[9] = {
  TEMP, GIMBAL_LOCK, PROG,
  RESTART, TRACKER, NO_DAP,
  ALT, PRIO_DISP, VEL
};

const alarmLamp lampMapWhite[5] = {
  UPLINK_ACTY, NO_ATT, STBY,
  KEY_REL, OPR_ERR
};

void printHex(uint16_t x);
void toggleAlarm(alarmLamp lamp, uint8_t state);
void toggleAll(uint8_t state);

void testLeftColumnFirst(void);
void testRightColumnFirst(void);
void testLeftRightDown(void);
void testOrangeLamps(void);
void testWhiteLamps(void);

void setup() {
  // put your setup code here, to run once:
  pinMode(PWM_PIN, OUTPUT);


  Serial.begin(115200);
  Serial.println(__FILE__);
  Serial.print("PCF8575_LIB_VERSION:\t");
  Serial.println(PCF8575_LIB_VERSION);

  Wire.begin();

  bool connected = PCF.begin();

  Serial.print("Connection: ");
  Serial.println(connected);

  uint16_t x = PCF.read16();
  Serial.print("Read ");
  printHex(x);

  // initialize PCF pins to LOW state.
  for(uint8_t i = 0; i < PCF_PIN_QTY; i++){
    PCF.write(i, LOW);
  }

  // turn off all lamps (redundant, but oh well)
  for(uint8_t i = 0; i < LAMP_QTY; i++){
    toggleAlarm(lampMapLeftRightDown[i], false);
  }

  analogWrite(PWM_PIN, DUTY_MIN);
}

void loop() {

  // put your main code here, to run repeatedly:
  for(uint8_t i = 0; i < 2; i++)
  {
    switch(i){
      case 0:
        duty = DUTY_MIN;
        break;
      case 1:
        duty = DUTY_MAX;
        break;
    }
    analogWrite(PWM_PIN, duty);

    testLeftRightDown();
    testLeftColumnFirst();
    testRightColumnFirst();
    testOrangeLamps();
    testWhiteLamps();
    delay(500);
  }
}

void toggleAll(uint8_t state)
{
  for(uint8_t i = 0; i < LAMP_QTY; i++){
    toggleAlarm(lampMapLeftRightDown[i], state);
  }
}

void testLeftColumnFirst(void){
  for(uint8_t i = 0; i < 2; i++)
  {
    for(uint8_t j = 0; j < LAMP_QTY; j++)
    {
      toggleAlarm(lampMapLeftColumnFirst[j], 1 - i);
      delay(DELAY);
    }
  }
  toggleAll(0);
  return;
}

void testRightColumnFirst(void){
  for(uint8_t i = 0; i < 2; i++)
  {
    for(uint8_t j = 0; j < LAMP_QTY; j++)
    {
      toggleAlarm(lampMapRightColumnFirst[j], 1 - i);
      delay(DELAY);
    }
  }
  toggleAll(0);
}

void testLeftRightDown(void)
{
  for(uint8_t i = 0; i < 2; i++)
  {
    for(uint8_t j = 0; j < LAMP_QTY; j++)
    {
      toggleAlarm(lampMapLeftRightDown[j], 1 - i);
      delay(DELAY);
    }
  }
  toggleAll(0);
}
void testOrangeLamps(void)
{
  for(uint8_t i = 0; i < 2; i++)
  {
    for(uint8_t j = 0; j < LAMP_QTY_ORANGE; j++)
    {
      toggleAlarm(lampMapOrange[j], 1 - i);
      delay(DELAY);
    }
  }
  toggleAll(0);
}
void testWhiteLamps(void)
{
  for(uint8_t i = 0; i < 2; i++)
  {
    for(uint8_t j = 0; j < LAMP_QTY_WHITE; j++)
    {
      toggleAlarm(lampMapWhite[j], 1 - i);
      delay(DELAY);
    }
  }
  toggleAll(0);
}

void printHex(uint16_t x)
{
  if (x < 0x1000) Serial.print('0');
  if (x < 0x100)  Serial.print('0');
  if (x < 0x10)   Serial.print('0');
  Serial.println(x, HEX);
}

void toggleAlarm(alarmLamp lamp, uint8_t state)
{
  PCF.write((uint8_t)lamp, state);
}