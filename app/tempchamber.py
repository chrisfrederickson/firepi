import minimalmodbus
import serial
import csv
from app import scheduler

class TempChamber:
       
       #The object is being initialized to the values below.  
    def __init__(self):
        try:
            self.instrument = minimalmodbus.Instrument('COM4', 1)
            self.instrument.serial.baudrate = 19200
            self.instrument.serial.bytesize = 8
            self.instrument.serial.parity   = serial.PARITY_NONE
            self.instrument.serial.stopbits = 1
            self.instrument.serial.timeout  = 0.05
            self.temperature_curve = ''
            self.com_port = 4
        except:
            print('Cannot initialize modbus on COM4. Is your serial connection correct?')
            
    def __init__(self, comport):
        try:
            self.instrument = minimalmodbus.Instrument('COM'+str(comport), 1)
            self.instrument.serial.baudrate = 19200
            self.instrument.serial.bytesize = 8
            self.instrument.serial.parity   = serial.PARITY_NONE
            self.instrument.serial.stopbits = 1
            self.instrument.serial.timeout  = 0.05
            self.temperature_curve = ''
            self.com_port = comport
        except:
            print('Cannot initialize modbus on COM'+str(comport)+'. Is your serial connection correct?')
        
        #The temperature is being set. to the register.
    def set_temp(self, temp): 
        formatted_temp = int(temp*10)
        print(formatted_temp)
        try:
            #Try writing the formatted temperature to the register.
            self.write_register(300, formatted_temp)
        except:
            print('Error: temperature set failure')
    
    #TODO - Convert to nonblocking
    #Import a csv file and set the temperature for a set amount of time based on the information from the csv file.
    def set_temp_curve(self, curve):
        self.temperature_curve = curve
        reader = csv.reader(curve.split('\n'), delimiter=',')
        duration = 0;
        last_duration = 0;
        for row in reader:
            temp = float(row[1])
            last_duration = duration
            duration = float(row[0])
            scheduler.enter(last_duration, 1, self.set_temp, [temp])
        scheduler.run()
    
    # Will just return the original string
    def get_running_temp_curve(self):
        return self.temperature_curve
    
    def get_com_port(self):
        return self.com_port
    
    #Try reading the temperature from the register.
    def read_temp(self):
        return self.read_register(100);
        
    # Read the temperature that the chamber is supposed to be at    
    def read_goal(self):
        return self.read_register(300)
            
    # As all modbus commands will be the same, we can create a generic
    # read method
    def read_register(self, register):
        try:
            return self.instrument.read_register(register, 1, 3, False)
        except:
            print('Error: read failure')
            
    # As all modbus commands will be the same, we can create a generic
    # write method
    def write_register(self, register, data):
        try:
            self.instrument.write_register(register, data, 0, 16, False)
        except:
            print('Error: write failure')