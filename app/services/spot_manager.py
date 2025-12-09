import os
import subprocess
import shutil

class SpotDLManager:
    
    def __init__(self, path):
        self.path = path
    
    
    def sync_spotify_playlist(self, playlist_name, noN_delete=False):
        playlist_name_s = f'{playlist_name}.spotdl'
        command = f'spotdl sync {playlist_name_s}'
        if noN_delete:
            command += ' --sync-without-deleting'
        subprocess.run(command, cwd=playlist_name)
        
    @staticmethod    
    def run_in_dir(path, func, *args, **kwargs):
        current_dir = os.getcwd()
        os.chdir(path)
        try:
            func(*args, **kwargs)
        finally:
            os.chdir(current_dir)
            
    @staticmethod       
    def copy_files_skip_existing(dest):
        src_dir = os.getcwd()
        for name in os.listdir(src_dir):
            src_file = os.path.join(src_dir, name)
            dest_file = os.path.join(dest, name)
            if os.path.isfile(src_file):
                if not os.path.exists(dest_file):
                    shutil.copy2(src_file, dest_file)
        
        
    def create_synced_playlist(self, url, playlist_name ):
        if not os.path.exists(playlist_name):
            os.makedirs(playlist_name)
        playlist_name_s = f'{playlist_name}.spotdl'
        command = f'spotdl sync {url} --save-file {playlist_name_s}'
        subprocess.run(command, cwd=playlist_name)
        
        
    def download_music(self, url):
        command = f'spotdl download {url}'
        subprocess.run(command)
        
        
    def spotMngr(self, mode, user, url="", playlist_name="", noN_delete=False):
        user_path = os.path.join(self.path, user)
        if mode == 'sync':
            path = os.path.join(user_path, playlist_name)
            SpotDLManager.run_in_dir(path, self.sync_spotify_playlist, playlist_name, noN_delete)
            SpotDLManager.run_in_dir(path, SpotDLManager.copy_files_skip_existing, f'{user_path}/library/')
        elif mode == 'create_synced':
            path=user_path
            SpotDLManager.run_in_dir(path, self.create_synced_playlist, url, playlist_name)
            SpotDLManager.run_in_dir(path + playlist_name + "/", SpotDLManager.copy_files_skip_existing, f'{user_path}/library/') 
        elif mode == 'download':
            path = os.path.join(user_path, "library")
            SpotDLManager.run_in_dir(path, self.download_music, url)
        else:
            raise ValueError("Invalid mode specified.")
        
    