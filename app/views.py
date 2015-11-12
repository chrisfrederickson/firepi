from app import app, tempchamber
from app.auth import google, whitelist_required, admin_required
from flask import request, url_for, redirect, flash, session, jsonify

chamber = tempchamber.TempChamber()

@app.route('/')
def home():
    if 'google_token' in session:
        me = google.get('userinfo')
        return jsonify({"data": me.data})
    return 'No user data'

@app.route('/read')
@whitelist_required
def read_temp():
    try:
        temp = chamber.read_temp()
    except:
        return 'Fail! Temp read error.'
    return str(temp)

@app.route('/set')
@admin_required
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

@app.route('/login')
def login():
    return google.authorize(callback=url_for('oauth_authorized', _external=True))

@app.route('/logout')
def logout():
    session.pop('google_token', None)
    return redirect(url_for('home'))

@app.route('/oauth-authorized')
def oauth_authorized():
    resp = google.authorized_response()
    if resp is None:
        if resp is None:
            # User denied request to sign in
            return redirect(url_for('home'))
    
    session['google_token'] = (resp['access_token'], '')
    me = google.get('userinfo')
    
    return redirect(url_for('home'))