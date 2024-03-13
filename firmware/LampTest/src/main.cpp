#include "PCF8575.h"

#define PWM_PIN 10
#define DUTY_OFF 0
#define DUTY_MIN 1
#define DUTY_MAX 255

#define DELAY 200

#define PCF_PIN_QTY 18

#define LAMP_QTY 14
#define LAMP_QTY_ORANGE 9
#define LAMP_QTY_WHITE 5

PCF8575 PCF(0x20);

/*           LHC   RHC
UPLINK ACTY    7: :8       TEMP
NO ATT         6: :9       GIMBAL LOCK
STBY           5: :10      PROG
KEY REL        4: :11      RESTART
OPR ERR        3: :12      TRACKER
NO DAP         2: :13      ALT
PRIO DISP      1: :14      VEL
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

/* Map these IO pins to something geographically sensible wrt. the board layout */
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

/* Function prototypes */
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

  bool connected = PCF.begin();
  Serial.print("Connection: ");
  Serial.println(connected);

  Serial.begin(115200);
  Serial.println("Begin DSKY Alarm Light Test:");

  Wire.begin();



  uint16_t x = PCF.read16();
  Serial.print("Read ");
  printHex(x);

  toggleAll(0);

  // initialize even the unused PCF pins to LOW state.
  for(uint8_t i = 0; i < PCF_PIN_QTY; i++){
    PCF.write(i, LOW);
  }

}

void loop() {

  // cycle test cases dim, then bright -- over and over
  for(uint8_t i = 0; i < 2; i++)
  {
    switch(i){
      case 0:
        analogWrite(PWM_PIN, DUTY_MIN);
        break;
      case 1:
        analogWrite(PWM_PIN, DUTY_MAX);
        break;
    }

    Serial.println("Left-right, down");
    testLeftRightDown();

    Serial.println("Left column first");
    testLeftColumnFirst();

    Serial.println("Right column first");
    testRightColumnFirst();

    Serial.println("Orange lamps");
    testOrangeLamps();

    Serial.println("White lamps");
    testWhiteLamps();
    Serial.println();
    toggleAll(0);
    delay(500);
  }
}

/* Toggle all lamps to a particular {state} */
void toggleAll(uint8_t state)
{
  for(uint8_t i = 0; i < LAMP_QTY; i++){
    toggleAlarm(lampMapLeftRightDown[i], state);
  }
}

/* Turn on, turn off: Left column then right column.*/
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

/* Turn on, turn off: Right column then left column.*/
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

/* Turn on, turn off: left then right going down*/
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

/* Test all orange lamps. */
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

/* Test all white lamps. */
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

/* Toggle a single {lamp} to a particular {state} */
void toggleAlarm(alarmLamp lamp, uint8_t state)
{
  PCF.write((uint8_t)lamp, state);
}

void printHex(uint16_t x)
{
  if (x < 0x1000) Serial.print('0');
  if (x < 0x100)  Serial.print('0');
  if (x < 0x10)   Serial.print('0');
  Serial.println(x, HEX);
}

