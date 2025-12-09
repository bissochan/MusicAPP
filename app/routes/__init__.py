from flask import Blueprint

main_bp = Blueprint('main', __name__)
sync_bp = Blueprint('sync', __name__, url_prefix='/api')

# Importa le routes
from app.routes.main_routes import *
from app.routes.sync_routes import *