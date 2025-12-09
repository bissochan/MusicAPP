import os
from ..models.user import user

class DirMngr:
    base_path = "C:\\Users\\lucab\\Music\\Musicapp"
    other_dirs = ["playlists", "library"]
    
    def __init__(self, user_obj: user):
        self.user = user_obj
        self.user_path = os.path.join(self.base_path, self.user.folder)
        self.create_user_directory()
        
    def create_user_directory(self):
        if not os.path.exists(self.user_path):
            os.makedirs(self.user_path)
        for dir_name in self.other_dirs:
            dir_path = os.path.join(self.user_path, dir_name)
            if not os.path.exists(dir_path):
                os.makedirs(dir_path)






