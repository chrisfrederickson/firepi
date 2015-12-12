# Firepi
A remote web server to control a temperature chamber at Rowan University with a Raspberry Pi sending MODBUS commands.

<img src='https://raw.githubusercontent.com/chrisfrederickson/firepi/d8cfa8fc3daff048400c6c3462dc2ae7ec14d37b/iconography/firepi.png'/>

## Setup
Here's how to set up the system:

* Download Python
    * Set up your system environment variables
* Navigate to project folder
* pip install -r requirements.txt
* Update `app/tempchamber.py` to use the correct COM port (see <a href='https://github.com/chrisfrederickson/firepi/issues/20'>this issue</a>)
* Go to the Google Developer Console and set up your environment variables
    * See `app/settings.py` for the variables you need 
* Execute `python run.py`
    * It should appear at <a href='http://127.0.0.1:5000'>127.0.0.1:5000</a> 
