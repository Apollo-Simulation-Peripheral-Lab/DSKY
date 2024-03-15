#include <Arduino.h>
#define PWM_PIN 5

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
  VEL = 14
};

/* Map these IO pins to something geographically sensible wrt. the board layout */
const alarmLamp lampMapLeftColumnFirst[14] = {
  UPLINK_ACTY, NO_ATT, STBY, KEY_REL, // lhc
  OPR_ERR, NO_DAP, PRIO_DISP,
  TEMP, GIMBAL_LOCK, PROG, RESTART, // rhc
  TRACKER, ALT, VEL
};

void initAlarms();
void updateAlarms(uint8_t *dskyState);