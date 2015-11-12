from flask import Flask

app = Flask(__name__)

from app import settings
app.secret_key = settings.SECRET_KEY
from app import views