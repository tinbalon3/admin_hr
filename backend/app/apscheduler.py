from typing import Optional
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler

class TokenManager:
    def __init__(self):
        # Sử dụng dictionary để lưu trữ token bị thu hồi với thời gian hết hạn
        self.revoked_tokens = {}
        
        # Khởi tạo scheduler để tự động dọn dẹp token hết hạn
        self.scheduler = BackgroundScheduler()
        self.scheduler.add_job(
            self.clean_expired_tokens, 
            'interval', 
            minutes=5
        )
        self.scheduler.start()

    def revoke_token(self, token: str, duration: Optional[timedelta] = None):
        """
        Thu hồi token và thêm vào danh sách đen với thời gian hết hạn.
        
        Args:
            token (str): Token cần thu hồi.
            duration (timedelta, optional): Thời gian token sẽ hết hạn. 
                                            Nếu None, sử dụng thời gian mặc định là 30 phút.
        """
        if duration is None:
            duration = timedelta(minutes=30)
        expire_time = datetime.utcnow() + timedelta(seconds=duration)
        self.revoked_tokens[token] = expire_time

    def clean_expired_tokens(self):
        """
        Xóa các token đã hết hạn khỏi danh sách đen.
        """
        current_time = datetime.utcnow()
        self.revoked_tokens = {
            token: expire 
            for token, expire in self.revoked_tokens.items() 
            if expire > current_time
        }

    def is_token_revoked(self, token: str) -> bool:
        """
        Kiểm tra xem token có bị thu hồi không.
        
        Args:
            token (str): Token cần kiểm tra.
        
        Returns:
            bool: True nếu token bị thu hồi và chưa hết hạn, False nếu không.
        """
        # Tự động dọn dẹp các token hết hạn trước khi kiểm tra
        self.clean_expired_tokens()
        
        # Kiểm tra token có trong danh sách đen không
        return token in self.revoked_tokens

    def get_token_expiry(self, token: str) -> Optional[datetime]:
        """
        Lấy thời gian hết hạn của token trong danh sách đen.
        
        Args:
            token (str): Token cần kiểm tra.
        
        Returns:
            datetime or None: Thời gian hết hạn của token, hoặc None nếu không tồn tại.
        """
        return self.revoked_tokens.get(token)