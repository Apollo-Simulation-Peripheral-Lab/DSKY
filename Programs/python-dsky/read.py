#import libraries
import json
import time
import os
import serial

#define functions
def printdisp():
    print('Acty:' , jsonObject['IlluminateCompLight'] , 'P:' , jsonObject['ProgramD1'] + jsonObject['ProgramD2'])
    print('V:' , jsonObject['VerbD1'] + jsonObject['VerbD2'] , 'N:' , jsonObject['NounD1'] + jsonObject['NounD2'])
    print('R1:' , jsonObject['Register1Sign'] + jsonObject['Register1D1'] + jsonObject['Register1D2'] + jsonObject['Register1D3'] + jsonObject['Register1D4'] + jsonObject['Register1D5'])
    print('R2:' , jsonObject['Register2Sign'] + jsonObject['Register2D1'] + jsonObject['Register2D2'] + jsonObject['Register2D3'] + jsonObject['Register2D4'] + jsonObject['Register2D5'])
    print('R3:' , jsonObject['Register3Sign'] + jsonObject['Register3D1'] + jsonObject['Register3D2'] + jsonObject['Register3D3'] + jsonObject['Register3D4'] + jsonObject['Register3D5'])

def printlight():
    print('Uplink:' , jsonObject['IlluminateUplinkActy'] , 'Temp:' , jsonObject['IlluminateTemp'])
    print('NoAtt:' , jsonObject['IlluminateNoAtt'] , 'GimbalLock:' , jsonObject['IlluminateGimbalLock'])
    print('Stby:' , jsonObject['IlluminateStby'] , 'Prog:' , jsonObject['IlluminateProg'])
    print('KeyRel:' , jsonObject['IlluminateKeyRel'] , 'Restart:' , jsonObject['IlluminateRestart'])
    print('OprErr:' , jsonObject['IlluminateOprErr'] , 'Tracker:' , jsonObject['IlluminateTracker'])

def writedata():
    w.write('Acty:' + str(jsonObject['IlluminateCompLight']) + ' P:' + str(jsonObject['ProgramD1'] + jsonObject['ProgramD2']))
    w.write('\nV:' + str(jsonObject['VerbD1'] + jsonObject['VerbD2']) + ' N:' + str(jsonObject['NounD1'] + jsonObject['NounD2']))
    w.write('\nR1:' + str(jsonObject['Register1Sign'] + jsonObject['Register1D1'] + jsonObject['Register1D2'] + jsonObject['Register1D3'] + jsonObject['Register1D4'] + jsonObject['Register1D5']))
    w.write('\nR2:' + str(jsonObject['Register2Sign'] + jsonObject['Register2D1'] + jsonObject['Register2D2'] + jsonObject['Register2D3'] + jsonObject['Register2D4'] + jsonObject['Register2D5']))
    w.write('\nR3:' + str(jsonObject['Register3Sign'] + jsonObject['Register3D1'] + jsonObject['Register3D2'] + jsonObject['Register3D3'] + jsonObject['Register3D4'] + jsonObject['Register3D5']))
    w.write('\nUplink:' + str(jsonObject['IlluminateUplinkActy']) + ' Temp:' + str(jsonObject['IlluminateTemp']))
    w.write('\nNoAtt:' + str(jsonObject['IlluminateNoAtt']) + ' GimbalLock:' + str(jsonObject['IlluminateGimbalLock']))
    w.write('\nStby:' + str(jsonObject['IlluminateStby']) + ' Prog:' + str(jsonObject['IlluminateProg']))
    w.write('\nKeyRel:' + str(jsonObject['IlluminateKeyRel']) + ' Restart:' + str(jsonObject['IlluminateRestart']))
    w.write('\nOprErr:' + str(jsonObject['IlluminateOprErr']) + ' Tracker:' + str(jsonObject['IlluminateTracker']))

#create infinite loop
x = 5
while x == 5:

#open the AGC output
    f = open("outputAGC.json" , 'r+')
    jsonObject = json.load(f)
    if (jsonObject['IsInCM']) == True:
        print('Output from AGC')
        
#print AGC output
        printdisp()
        printlight()
#write AGC output to file
        with open('DSKY\AGC.txt' , 'w') as w:
           writedata()
           #print('output to file')
           f.close()
           #time.sleep(0.001)
           os.system('cls')
        
#if not in CM, open LGC file
    elif(jsonObject['IsInCM']) == False:
        f.close()
        g = open("outputLGC.json" , 'r+')
        jsonObject = json.load(g)
        print('Output from LGC')
        
#print LGC output
        printdisp()
        printlight()
        print('          Alt:' , jsonObject['IlluminateAlt'] , '\n          Vel:' , jsonObject['IlluminateVel'])
#write LGC output to file
        with open('DSKY\LGC.txt' , 'w') as w:
           writedata()
           w.write('\n         Alt:' + str(jsonObject['IlluminateAlt']) + '\n         Vel:' + str(jsonObject['IlluminateVel']))
           #print('output to file')
           g.close()
           #time.sleep(0.001)
           os.system('cls')