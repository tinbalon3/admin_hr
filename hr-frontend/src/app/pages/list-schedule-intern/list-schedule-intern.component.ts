import { Component, OnInit, ViewChild } from '@angular/core';
import { startOfMonth, endOfMonth, addDays, isEqual, startOfDay, isBefore, startOfToday, format } from 'date-fns';
import { formatWithOptions } from 'date-fns/fp';
import { vi } from 'date-fns/locale';
import { ScheduleInternService } from '../../services/schedule-intern-service.service';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RegistrationData, RegistrationDialogComponent } from '../../components/register-dialog/register-dialog.component';
import { NotificationComponent } from '../../components/notification/notification.component';


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
  imports: [CommonModule, MatDialogModule,NotificationComponent]
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
    const formatLocalized = formatWithOptions({ locale: vi });
    return formatLocalized('LLLL yyyy')(this.currentDate);
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

  daysEnriched(): any[] {
    const days = this.daysInMonth();
    const today = startOfDay(new Date());
    
    return days.map((day, i) => {
      return {
        day: day,
        isToday: isEqual(day, today),
        colStartClass: i === 0 ? this.COL_START_CLASSES[day.getDay()] : ''
      };
    });
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
  readonly #dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  private formatDate = formatWithOptions({ locale: vi });

  protected readonly dayNamesFormatted = this.#dayNames.map((dayName) => ({
    dayName: dayName,
    isToday: dayName === this.formatDate('eee')(startOfToday()),
  }));
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
      error: (err) => this.error(err.error.detail || 'Đã xảy ra lỗi khi tải dữ liệu lịch')
    });
  }
  @ViewChild(NotificationComponent) notificationComponent?: NotificationComponent;
  private notify(type: 'success' | 'error' | 'info' | 'warning', message: string) {
    if (this.notificationComponent) {
      this.notificationComponent.data = {
        message,
        type,
        duration: 3000,
        dismissable: true
      };
    }
  }

  private success(message: string) {
    this.notify('success', message);
  }

  private error(message: string) {
    this.notify('error', message);
  }

  private warn(message: string) {
    this.notify('warning', message);
  }

  private info(message: string) {
    this.notify('info', message);
  }
  prevMonth(): void {
    const newDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.currentDate = newDate;
    this.fetchSchedule();
  }

  nextMonth(): void {
    const newDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.currentDate = newDate;
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
          day: this.formatDate('yyyy-MM-dd')(day),
          registrations: registrationData.registrations
        } as RegistrationData,
        width: '300px'
      });
    } else {
      this.warn(`Ngày chưa có đăng ký:, ${this.formatDate('dd/MM/yyyy')(day)}`);
    }
  }
}
