import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { DatePipe, NgClass, NgTemplateOutlet, CommonModule, NgFor, NgIf } from '@angular/common';
import {
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {
  addMonths,
  endOfMonth,
  format,
  isEqual,
  startOfMonth,
  startOfToday,
  subMonths,
  addDays,
  isBefore,
} from 'date-fns';

import { MatTooltip } from '@angular/material/tooltip';
import { ScheduleInternService } from '../../services/schedule-intern-service.service';
import { startOfDay } from 'date-fns';
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [DatePipe, NgClass, NgFor, CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  public startOfDay = startOfDay;
  @Input() markers: CalendarMarkerData[] = [];
  @Input() markerTpl!: TemplateRef<any>;
  datesToRemove: Date[] = [];
  public monthChange = output<Date>();
  protected currentDate = signal(startOfToday());
  protected selectedDate = signal<Date | null>(null);  // Ngày được chọn
  protected selectedDates = signal<Date[]>([]);  // Lưu nhiều ngày được chọn
  selectedDatesObject: { day_of_week: string; note: boolean }[] = [];
  protected currentMonth = computed(() =>
    format(this.currentDate(), 'MMMM yyyy')
  );
  constructor(private scheduleService: ScheduleInternService) { }
  ngOnInit(): void {
    const currentMonth = format(new Date(), 'MM'); // Lấy tháng hiện tại
    this.fetchUserSchedule(currentMonth);
  }
  protected readonly startDateOfSelectedMonth = computed(() => startOfMonth(this.currentDate()));
  protected readonly endDateOfSelectedMonth = computed(() => endOfMonth(this.currentDate()));
  registeredDays: Date[] = []; // Danh sách ngày đã đăng ký
  weekLocked: boolean = false; // Cờ kiểm tra tuần có bị khóa không
  
  protected readonly days = computed(() => this.eachDayOfInterval({
    start: this.startDateOfSelectedMonth(),
    end: this.endDateOfSelectedMonth(),
  }));
  updateSchedule(): void {
    // Loại bỏ các ngày được đánh dấu khỏi selectedDates
    this.selectedDates.set(this.selectedDates().filter(day =>
      this.datesToRemove.every(rem => startOfDay(rem).getTime() !== startOfDay(day).getTime())
    ));
  
    // Cập nhật selectedDatesObject theo cùng điều kiện
    this.selectedDatesObject = this.selectedDatesObject.filter(obj =>
      this.datesToRemove.every(rem => startOfDay(new Date(obj.day_of_week)).getTime() !== startOfDay(rem).getTime())
    );
  
    // Cập nhật lại registeredDays nếu bạn muốn hiển thị giao diện (ô đăng ký không còn hiển thị màu xanh)
    this.registeredDays = this.registeredDays.filter(day =>
      this.datesToRemove.every(rem => startOfDay(rem).getTime() !== startOfDay(day).getTime())
    );
  
    console.log("Danh sách ngày sau khi loại bỏ:", this.selectedDates(), this.selectedDatesObject);
  
    // Sau khi cập nhật, xóa danh sách đánh dấu
    this.datesToRemove = [];
  
    // Gọi hàm submitSchedule để gửi dữ liệu đã cập nhật
    this.submitSchedule();
  }
 // Hàm xử lý click vào ngày
handleDayClick(day: Date): void {
  // Nếu ngày quá khứ hoặc tuần bị khóa thì không xử lý
  if (this.isPast(day) || this.isWeekLocked(day)) {
    return;
  }
  
  // Nếu ngày đã đăng ký và thuộc tuần tương lai
  if (this.isRegistered(day) && (this.getStartOfWeek(day).getTime() > this.getStartOfWeek(new Date()).getTime())) {
    this.toggleRemoveDate(day);
  } else {
    this.selectDate(day);
  }
}

// Hàm kiểm tra ngày quá khứ (có thể dùng date-fns isBefore)
isPast(day: Date): boolean {
  return isBefore(day, startOfToday());
}

// Hàm kiểm tra nếu ngày đã được đánh dấu loại bỏ
isMarkedForRemoval(day: Date): boolean {
  return this.datesToRemove.findIndex(d => this.startOfDay(d).getTime() === this.startOfDay(day).getTime()) > -1;
}

  
  submitSchedule(): void {
    // Đảm bảo dữ liệu được đóng gói trong object có key "work_days"
    const data = {
      work_days: this.selectedDatesObject
    };

    console.log("Dữ liệu gửi đi:", JSON.stringify(data, null, 2)); // Debug log dữ liệu gửi đi

    this.scheduleService.submitSchedule(data).subscribe(
      (res) => {
        alert('Đã lưu lịch làm việc!');
      },
      (error) => {
        console.error("Lỗi khi gửi dữ liệu:", error); // Log lỗi để kiểm tra chi tiết
        alert('Có lỗi xảy ra!');
      }
    );
  }

  toggleRemoveDate(day: Date): void {
    const today = startOfDay(new Date());
    const currentWeekStart = this.getStartOfWeek(today);
    const dayWeekStart = this.getStartOfWeek(day);
    // Chỉ cho phép loại bỏ nếu ngày thuộc vào tuần tương lai (khác với tuần hiện tại)
    if (dayWeekStart.getTime() > currentWeekStart.getTime()) {
      const index = this.datesToRemove.findIndex(d => startOfDay(d).getTime() === startOfDay(day).getTime());
      if (index > -1) {
        // Nếu đã được đánh dấu rồi thì bỏ đánh dấu
        this.datesToRemove.splice(index, 1);
        console.log(`Bỏ đánh dấu loại bỏ ngày: ${format(day, 'yyyy-MM-dd')}`);
      } else {
        // Đánh dấu ngày để loại bỏ
        this.datesToRemove.push(day);
        console.log(`Đánh dấu loại bỏ ngày: ${format(day, 'yyyy-MM-dd')}`);
      }
    } else {
      console.warn("Chỉ cho phép loại bỏ những ngày đăng ký ở tương lai.");
    }
  }
  
  /**
   * Kiểm tra nếu một ngày nằm trong khoảng từ `startDate` đến `endDate`
   */
  isDateWithinInterval(date: Date, startDate: Date, endDate: Date): boolean {
    console.log('date:', date, 'startDate:', startDate, 'endDate:', endDate);
    return date >= startDate && date <= endDate;
  }
  eachDayOfInterval(interval: { start: Date; end: Date }): Date[] {
    const dates = [];
    let current = interval.start;
    while (!isBefore(interval.end, current)) {
      dates.push(current);
      current = addDays(current, 1);
    }
    return dates;
  }

  private readonly markersMap = computed(() => {
    const map: Map<string, CalendarMarkerData[]> = new Map();
    this.markers.forEach((marker) => {
      const date = marker.date;
      const markers = map.get(this.getMarkerMapKey(date)) || [];
      markers.push(marker);
      map.set(this.getMarkerMapKey(date), markers);
    });
    return map;
  });

  protected readonly daysEnriched = computed(() => {
    const selectedDates = this.selectedDates();

    return this.days().map((day, i) => {
      return {
        day: day,
        isToday: isEqual(day, startOfToday()),
        isPast: isBefore(day, startOfToday()),
        isSelected: selectedDates.some(selected => isEqual(selected, day)),
        colStartClass: i === 0 ? this.COL_START_CLASSES[day.getDay()] : '',
        markers: this.markersMap().get(this.getMarkerMapKey(day)) || [],
      };
    });
  });



  private readonly COL_START_CLASSES = ['', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7'];

  protected nextMonth() {
    this.currentDate.set(addMonths(this.currentDate(), 1));
    this.monthChange.emit(this.currentDate());
  }
  readonly #dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  protected readonly dayNamesFormatted = this.#dayNames.map((dayName) => ({
    dayName: dayName,
    isToday: dayName === format(startOfToday(), 'eee'),
  }));

  protected prevMonth() {
    this.currentDate.set(subMonths(this.currentDate(), 1));
    this.monthChange.emit(this.currentDate());
  }

  protected toCurrentMonth(): void {
    this.currentDate.set(startOfToday());
    this.monthChange.emit(this.currentDate());
  }

  protected getMarkerMapKey(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  selectDate(day: Date): void {
    // Kiểm tra nếu ngày thuộc một tuần đã bị khóa
    if (this.isWeekLocked(day)) {
      console.warn("Không thể chọn ngày vì tuần này đã có ngày đăng ký.");
      return;
    }
  
    const formattedDay = format(day, 'yyyy-MM-dd');
    const currentSelected = this.selectedDates();
    const isAlreadySelected = currentSelected.some(selected => isEqual(selected, day));
  
    if (isAlreadySelected) {
      this.selectedDates.set(currentSelected.filter(selected => !isEqual(selected, day)));
      this.selectedDatesObject = this.selectedDatesObject.filter(obj => obj.day_of_week !== formattedDay);
      console.log(`Bỏ chọn ngày: ${formattedDay}`);
    } else {
      this.selectedDates.set([...currentSelected, day]);
      this.selectedDatesObject.push({ day_of_week: formattedDay, note: false });
      console.log(`Chọn ngày: ${formattedDay}`);
    }
  
    console.log('Danh sách ngày làm việc:', this.selectedDatesObject);
  }
  
  
  /**
   * Đánh dấu ngày làm nửa ngày
   */
  toggleHalfDay(day: Date): void {
    if (this.isCurrentWeekLocked()) {
      console.warn("Không thể chỉnh sửa ngày làm nửa ngày vì tuần hiện tại đã có ngày đăng ký.");
      return;
    }
  
    const formattedDay = format(day, 'yyyy-MM-dd');
    let existingDay = this.selectedDatesObject.find(obj => obj.day_of_week === formattedDay);
  
    if (!existingDay) {
      existingDay = { day_of_week: formattedDay, note: true };
      this.selectedDatesObject.push(existingDay);
      if (!this.isSelected(day)) {
        this.selectedDates.set([...this.selectedDates(), day]);
      }
      console.log(`Chọn ngày ${formattedDay} làm nửa ngày`);
    } else {
      existingDay.note = !existingDay.note;
      console.log(`Cập nhật ngày ${formattedDay}: ${existingDay.note}`);
    }
  
    console.log('Danh sách ngày làm việc:', this.selectedDatesObject);
  }
  

  isSelected(day: Date): boolean {
    return this.selectedDatesObject.some(obj => obj.day_of_week === format(day, 'yyyy-MM-dd'));
  }


  isHalfDay(day: Date): boolean {
    return this.selectedDatesObject.some(obj => obj.day_of_week === format(day, 'yyyy-MM-dd') && obj.note === true);
  }

  fetchUserSchedule(month: string): void {
    this.scheduleService.fecthScheduleIntern(month).subscribe(
      (res: { 
        message: string; 
        data: { 
          schedule: { work_days: { day_of_week: string; note: boolean }[], id: string, created_at: string },
          employee: any 
        }[] 
      }) => {
        // Chuyển đổi danh sách ngày làm việc từ API thành Date[]
        const workDays = res.data.flatMap(entry =>
          entry.schedule.work_days.map(day => new Date(day.day_of_week))
        );
  
        // Cập nhật danh sách ngày đã đăng ký
        this.registeredDays = workDays;
        // Đồng thời cập nhật signal để hiển thị màu xanh cho ô đó
        this.selectedDates.set(workDays);
        
        console.log("Danh sách ngày đã đăng ký:", this.registeredDays);
      },
      (error) => {
        console.error("Lỗi khi fetch lịch đã đăng ký:", error);
      }
    );
  }
  
  
  isWeekLocked(date: Date): boolean {
    const today = new Date();
    const startOfWeekDate = this.getStartOfWeek(date);
    const endOfWeekDate = this.getEndOfWeek(date);
    // Chỉ kiểm tra khóa nếu tuần của ngày được chọn chứa ngày hôm nay (tức là tuần hiện tại)
    if (today >= startOfWeekDate && today <= endOfWeekDate) {
      return this.registeredDays.some(day => day >= startOfWeekDate && day <= endOfWeekDate);
    }
    return false;
  }
  


  /**
 * Kiểm tra nếu tuần hiện tại có ngày đã đăng ký => Khóa chỉnh sửa
 */
  isCurrentWeekLocked(): boolean {
    const today = new Date();
    const startOfWeek = this.getStartOfWeek(today);
    const endOfWeek = this.getEndOfWeek(today);
  
    return this.registeredDays.some(day => day >= startOfWeek && day <= endOfWeek);
  }
  isRegistered(date: Date): boolean {
    return this.registeredDays.some(d => startOfDay(d).getTime() === startOfDay(date).getTime());
  }
  getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Đưa về chủ nhật đầu tuần
    return start;
  }
  
  getEndOfWeek(date: Date): Date {
    const end = new Date(date);
    end.setDate(date.getDate() + (6 - date.getDay())); // Đưa về thứ bảy cuối tuần
    return end;
  }
  
  
}

export interface CalendarMarkerData<Data = any> {
  date: Date;
  data: Data;
}
