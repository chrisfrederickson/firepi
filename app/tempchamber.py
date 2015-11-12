import minimalmodbus
import serial

class TempChamber:
       
    def __init__(self):
        self.instrument = minimalmodbus.Instrument('COM6', 1)
        self.instrument.serial.baudrate = 19200
        self.instrument.serial.bytesize = 8
        self.instrument.serial.parity   = serial.PARITY_NONE
        self.instrument.serial.stopbits = 1
        self.instrument.serial.timeout  = 0.05
        
    def set_temp(self, temp):
        formatted_temp = int(temp*10)
        self.instrument.write_register(300, formatted_temp, 0, 16, False)
    
    def set_temp_curve(self):
        pass
    
    def read_temp(self):
        return self.instrument.read_register(100, 1, 3, False)