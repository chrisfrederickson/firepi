from app import app

#COM fails with reloader enabled
app.run(debug=True, use_reloader=False)