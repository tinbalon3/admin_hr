from fastapi import HTTPException, status


class ResponseHandler:
    @staticmethod
    def success(message = None, data=None):
        if message is None and data is not None:
            return data
        elif data is None and message is not None:
            return {"message": message}
        else:
            return {"message": message, "data": data}

    @staticmethod
    def create_success(name, id, data):
        message = f"Tạo thành công"
        return ResponseHandler.success(message, data)

    @staticmethod
    def update_success(name, id, data):
        message = f"cập nhật thành công"
        return ResponseHandler.success(message, data)

    @staticmethod
    def delete_success(name, id, data):
        message = f"Xóa thành công"
        return ResponseHandler.success(message, data)

    @staticmethod
    def not_found_error(name="", id=None):
        message = f"Không tìm thấy thông tin"
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message)

    @staticmethod
    def invalid_token(name=""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid {name} token.",
            headers={"WWW-Authenticate": "Bearer"})
    @staticmethod
    def userExists():
        raise HTTPException(status_code= status.HTTP_400_BAD_REQUEST, detail='Email đã được đăng ký')
    
    @staticmethod
    def changePasswordError():
        raise HTTPException(status_code= status.HTTP_400_BAD_REQUEST, detail='Sai mật khẩu')
    
    @staticmethod
    def error(message = ""):
        raise HTTPException(status_code= status.HTTP_400_BAD_REQUEST, detail=message)