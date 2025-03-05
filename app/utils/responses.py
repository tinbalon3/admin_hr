from fastapi import HTTPException, status


class ResponseHandler:
    @staticmethod
    def success(message = None, data=None):
        if message is None:
            return data
        else:
            return {"message": message, "data": data}
    @staticmethod
    def get_single_success(name, id, data):
        message = f"Details for {name} with id {id}"
        return ResponseHandler.success(message, data)

    @staticmethod
    def create_success(name, id, data):
        message = f"{name} with id {id} created successfully"
        return ResponseHandler.success(message, data)

    @staticmethod
    def update_success(name, id, data):
        message = f"{name} with id {id} updated successfully"
        return ResponseHandler.success(message, data)

    @staticmethod
    def delete_success(name, id, data):
        message = f"{name} with id {id} deleted successfully"
        return ResponseHandler.success(message, data)

    @staticmethod
    def not_found_error(name="", id=None):
        message = f"{name} With Id {id} Not Found!"
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message)

    @staticmethod
    def invalid_token(name=""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid {name} token.",
            headers={"WWW-Authenticate": "Bearer"})
    @staticmethod
    def userExists():
        raise HTTPException(status_code= status.HTTP_400_BAD_REQUEST, detail='User already exists')
    
    @staticmethod
    def changePasswordError():
        raise HTTPException(status_code= status.HTTP_400_BAD_REQUEST, detail='Old password is incorrect')
    
    @staticmethod
    def error(message = ""):
        raise HTTPException(status_code= status.HTTP_400_BAD_REQUEST, detail=message)