import { Component, OnInit } from '@angular/core';
import { format, startOfMonth, endOfMonth, addDays, isEqual, startOfDay, isBefore } from 'date-fns';
import { ScheduleInternService } from '../../services/schedule-intern-service.service';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RegistrationData, RegistrationDialogComponent } from '../../components/register-dialog/register-dialog.component';


interface WorkDay {
  day_of_week: string; // YYYY-MM-DD
  note: boolean;
}

interface AggregatedRegistration {
  intern: string;
  note: boolean;
}

interface AggregatedWorkDay {
  day_of_week: string;
  registrations: AggregatedRegistration[];
}

// Dữ liệu schedule từ API
interface ScheduleData {
  work_days: WorkDay[];
  id: string;
  created_at: string;
}

// Dữ liệu trả về từ API (vẫn giữ nguyên nếu chưa cần dùng employee)
interface ApiResponse {
  message: string;
  data: { schedule: ScheduleData; employee: { full_name: string } }[];
}

@Component({
  standalone: true,
  selector: 'app-list-schedule-intern',
  templateUrl: './list-schedule-intern.component.html',
  styleUrls: ['./list-schedule-intern.component.css'],
  imports: [CommonModule, MatDialogModule]
})
export class ListScheduleInternComponent implements OnInit {
  currentDate: Date = new Date();
  // Mảng các ngày đã đăng ký sau khi được tổng hợp từ API
  aggregatedRegisteredWorkDays: AggregatedWorkDay[] = [];

  // Các ngày đã chọn (nếu người dùng click để đăng ký)
  selectedDates: Date[] = [];
  // Danh sách các ngày đã đánh dấu để xoá (nếu có)
  datesToRemove: Date[] = [];

  constructor(
    private scheduleService: ScheduleInternService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchSchedule();
  }

  currentMonth(): string {
    return format(this.currentDate, 'MMMM yyyy');
  }

  daysInMonth(): Date[] {
    const start = startOfMonth(this.currentDate);
    const end = endOfMonth(this.currentDate);
    const days: Date[] = [];
    let day = start;
    while (!isBefore(end, day)) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }

  // Enrich ngày để hiển thị thêm thông tin (ví dụ: isToday, isPast, colStartClass)
  daysEnriched(): any[] {
    const days = this.daysInMonth();
    return days.map((day, i) => ({
      day: day,
      isToday: isEqual(day, startOfDay(new Date())),
      isPast: isBefore(day, startOfDay(new Date())),
      colStartClass: i === 0 ? this.COL_START_CLASSES[day.getDay()] : '',
      disableSelection: false
    }));
  }

  // Kiểm tra xem ngày có đăng ký (từ dữ liệu đã tổng hợp) không
  isRegistered(day: Date): boolean {
    return this.aggregatedRegisteredWorkDays.some(item =>
      isEqual(startOfDay(new Date(item.day_of_week)), startOfDay(day))
    );
  }

  // Trả về số lượng intern đã đăng ký cho ngày đó
  getRegistrationCount(day: Date): number {
    const reg = this.aggregatedRegisteredWorkDays.find(item =>
      isEqual(startOfDay(new Date(item.day_of_week)), startOfDay(day))
    );
    return reg ? reg.registrations.length : 0;
  }

  // Trả về danh sách tên các intern đăng ký cho ngày đó (chuỗi các tên, cách nhau bởi dấu phẩy)
  getInternNames(day: Date): string {
    const reg = this.aggregatedRegisteredWorkDays.find(item =>
      isEqual(startOfDay(new Date(item.day_of_week)), startOfDay(day))
    );
    if (reg && reg.registrations.length > 0) {
      const uniqueInterns = Array.from(new Set(reg.registrations.map(r => r.intern)));
      return uniqueInterns.join(', ');
    }
    return '';
  }

  fetchSchedule(): void {
    this.scheduleService.fectchScheduleList().subscribe({
      next: (res: ApiResponse) => {
        if (res.data && res.data.length > 0) {
          const aggregated: { [key: string]: AggregatedWorkDay } = {};
          res.data.forEach(item => {
            const internName = item.employee.full_name;
            item.schedule.work_days.forEach((wd: WorkDay) => {
              const key = wd.day_of_week;
              if (!aggregated[key]) {
                aggregated[key] = { day_of_week: wd.day_of_week, registrations: [] };
              }
              aggregated[key].registrations.push({ intern: internName, note: wd.note });
            });
          });
          this.aggregatedRegisteredWorkDays = Object.values(aggregated);
        }
      },
      error: (err) => console.error('Lỗi fetch schedule:', err)
    });
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.fetchSchedule();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.fetchSchedule();
  }

  toCurrentMonth(): void {
    this.currentDate = new Date();
    this.fetchSchedule();
  }

  private COL_START_CLASSES = ['', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7'];

  isMarkedForRemoval(day: Date): boolean {
    return false;
  }

  isSelected(day: Date): boolean {
    return this.selectedDates.some(d => isEqual(startOfDay(d), startOfDay(day)));
  }

  // Mở dialog hiển thị danh sách đăng ký của ngày được click
  handleDayClick(day: Date): void {
    const registrationData = this.aggregatedRegisteredWorkDays.find(item =>
      isEqual(startOfDay(new Date(item.day_of_week)), startOfDay(day))
    );
    if (registrationData) {
      this.dialog.open(RegistrationDialogComponent, {
        data: {
          day: format(day, 'yyyy-MM-dd'),
          registrations: registrationData.registrations
        } as RegistrationData,
        width: '300px'
      });
    } else {
      console.log('Ngày chưa có đăng ký:', day);
    }
  }
}
