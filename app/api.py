from flask_restful import Resource, Api, request
from app import app, chamber

api = Api(app)

class TempResource(Resource):
    def get(self):
        try:
            temp = chamber.read_temp()
        except:
            return {'error':'temperature read failure'}
        return {'temp': temp}
    
    def put(self):
        try:
            temp = request.form['temp']
            chamber.set_temp(self, temp)
        except:
            return {'error':'temperature set failure'}
        return {'response': 'success'}

class TempCurveResource(Resource):
    def get(self):
        # Get ID / user of running curve
        pass
        
    def post(self):
        temp_curve = request.form['temp_curve']
        print(temp_curve)
        try:
            #temp_curve = request.form['temp_curve']
            chamber.set_temp_curve(self, temp_curve)
        except:
            return {'error':'temperature curve set failure'}
        return {'response': 'success'}
    
class EventResource(Resource):
    def get(self): # Get an event
        try:
            event = calendar.get_current_event(self)
        except:
            return {'error':'get event failure'}
        return {'event':event}
    
    def post(self): # Add an event
        try:
            user = 'me' #TODO - Requires auth
            start_time = request.form['start_time']
            end_time = request.form['end_time']
            calendar.add_event(self, user, starttime, endtime)
        except:
            return {'error':'add event failure'}
        return {'response':'success'}

api.add_resource(TempResource, '/api/v1/temp')
api.add_resource(TempCurveResource, '/api/v1/tempcurve')
api.add_resource(EventResource, '/api/v1/event')