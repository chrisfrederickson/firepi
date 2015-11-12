from flask_oauthlib.client import OAuth
from app import app, settings
from flask import session
from functools import wraps

#TODO Add auth server
whitelist = ['fredericc0@students.rowan.edu']
admins = ['fredericc0@students.rowan.edu']

app.secret_key = 'development'
oauth = OAuth()
google = oauth.remote_app(
    'google',
    consumer_key=settings.GOOGLE_ID,
    consumer_secret=settings.GOOGLE_SECRET,
    request_token_params={
        'scope': 'email'
    },
    base_url='https://www.googleapis.com/oauth2/v1/',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
)

@google.tokengetter
def get_rowan_oauth_token():
    return session.get('google_token')

def whitelist_required(func):
    @wraps(func)
    def wrapper_func(*args, **kwargs):
        if 'google_token' in session:
            me = google.get('userinfo')
            email = me.data['email']
            if email not in whitelist:
                return 'Not in user whitelist'
        else:
            return 'Google signin failure'
        return func(*args, **kwargs)
    return wrapper_func

def admin_required(func):
    @wraps(func)
    def wrapper_func(*args, **kwargs):
        if 'google_token' in session:
            me = google.get('userinfo')
            email = me.data['email']
            if email not in admins:
                return 'Not an admin'
        else:
            return 'Google signin failure'
        return func(*args, **kwargs)
    return wrapper_func