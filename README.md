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

## API
Firepi uses a RESTful API

### Get and put a temperature

`/api/v1/temp`

* `GET`
      * `{'temp': temp}` - Returns the temperature as an integer 
* `PUT (int newTemp)`
      * `{'error':'temperature set failure'}` - Returns an error if it cannot set the temperature
      * `{'response': 'success'}` - Returns a success if the temperature was set correctly

### Set a temperature curve
The temperature curve is represented on the frontend and backend as a CSV file of 2 columns and `n` rows. The second column is the length of time in seconds(?) at a temperature given by the first column.

|     |     |
| --- | --- |
| 1000 | 30 |
| 2000 | 40 |
| 3000 | -10 |
| 5000 | 70 |

The curve can be set through a `POST` request containing the CSV data as a string.

`/api/v1/tempcurve`
* `POST (String csv)`
     * `{'error':'temperature curve set failure'}` - Returns an error if the curve cannot be set
     * `{'response': 'success'}` - Returns a success if the curve was set correctly

### Events
Users can request to use the chamber at certain times using an event system through Google Calendar. This is currently not available.

`/api/v1/event`
* `POST (String user, int start_timestamp, int end_timestamp)` 
