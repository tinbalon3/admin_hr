from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
import uuid
from app.models.models import WorkSchedule, Employee
from app.schemas.schedule import WorkScheduleCreate, WorkScheduleOut, ListWorkScheduleResponse, Response
from app.utils.responses import ResponseHandler
from app.core.security import verify_token, check_intern, check_admin, check_user_exist

class ScheduleService:

    @staticmethod
    def calculate_week_of_month(target_date: date) -> int:
        """Tính tuần thứ mấy trong tháng."""
        first_day_of_month = target_date.replace(day=1)
        adjusted_dom = target_date.day + first_day_of_month.weekday()
        return int((adjusted_dom - 1) / 7 + 1)

    @staticmethod
    def create_schedule(db: Session, token: HTTPAuthorizationCredentials, schedule_data: WorkScheduleCreate):
        # Kiểm tra token và quyền của user (chỉ intern được phép)
        verify_token(token=token)
        user = check_intern(token, db)
        if not user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không phải là intern.")
        
        current_date = datetime.now().date()
        week_number = str(ScheduleService.calculate_week_of_month(current_date))
        start_month = str(current_date.month)
        start_year = str(current_date.year)
                
        # Kiểm tra lịch đã tồn tại chưa cho tuần hiện tại của user
        existing_schedule = db.query(WorkSchedule).filter(
            WorkSchedule.employee_id == user.id,
            WorkSchedule.week_number == week_number,
            WorkSchedule.start_month == start_month,
            WorkSchedule.start_year == start_year
        ).first()

        if existing_schedule:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lịch cho tuần này đã tồn tại."
            )
            
        # Chuyển danh sách work_days từ Pydantic model thành list of dicts (JSON serializable)
        work_days = [wd for wd in schedule_data.work_days]
        
        # Tạo mới lịch làm việc
        schedule = WorkSchedule(
            id=uuid.uuid4(),
            employee_id=user.id,
            week_number=week_number,
            start_month=start_month,
            start_year=start_year,
            work_days=jsonable_encoder(work_days),
            created_at=datetime.utcnow()
        )
        
        db.add(schedule)
        db.commit()
        db.refresh(schedule)

        data_response = WorkScheduleOut.from_orm(schedule)
        return ResponseHandler.success("Đăng ký thành công", data_response)

    @staticmethod
    def getlist(db: Session, token: HTTPAuthorizationCredentials) -> ListWorkScheduleResponse:
        # Kiểm tra token và quyền admin
        verify_token(token=token)
        check_admin(token=token, db=db)
        
        current_date = datetime.now().date()
        week_number = str(ScheduleService.calculate_week_of_month(current_date))
        start_month = str(current_date.month)
        start_year = str(current_date.year)

        # Lấy danh sách lịch làm việc theo tuần hiện tại
        schedules = db.query(WorkSchedule).filter(
            WorkSchedule.week_number == week_number,
            WorkSchedule.start_month == start_month,
            WorkSchedule.start_year == start_year
        ).all()

        if not schedules:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No schedule found for the current week."
            )

        # Tạo response data với thông tin employee
        response_data = []
        for schedule in schedules:
            employee = db.query(Employee).filter(Employee.id == schedule.employee_id).first()
            response_data.append(Response(
                schedule=WorkScheduleOut.from_orm(schedule),
                employee=employee  # Nếu cần, chuyển đổi bằng UserInfo.from_orm(employee)
            ))

        return ListWorkScheduleResponse(
            message="Lấy danh sách thành công",
            data=response_data
        )
    @staticmethod
    def user_get_list_in_month(db: Session, month: str, token: HTTPAuthorizationCredentials) -> ListWorkScheduleResponse:
        # Kiểm tra token và quyền admin
        verify_token(token=token)
        employee = check_user_exist(token=token, db=db)
        
        # Lấy danh sách lịch làm việc theo tháng của user
        schedules = db.query(WorkSchedule).filter(
            WorkSchedule.start_month == month,
            WorkSchedule.employee_id == employee.id
        ).all()  # Loại bỏ "or None"
        
        response_data = []
        # Nếu có lịch, lặp qua và xây dựng response
        if schedules:
            for schedule in schedules:
                response_data.append(Response(
                    schedule=WorkScheduleOut.from_orm(schedule),
                    employee=employee  # Có thể chuyển đổi bằng UserInfo.from_orm(employee) nếu cần
                ))
        
        return ListWorkScheduleResponse(
            message="Lấy danh sách thành công",
            data=response_data
        )
