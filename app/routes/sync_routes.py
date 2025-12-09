from flask import request, jsonify
from app.routes import sync_bp
from app.services.spot_manager import SpotDLManager
from ..models.user import user
import os

spot_manager = SpotDLManager("C:\\Users\\lucab\\Music")

@sync_bp.route('/playlist', methods=['POST'])
def sync_playlist():
    data = request.json
    mode = data.get('mode')
    username = data.get('username')
    url = data.get('url', None)
    playlist_name = data.get('playlist_name', None)
    noN_delete = data.get('noN_delete', False)
    try:
        # Trova l'utente per ottenere il folder corretto
        users = user.create_user()
        user_obj = next((u for u in users if u.username == username), None)
        if not user_obj:
            return jsonify({'status': 'error', 'message': 'User not found'}), 400
        
        spot_manager.spotMngr(mode, user_obj.folder, url, playlist_name, noN_delete)
        return jsonify({'status': 'success', 'message': 'Operation completed'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@sync_bp.route('/playlists/<username>', methods=['GET'])
def get_playlist_list(username):
    user_path = f"C:\\Users\\lucab\\Music\\{username}\\"
    playlists = []
    try:
        for item in os.listdir(user_path):
            item_path = os.path.join(user_path, item)
            if os.path.isdir(item_path):
                playlists.append(item)
        return playlists
    except Exception as e:
        return []