#import libraries
import json
import time
#import os
import serial

#setup serial stuffs
arduino = serial.Serial(port='COM8', baudrate=9600, timeout=.1)
def write_read(data):
    arduino.write(bytes(data, 'utf-8'))
    time.sleep(2)
    text = arduino.readline()
    return text
#create infinite loop
#x = 5
#while x == 5:

#open the AGC output
f = open("outputAGC.json" , 'r+')
jsonObject = json.load(f)
#get data for display values
if jsonObject['IsInCM'] == True:
    print('Reading AGC Data...')
    #Program
    P = jsonObject['ProgramD1'] + jsonObject['ProgramD2']
    #Verb
    V = jsonObject['VerbD1'] + jsonObject['VerbD2']
    #Noun
    N = jsonObject['NounD1'] + jsonObject['NounD2']
    #Register 1
    R1 = jsonObject['Register1Sign'] + jsonObject['Register1D1'] + jsonObject['Register1D2'] + jsonObject['Register1D3'] + jsonObject['Register1D4'] + jsonObject['Register1D5']
    #Register 2
    R2 = jsonObject['Register2Sign'] + jsonObject['Register2D1'] + jsonObject['Register2D2'] + jsonObject['Register2D3'] + jsonObject['Register2D4'] + jsonObject['Register2D5']
    #Register 3
    R3 = jsonObject['Register3Sign'] + jsonObject['Register3D1'] + jsonObject['Register3D2'] + jsonObject['Register3D3'] + jsonObject['Register3D4'] + jsonObject['Register3D5']
    f.close()
    data = (str(P+V+N+R1+R2+R3))
    z = input('ready to send data:')
    print(data)
    value = write_read(data)
    print('Returned:' , value)
    arduino.close()
elif jsonObject['IsInCM'] == False:
    f.close()
    g = open('outputLGC.json' , 'r+')
    jsonObject = json.load(g)
    print('Reading LGC Data...')
    #Program
    P = jsonObject['ProgramD1'] + jsonObject['ProgramD2']
    #Verb
    V = jsonObject['VerbD1'] + jsonObject['VerbD2']
    #Noun
    N = jsonObject['NounD1'] + jsonObject['NounD2']
    #Register 1
    R1 = jsonObject['Register1Sign'] + jsonObject['Register1D1'] + jsonObject['Register1D2'] + jsonObject['Register1D3'] + jsonObject['Register1D4'] + jsonObject['Register1D5']
    #Register 2
    R2 = jsonObject['Register2Sign'] + jsonObject['Register2D1'] + jsonObject['Register2D2'] + jsonObject['Register2D3'] + jsonObject['Register2D4'] + jsonObject['Register2D5']
    #Register 3
    R3 = jsonObject['Register3Sign'] + jsonObject['Register3D1'] + jsonObject['Register3D2'] + jsonObject['Register3D3'] + jsonObject['Register3D4'] + jsonObject['Register3D5']
    g.close()
    data = (str(P+V+N+R1+R2+R3))
    z = input('ready to send data:')
    print(data)
    value = write_read(data)
    print('Returned:', value)
    arduino.close()
    