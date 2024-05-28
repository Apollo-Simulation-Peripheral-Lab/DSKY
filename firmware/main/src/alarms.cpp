#include "alarms.h"
#include "PCF8575.h"
#include "Wire.h"

PCF8575 PCF(0x20);

void initAlarms(){
  pinMode(PWM_PIN, OUTPUT);
  analogWrite(PWM_PIN, 255);
  
  PCF.begin();
  
  Wire.begin();

  // initialize even the unused PCF pins to LOW state.
  for(uint8_t i = 0; i < 18; i++){
    PCF.write(i, LOW);
  }
}

/* Toggle a single {lamp} to a particular {state} */
void toggleAlarm(alarmLamp lamp, uint8_t state)
{
  PCF.write((uint8_t)lamp, state);
}

void updateAlarms(uint8_t *dskyState){
    // B6 Parsing
    uint8_t B6 = dskyState[6]; // B6 Value
    uint8_t UpLink = (B6 >> 4) & 0x01; // UpLink(A1) Value
    toggleAlarm(UPLINK_ACTY,UpLink);

    // B9 Parsing
    uint8_t B9 = dskyState[9]; // B9 Value
    uint8_t OprErr = (B9 >> 4) & 0x01; // OprErr(A5) Value
    uint8_t KeyRel = (B9 >> 5) & 0x01; // KeyRel(A4) Value
    uint8_t Stby = (B9 >> 6) & 0x01; // KeyRel(A3) Value
    uint8_t NoAtt = (B9 >> 7) & 0x01; // NoAtt(A2) Value
    toggleAlarm(OPR_ERR,OprErr);
    toggleAlarm(KEY_REL,KeyRel);
    toggleAlarm(STBY,Stby);
    toggleAlarm(NO_ATT,NoAtt);

    // B12 Parsing
    uint8_t B12 = dskyState[12]; // B12 Value
    uint8_t Tracker = (B12 >> 1) & 0x01; // Tracker(A12) Value
    uint8_t Restart = (B12 >> 2) & 0x01; // Restart(A11) Value
    uint8_t Prog = (B12 >> 3) & 0x01; // Prog(A10) Value
    uint8_t GimbalLock = (B12 >> 4) & 0x01; // GimbalLock(A9) Value
    uint8_t Temp = (B12 >> 5) & 0x01; // Temp(A8) Value
    uint8_t PrioDisp = (B12 >> 6) & 0x01; // PrioDisp(A7) Value
    uint8_t NoDap = (B12 >> 7) & 0x01; // NoDap(A6) Value
    toggleAlarm(TRACKER,Tracker);
    toggleAlarm(RESTART,Restart);
    toggleAlarm(PROG,Prog);
    toggleAlarm(GIMBAL_LOCK,GimbalLock);
    toggleAlarm(TEMP,Temp);
    toggleAlarm(PRIO_DISP,PrioDisp);
    toggleAlarm(NO_DAP,NoDap);

    // B13 Parsing
    uint8_t B13 = dskyState[13]; // B13 Value
    uint8_t Vel = (B13 >> 6) & 0x01; // Vel(A14) Value
    uint8_t Alt = (B13 >> 7) & 0x01; // Vel(A13) Value
    toggleAlarm(VEL,Vel);
    toggleAlarm(ALT,Alt);

    uint8_t brightness = (dskyState[14] << 1) | 1;
    analogWrite(PWM_PIN, brightness);
}