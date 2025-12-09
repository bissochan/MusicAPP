from flask import Flask
from .models.user import user
from .core.DirMngr import DirMngr
import os

def create_app():
    app = Flask(__name__)
    
    users = user.create_user()
    for usr in users:
        DirMngr(usr)
    
    if not os.path.exists("song_downloads"):
        os.makedirs("song_downloads")
        
    # Registra i blueprint delle routes
    from app.routes import main_bp, sync_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(sync_bp)
    
    return app




