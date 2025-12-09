from flask import render_template, request, jsonify
from app.routes import main_bp
from ..models.user import user

@main_bp.route('/')
def index():
    users = user.create_user()  # Recupera tutti gli utenti
    return render_template('index.html', users=users)

@main_bp.route('/api/users')
def get_users():
    users = user.create_user()  # Recupera tutti gli utenti
    return jsonify([{'name': u.username} for u in users])