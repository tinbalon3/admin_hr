from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from uuid import UUID
from app.models.models import WorkSchedule, Employee
from app.schemas.schedule import WorkScheduleOut,ListWorkScheduleResponse, WorkScheduleCreate,Response
from app.utils.responses import ResponseHandler
from app.core.security import check_intern



class ScheduleService:
#     ['
#     "2025-03-25T17:00:00.000Z",
#     "2025-03-24T17:00:00.000Z",
#     "2025-03-26T17:00:00.000Z",
#     "2025-03-27T17:00:00.000Z"
# ]]
    @staticmethod
    def calculate_week_of_month(target_date: date) -> int:
        """Tính tuần thứ mấy trong tháng."""
        first_day_of_month = target_date.replace(day=1)
        adjusted_dom = target_date.day + first_day_of_month.weekday()
        return int((adjusted_dom - 1) / 7 + 1)

    @staticmethod
    def get_dates_for_week(current_date: date, selected_days: list):
        """Tự động tính toán ngày làm việc dựa trên day_of_week."""
        start_of_week = current_date - timedelta(days=current_date.weekday())
        work_days = []
 
        for day in selected_days:
            weekday = int(day) -  2 # Convert day_of_week to integer (e.g., 2 -> Monday)
            work_day = start_of_week + timedelta(days=weekday)
            work_days.append({
                "day_of_week": day,
                "day": work_day.day,
                "month": work_day.month,
                "year": work_day.year
            })

        return work_days

    @staticmethod
    def create_schedule(db: Session, token, schedule_data: WorkScheduleCreate):
        user = check_intern(token, db)
        current_date = datetime.now().date()
        # Tự động tính tuần, tháng, năm
        week_number = str(ScheduleService.calculate_week_of_month(current_date))
        start_month = str(current_date.month)
        start_year = str(current_date.year)
                
        

        # Kiểm tra lịch đã tồn tại chưa
        existing_schedule = db.query(WorkSchedule).filter(
            WorkSchedule.employee_id == user.id,
            WorkSchedule.week_number == week_number,
            WorkSchedule.start_month == start_month,
            WorkSchedule.start_year == start_year
        ).first()

        if existing_schedule:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Schedule for this week already exists."
            )
        # Tự động tính toán ngày làm việc dựa trên `day_of_week` được cung cấp
        selected_days = [day.day_of_week for day in schedule_data.work_days]
        work_days = ScheduleService.get_dates_for_week(current_date, selected_days)
        # Tạo mới lịch làm việc
        schedule = WorkSchedule(
            employee_id=user.id,
            week_number=week_number,
            start_month=start_month,
            start_year=start_year,
            work_days=work_days,
            created_at=datetime.utcnow()
        )
        
        db.add(schedule)
        db.commit()
        db.refresh(schedule)

        data_response = WorkScheduleOut.from_orm(schedule)
        return ResponseHandler.success('Đăng ký thành công', data_response)

    @staticmethod
    def getlist(db: Session, token):
        """Lấy danh sách lịch làm việc của tuần hiện tại các intern."""
        current_date = datetime.now().date()

        # Tự động tính tuần, tháng, năm
        week_number = str(ScheduleService.calculate_week_of_month(current_date))
        start_month = str(current_date.month)
        start_year = str(current_date.year)

        # Lấy lịch làm việc theo tuần hiện tại
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
                employee=employee
            ))

        # Trả về instance của ListWorkScheduleResponse
        return ListWorkScheduleResponse(
            message="Lấy danh sách thành công",
            data=response_data
        )
