#created by Tiny_Bob with edits graciously done by Kryso from the Reentry Discord

#import libraries
import json
import time
import serial

#setup serial port
ser = serial.Serial(port="COM8",baudrate=9600,timeout=0.1)

#data send function
def write_read(x):
    ser.write(bytes(x,'utf-8'))
    time.sleep(0.05)
    data=ser.readline().decode('utf-8').strip()
    return data

print('Enter commands, "exit" to exit app')

while 1:
    try:
        with open("outputAGC.json",'r+') as f:
            jsonObject = json.load(f)
            #get data for display values
            if jsonObject['IsInCM'] == True:
                print('Reading AGC Data...')
                #Program
                P = str(jsonObject['ProgramD1'] + jsonObject['ProgramD2'])
                #Verb
                V = str(jsonObject['VerbD1'] + jsonObject['VerbD2'])
                #Noun
                N = str(jsonObject['NounD1'] + jsonObject['NounD2'])
                #Register 1
                R1 = str(jsonObject['Register1Sign'] + jsonObject['Register1D1'] + jsonObject['Register1D2'] + jsonObject['Register1D3'] + jsonObject['Register1D4'] + jsonObject['Register1D5'])
                #Register 2
                R2 = str(jsonObject['Register2Sign'] + jsonObject['Register2D1'] + jsonObject['Register2D2'] + jsonObject['Register2D3'] + jsonObject['Register2D4'] + jsonObject['Register2D5'])
                #Register 3
                R3 = str(jsonObject['Register3Sign'] + jsonObject['Register3D1'] + jsonObject['Register3D2'] + jsonObject['Register3D3'] + jsonObject['Register3D4'] + jsonObject['Register3D5'])
                f.close()
                data = (str(P+V+N+R1+R2+R3))
                value = write_read(data)
                print('Returned:' , value)
            elif jsonObject['IsInCM'] == False:
                f.close()
                with open('outputLGC.json' , 'r+') as g:
                    jsonObject = json.load(g)
                    if jsonObject['IsInLM'] == True:
                        print('Reading LGC Data...')
                        #Program
                        P = str(jsonObject['ProgramD1'] + jsonObject['ProgramD2'])
                        #Verb
                        V = str(jsonObject['VerbD1'] + jsonObject['VerbD2'])
                        #Noun
                        N = str(jsonObject['NounD1'] + jsonObject['NounD2'])
                        #Register 1
                        R1 = str(jsonObject['Register1Sign'] + jsonObject['Register1D1'] + jsonObject['Register1D2'] + jsonObject['Register1D3'] + jsonObject['Register1D4'] + jsonObject['Register1D5'])
                        #Register 2
                        R2 = str(jsonObject['Register2Sign'] + jsonObject['Register2D1'] + jsonObject['Register2D2'] + jsonObject['Register2D3'] + jsonObject['Register2D4'] + jsonObject['Register2D5'])
                        #Register 3
                        R3 = str(jsonObject['Register3Sign'] + jsonObject['Register3D1'] + jsonObject['Register3D2'] + jsonObject['Register3D3'] + jsonObject['Register3D4'] + jsonObject['Register3D5'])
                        g.close()
                        data = (str(P+V+N+R1+R2+R3))
                        value = write_read(data)
                    else:
                        continue
    except Exception as e:
        #Likely will be access denied to .json file as it tried to access the .json file
        #the same time reentry was writing to it.
        print(e)
