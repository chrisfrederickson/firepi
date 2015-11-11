from app import app, tempchamber
from flask import request

chamber = tempchamber.TempChamber()

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/read')
def read_temp():
    try:
        temp = chamber.read_temp()
    except:
        return 'Fail! Temp read error.'
    return str(temp)

@app.route('/set')
def set_temp():
    try:
        temp = float(request.args.get('temp'))
    except:
        return 'Fail! Invalid argument'
    try:
        chamber.set_temp(temp)
    except:
        return 'Fail! Temp set error'
    return 'Success!'