# Importing Libraries
import serial
import time
x = 1
arduino = serial.Serial(port='COM8', baudrate=57600, timeout=.1)
def write_read(x):
    arduino.write(bytes(x, 'utf-8'))
    time.sleep(0.05)
    data = arduino.readline()
    return data
while x == 1:
    num = input("Enter a number: ") # Taking input from user
    value = write_read(num)
    arduino.readline().decode('utf-8').rstrip()
    print('Returned:' , value) # printing the value
    if num == (str('quit')):
        arduino.close()
        print('closing COM')
        x = 0