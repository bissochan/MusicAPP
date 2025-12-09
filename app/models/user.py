class user:
    def __init__(self, username, folder):     
        self.username = username        
        self.folder = folder
        
    def create_user():
        luca = user("luca", "luca_folder")
        auri = user("auri", "auri_folder")
        mama = user("mama", "mama_folder")
        return [luca, auri, mama]