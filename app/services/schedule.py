import logging
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
import uuid
from app.models.models import WorkSchedule, Employee
from app.schemas.schedule import WorkScheduleCreate, WorkScheduleOut, ListWorkScheduleResponse, Response,Response_2,notification
from app.utils.responses import ResponseHandler
from app.core.security import verify_token, check_intern, check_admin, check_user_exist


logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
if not logger.handlers:
    import os
    log_dir = os.path.join(os.path.dirname(__file__), "..", "logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "app.log")
    handler = logging.FileHandler(log_file, encoding="utf-8")

    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)


class ScheduleService:

    @staticmethod
    def calculate_week_of_month(target_date: date) -> int:
        """Tính tuần thứ mấy trong tháng."""
        first_day_of_month = target_date.replace(day=1)
        adjusted_dom = target_date.day + first_day_of_month.weekday()
        week = int((adjusted_dom - 1) / 7 + 1)
        logger.debug(f"Calculated week {week} for date {target_date}")
        return week

    @staticmethod
    def create_schedule_multi(db: Session, token: HTTPAuthorizationCredentials, schedule_data: WorkScheduleCreate):
        """
        Tạo lịch làm việc cho nhiều tuần dựa trên danh sách các ngày truyền vào.
        Nhóm các ngày theo (week_number, month, year) dựa trên trường 'day' của WorkDay.
        Dữ liệu work_days được lưu dưới dạng list các dict, ví dụ: [{"day": "2025-03-24"}, {"day": "2025-03-25"}].
        """
        verify_token(token=token)
        user = check_intern(token, db)
        if not user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không phải là intern.")

        if not schedule_data.work_days:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Danh sách ngày làm việc trống.")

        groups = {}
        # Lặp qua từng WorkDay, sử dụng thuộc tính 'day' (kiểu date)
        for wd in schedule_data.work_days:
            d = wd.day_of_week  # Sử dụng thuộc tính 'day' thay vì 'day_of_week'
            week_number = str(ScheduleService.calculate_week_of_month(d))
            month_str = str(d.month)
            year_str = str(d.year)
            key = (week_number, month_str, year_str)
            groups.setdefault(key, []).append({"day_of_week": d.isoformat()})
            logger.debug(f"Grouping date {d} into week {week_number}, month {month_str}, year {year_str}")

        created_schedules = []
        for (week_number, month_str, year_str), dates_list in groups.items():
            # Kiểm tra nếu lịch cho nhóm này đã tồn tại
            existing_schedule = db.query(WorkSchedule).filter(
                WorkSchedule.employee_id == user.id,
                WorkSchedule.week_number == week_number,
                WorkSchedule.start_month == month_str,
                WorkSchedule.start_year == year_str
            ).first()
            if existing_schedule:
                logger.warning(f"Schedule for week {week_number} of {month_str}/{year_str} already exists for user {user.id}. Skipping.")
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"lịch cho tuần {week_number} của {month_str}/{year_str} đã tồn tại")

            new_schedule = WorkSchedule(
                id=uuid.uuid4(),
                employee_id=user.id,
                week_number=week_number,
                start_month=month_str,
                start_year=year_str,
                work_days=jsonable_encoder(dates_list),  # Lưu list of dicts
                created_at=datetime.utcnow()
            )
            try:
                db.add(new_schedule)
                db.commit()
                db.refresh(new_schedule)
                logger.info(f"Created schedule {new_schedule.id} for week {week_number} of {month_str}/{year_str}")
                created_schedules.append(WorkScheduleOut.from_orm(new_schedule))
            except Exception as e:
                db.rollback()
                logger.error(f"Error creating schedule for week {week_number} of {month_str}/{year_str}: {e}")
        


        return ResponseHandler.success("Đăng ký lịch thành công")
    @staticmethod
    def getlist(db: Session, token: HTTPAuthorizationCredentials) -> ListWorkScheduleResponse:
        # Kiểm tra token và quyền admin
        verify_token(token=token)
        check_admin(token=token, db=db)
        
        current_date = datetime.now().date()
        start_month = str(current_date.month)
        start_year = str(current_date.year)

        # Lấy danh sách lịch làm việc theo tháng
        schedules = db.query(WorkSchedule).filter(
            WorkSchedule.start_month == start_month,
            WorkSchedule.start_year == start_year
        ).all() or None
        
        response_data = []
        if schedules:
            # Tạo response data với thông tin employee
            for schedule in schedules:
                employee = db.query(Employee).filter(Employee.id == schedule.employee_id).first()
                response_data.append(Response(
                    schedule=WorkScheduleOut.from_orm(schedule),
                    employee=employee  # Nếu cần, chuyển đổi bằng UserInfo.from_orm(employee)
                ))
        else:
            logger.warning("Không tìm thấy lịch làm việc nào trong tháng hiện tại.")
        

        return ListWorkScheduleResponse(
            message="Lấy danh sách thành công",
            data=response_data
        )
    @staticmethod
    def user_get_list_in_month(db: Session, month: str, token: HTTPAuthorizationCredentials) -> ListWorkScheduleResponse:
        
        try:
            month_int = int(month)
            if month_int < 1 or month_int > 12:
                raise ValueError()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tháng không hợp lệ. Vui lòng nhập số từ 1 đến 12."
            )
        
        # Kiểm tra token và quyền admin
        verify_token(token=token)
        employee = check_user_exist(token=token, db=db)
        
        # Lấy danh sách lịch làm việc theo tháng của user
        schedules = db.query(WorkSchedule).filter(
            WorkSchedule.start_month == str(month_int),
            WorkSchedule.employee_id == employee.id
        ).all()
        
        response_data = []
        # Nếu có lịch, lặp qua và xây dựng response
        if schedules:
            for schedule in schedules:
                response_data.append(Response_2(
                    schedule=WorkScheduleOut.from_orm(schedule),
                ))
        
        return ListWorkScheduleResponse(
            message="Lấy danh sách thành công",
            data=response_data
        )

    @staticmethod
    def edit_schedule_multi(db: Session, token: HTTPAuthorizationCredentials, schedule_id: str, new_schedule_data: WorkScheduleCreate) -> notification:
            """
            Sửa lịch làm việc cho một lịch cụ thể (chỉ cập nhật trường day_of_week)
            nếu lịch đó chưa bắt đầu.
            Yêu cầu: Tất cả các ngày trong lịch hiện tại phải là tương lai (sau ngày hôm nay).
            Sau đó, cập nhật trường work_days dựa trên new_schedule_data.
            """
            # Kiểm tra token và lấy user_id
            verify_token(token=token)
            user_id = check_user_exist(token=token)
            logger.info(f"Người dùng {user_id} đang cố gắng sửa lịch {schedule_id}")

            # Lấy lịch cần sửa của người dùng
            schedule = db.query(WorkSchedule).filter(
                WorkSchedule.id == schedule_id,
                WorkSchedule.employee_id == user_id.id
            ).first()
            if not schedule:
                logger.error(f"Không tìm thấy lịch {schedule_id} của người dùng {user_id}")
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lịch không tồn tại hoặc không thuộc về bạn.")

            # Kiểm tra xem lịch đã bắt đầu chưa:
            # Giả sử work_days được lưu dưới dạng list các dict: [{"day_of_week": "2025-03-24"}, ...]
            try:
                existing_dates = [datetime.fromisoformat(item["day_of_week"]).date() for item in schedule.work_days]
                earliest_date = min(existing_dates)
                logger.debug(f"Ngày sớm nhất trong lịch: {earliest_date}")
            except Exception as e:
                logger.error(f"Lỗi xử lý work_days cho lịch {schedule_id}: {e}")
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Lỗi xử lý lịch làm việc hiện tại.")

            if earliest_date <= date.today():
                logger.warning(f"Lịch {schedule_id} đã bắt đầu (ngày sớm nhất: {earliest_date}). Không thể sửa.")
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Lịch đã bắt đầu, không thể sửa.")

            # Chuyển đổi new_schedule_data.work_days thành list các dict với key "day_of_week"
            # Giả sử schema WorkScheduleCreate có field work_days với từng đối tượng WorkDay có thuộc tính day_of_week (kiểu date)
            new_work_days = [{"day_of_week": wd.day_of_week.isoformat()} for wd in new_schedule_data.work_days]
            logger.debug(f"Work_days mới sẽ được cập nhật: {new_work_days}")

            # Cập nhật lịch
            schedule.work_days = new_work_days
            try:
                db.commit()
                db.refresh(schedule)
                logger.info(f"Sửa lịch {schedule_id} thành công")
            except Exception as e:
                db.rollback()
                logger.error(f"Lỗi cập nhật lịch {schedule_id}: {e}")
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Lỗi khi cập nhật lịch.")

            return ResponseHandler.success("Cập nhật thành công")


