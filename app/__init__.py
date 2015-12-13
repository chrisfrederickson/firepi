from flask import Flask

app = Flask(__name__)

# Init application specific interfaces
import calender
try:
    calendar = calendar.CalendarManager()
except:
    print("Calendar init failure!")

import sched, time
try:
    scheduler = sched.scheduler(time.time, time.sleep)
except:
    print("Scheduler init failure!")

#Requires scheduler interfaces
import tempchamber
try:
    chamber = tempchamber.TempChamber(5)
except:
    print("Temperature chamber init failure!")

from app import settings
app.secret_key = settings.SECRET_KEY
from app import api, views