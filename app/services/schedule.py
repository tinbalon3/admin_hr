from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.models import WorkSchedule
from app.schemas.schedule import WorkDay, WorkScheduleCreate
from uuid import UUID
from datetime import datetime, date, timedelta


class ScheduleService:

    @staticmethod
    def calculate_week_of_month(target_date: date) -> int:
        """Tính tuần thứ mấy trong tháng."""
        first_day_of_month = target_date.replace(day=1)
        adjusted_dom = target_date.day + first_day_of_month.weekday()
        return int((adjusted_dom - 1) / 7 + 1)

    @staticmethod
    def get_dates_for_week(current_date: date, selected_days_of_week: list):
        """Tự động tính toán ngày tương ứng với các ngày trong tuần được chọn."""
        start_of_week = current_date - timedelta(days=current_date.weekday())  # Bắt đầu từ thứ 2

        # Tính toán các ngày làm việc
        work_days = []
        for day_of_week in selected_days_of_week:
            day_index = int(day_of_week) - 1  # Vì Monday = 0
            work_day = start_of_week + timedelta(days=day_index)

            # ❌ Ràng buộc: Không cho phép đăng ký cho ngày hôm nay hoặc ngày đã qua
            if work_day <= current_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot register for {work_day} as it's today or a past date."
                )

            work_days.append({
                "day_of_week": day_of_week,
                "day": work_day.day,
                "month": work_day.month,
                "year": work_day.year
            })

        return work_days

    @staticmethod
    def create_schedule(db: Session, employee_id: UUID, schedule_data: WorkScheduleCreate):
        current_date = datetime.now().date()

        # Tự động tính tuần, tháng, năm
        week_number = ScheduleService.calculate_week_of_month(current_date)
        start_month = current_date.month
        start_year = current_date.year

        # Kiểm tra lịch đã tồn tại chưa
        existing_schedule = db.query(WorkSchedule).filter(
            WorkSchedule.employee_id == employee_id,
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
            employee_id=employee_id,
            week_number=week_number,
            start_month=start_month,
            start_year=start_year,
            work_days=work_days,
            created_at=datetime.utcnow()
        )

        db.add(schedule)
        db.commit()
        db.refresh(schedule)

        return schedule
