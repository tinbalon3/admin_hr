import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
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

import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { ScheduleInternService } from '../../services/schedule-intern-service.service';
import { startOfDay } from 'date-fns';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NotificationComponent } from '../../components/notification/notification.component';

interface NotificationData {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
  dismissable?: boolean;
}
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [DatePipe, NgClass, NgFor, CommonModule, MatTooltipModule, NgIf, MatIconModule, NotificationComponent],
  templateUrl: './schedule-intern.component.html',
  styleUrl: './schedule-intern.component.css'
})
export class ScheduleInternComponent implements OnInit {
  @ViewChild(NotificationComponent) notificationComponent?: NotificationComponent;
  public startOfDay = startOfDay;
  @Input() markers: CalendarMarkerData[] = [];
  @Input() markerTpl!: TemplateRef<any>;
  datesToRemove: Date[] = [];
  selectMonth: Date = new Date();
  public monthChange = output<Date>();
  protected currentDate = signal(startOfToday());
  protected selectedDate = signal<Date | null>(null);  // Ngày được chọn
  protected selectedDates = signal<Date[]>([]);  // Lưu nhiều ngày được chọn
  selectedDatesObject: { day_of_week: string; note: boolean }[] = [];
  schedule_id: string = ''; // Lưu schedule_id sau khi fetch
  // Đây là mảng lưu các ngày mới mà người dùng chọn để đăng ký (chưa tồn tại trong DB)
  newSelectedDatesObject: { day_of_week: string; note: boolean }[] = [];
  // Thêm thuộc tính mới để lưu thông tin đăng ký từ backend
  registeredDaysObject: { day_of_week: string; note: boolean }[] = [];

  protected currentMonth = computed(() =>
    format(this.currentDate(), 'MMMM yyyy')
  );
  

  ngOnInit(): void {
    const currentMonth = format(new Date(), 'MM'); // Lấy tháng hiện tại
    this.fetchUserSchedule(currentMonth);
  }
  constructor(private scheduleService: ScheduleInternService, private cdr: ChangeDetectorRef) { }
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
  protected readonly startDateOfSelectedMonth = computed(() => startOfMonth(this.currentDate()));
  protected readonly endDateOfSelectedMonth = computed(() => endOfMonth(this.currentDate()));
  registeredDays: Date[] = []; // Danh sách ngày đã đăng ký
  weekLocked: boolean = false; // Cờ kiểm tra tuần có bị khóa không
 
  protected readonly days = computed(() => this.eachDayOfInterval({
    start: this.startDateOfSelectedMonth(),
    end: this.endDateOfSelectedMonth(),
  }));


  updateSchedule(): void {
    const today = new Date();
    const currentWeekStart = this.getStartOfWeek(today);
    const currentWeekEnd = this.getEndOfWeek(today);
    const nextWeekStart = addDays(currentWeekStart, 7);
    const nextWeekEnd = addDays(currentWeekEnd, 7);
  
    const hasRemoved = this.datesToRemove.length > 0;
    const hasNewSelections = this.newSelectedDatesObject.length > 0;
  
    // Nếu có xoá, loại bỏ các ngày đó khỏi registeredDays
    if (hasRemoved) {
      console.log('Có ngày bị xoá:', this.datesToRemove);
      this.registeredDays = this.registeredDays.filter(day =>
        this.datesToRemove.every(rem =>
          startOfDay(rem).getTime() !== startOfDay(day).getTime()
        )
      );
    }
    console.log('Danh sách ngày đã đăng ký sau xoá:', this.registeredDays);
  
    // Chỉ xử lý những ngày thuộc tuần kế tiếp
    const remainingNextWeekDays = this.registeredDays.filter(day =>
      day >= nextWeekStart && day <= nextWeekEnd
    );
    const existingDays = remainingNextWeekDays.map(day => {
      const formatted = format(day, 'yyyy-MM-dd');
      const backendEntry = this.registeredDaysObject.find(obj => obj.day_of_week === formatted);
      return { day_of_week: formatted, note: backendEntry ? backendEntry.note : false };
    });
    
  
    // Nếu không có xoá và không có ngày mới được chọn, thì không có gì để cập nhật
    if (!hasRemoved && !hasNewSelections) {
      this.warn('Chưa có thay đổi nào được thực hiện.');
      return;
    }
    
    // Dữ liệu gửi đi: hợp nhất existingDays với các entry trong selectedDatesObject
    const data = { work_days: [...existingDays, ...this.selectedDatesObject] };
    this.datesToRemove = [];
    console.log("Dữ liệu gửi đi:", JSON.stringify(data, null, 2));
  
    // Sau khi thành công, cập nhật lại registeredDays và registeredDaysObject
    const onSuccess = () => {
      // Cập nhật registeredDaysObject với dữ liệu đã gửi đi (có chứa note từ người dùng)
      const mergedWorkDays = data.work_days;
      this.registeredDaysObject = mergedWorkDays;
      
      // Cập nhật lại registeredDays (chỉ lưu mảng Date) dựa trên mergedWorkDays
      const newDays = mergedWorkDays.map(obj => new Date(obj.day_of_week));
      const mergedDays = [...this.registeredDays, ...newDays];
      this.registeredDays = mergedDays.filter((day, index, self) =>
        index === self.findIndex(d => startOfDay(d).getTime() === startOfDay(day).getTime())
      );
     
      this.selectedDates.set(this.registeredDays);
      
      // Reset lại các mảng lưu trạng thái người dùng
      this.newSelectedDatesObject = [];
      this.selectedDatesObject = [];
      this.fetchUserSchedule(format(this.currentDate(), 'MM'));

    };
  
    if (this.schedule_id && this.schedule_id.trim() !== '') {
      console.log('Cập nhật lịch làm việc cho tuần tiếp theo:', data);
      this.scheduleService.editScheduleIntern(data, this.schedule_id).subscribe({
        next: () => {
          this.success('Đã cập nhật lịch làm việc!');
          onSuccess();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Lỗi khi cập nhật dữ liệu:", err);
          this.error('Có lỗi xảy ra khi cập nhật lịch làm việc!');
        }
      });
    } else {
      console.log('Gửi lịch làm việc mới:', data);
      this.scheduleService.submitSchedule(data).subscribe({
        next: () => {
          this.success('Đã lưu lịch làm việc mới!');
          onSuccess();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Lỗi khi gửi dữ liệu:", err);
          this.error('Có lỗi xảy ra khi lưu lịch làm việc!');
        }
      });
    }
    this.fetchUserSchedule(format(this.currentDate(), 'MM'));
  }
  
  
  
  

  // Hàm kiểm tra ngày quá khứ (có thể dùng date-fns isBefore)
  isPast(day: Date): boolean {
    return isBefore(day, startOfToday());
  }

  // Hàm kiểm tra nếu ngày đã được đánh dấu loại bỏ
  isMarkedForRemoval(day: Date): boolean {
    return this.datesToRemove.findIndex(d => this.startOfDay(d).getTime() === this.startOfDay(day).getTime()) > -1;
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
    const today = new Date();
    const currentWeekStart = this.getStartOfWeek(today);
    const currentWeekEnd = this.getEndOfWeek(today);
    const nextWeekStart = addDays(currentWeekStart, 7);
    const nextWeekEnd = addDays(currentWeekEnd, 7);
    
    // Kiểm tra xem trong tuần hiện tại có ít nhất 1 ngày đăng kí không
    const currentWeekHasRegistration = this.registeredDays.some(day => 
      day >= currentWeekStart && day <= currentWeekEnd
    );
    
    const selectedDates = this.selectedDates();
    return this.days().map((day, i) => {
      let enable = false;
      if (day < currentWeekStart) {
        enable = false;
      }
      // Tuần hiện tại: nếu đã có đăng kí thì disable, nếu chưa có thì cho phép chọn
      else if (day >= currentWeekStart && day <= currentWeekEnd) {
        enable = !currentWeekHasRegistration;
      }
      // Tuần kế tiếp luôn enable
      else if (day >= nextWeekStart && day <= nextWeekEnd) {
        enable = true;
      }
      else {
        enable = false;
      }
      
      return {
        day: day,
        isToday: isEqual(day, startOfToday()),
        isPast: isBefore(day, startOfToday()),
        isSelected: selectedDates.some(selected => isEqual(selected, day)),
        colStartClass: i === 0 ? this.COL_START_CLASSES[day.getDay()] : '',
        markers: this.markersMap().get(this.getMarkerMapKey(day)) || [],
        // Nếu ngày đã qua thì luôn disable; nếu không, dựa vào enable
        disableSelection: isBefore(day, startOfToday()) ? true : !enable
      };
    });
  });
  
  



  private readonly COL_START_CLASSES = ['', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7'];

  protected nextMonth() {
    this.currentDate.set(addMonths(this.currentDate(), 1));
    const nextMonth = format(this.currentDate(), 'MM');
    this.fetchUserSchedule(nextMonth);
    this.monthChange.emit(this.currentDate());
  }
  readonly #dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  protected readonly dayNamesFormatted = this.#dayNames.map((dayName) => ({
    dayName: dayName,
    isToday: dayName === format(startOfToday(), 'eee'),
  }));

  protected prevMonth() {
    this.currentDate.set(subMonths(this.currentDate(), 1));
    const prevMonth = format(this.currentDate(), 'MM');
    this.monthChange.emit(this.currentDate());
    this.fetchUserSchedule(prevMonth);
  }

  protected toCurrentMonth(): void {
    this.currentDate.set(startOfToday());
    this.monthChange.emit(this.currentDate());
  }

  protected getMarkerMapKey(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  selectDate(day: Date): void {
    // Nếu ngày đã được đăng ký từ DB thì không cho chọn lại
    if (this.isRegistered(day)) {
      console.warn(`Ngày ${format(day, 'yyyy-MM-dd')} đã được đăng ký.`);
      return;
    }
  
    const formattedDay = format(day, 'yyyy-MM-dd');
    // Kiểm tra xem ngày đã được chọn trong mảng newSelectedDatesObject hay chưa
    const exists = this.newSelectedDatesObject.some(obj => obj.day_of_week === formattedDay);
  
    if (exists) {
      // Nếu đã chọn rồi thì bỏ chọn: cập nhật cả newSelectedDatesObject và selectedDatesObject
      this.newSelectedDatesObject = this.newSelectedDatesObject.filter(obj => obj.day_of_week !== formattedDay);
      this.selectedDates.set(this.selectedDates().filter(selected => !isEqual(selected, day)));
      this.selectedDatesObject = this.selectedDatesObject.filter(obj => obj.day_of_week !== formattedDay);
      console.log(`Bỏ chọn ngày mới: ${formattedDay}`);
    } else {
      // Nếu chưa chọn, thêm ngày mới vào cả hai mảng để UI cập nhật màu
      this.newSelectedDatesObject.push({ day_of_week: formattedDay, note: false });
      this.selectedDates.set([...this.selectedDates(), day]);
      this.selectedDatesObject.push({ day_of_week: formattedDay, note: false });
      console.log(`Chọn ngày mới: ${formattedDay}`);
    }
  
    console.log('Danh sách ngày đăng ký mới:', this.newSelectedDatesObject);
  }
  

  handleDayClick(day: Date): void {
    // Lấy đối tượng day từ computed property để kiểm tra trạng thái disable
    const enrichedDay = this.daysEnriched().find(d => isEqual(d.day, day));
    if (enrichedDay && enrichedDay.disableSelection) {
      return;
    }
    
    if (this.isPast(day) || this.isWeekLocked(day)) {
      return;
    }
  
    if (this.isRegistered(day) && (this.getStartOfWeek(day).getTime() > this.getStartOfWeek(new Date()).getTime())) {
      this.toggleRemoveDate(day);
    } else {
      this.selectDate(day);
    }
  }
  getRegistrationMark(day: Date): string {
    if (this.isRegistered(day)) {
      const formattedDay = format(day, 'yyyy-MM-dd');
      // Ưu tiên tìm trong selectedDatesObject (dữ liệu người dùng chỉnh sửa)
      let reg = this.selectedDatesObject.find(obj => obj.day_of_week === formattedDay);
      // Nếu không có thì lấy từ dữ liệu từ backend
      if (!reg) {
        reg = this.registeredDaysObject.find(obj => obj.day_of_week === formattedDay);
      }
      return (reg && reg.note === true) ? '½ ngày' : '1 ngày';
    }
    return '';
  }
  
  
  
  /**
   * Đánh dấu ngày làm nửa ngày
   */
  toggleHalfDay(day: Date): void {
    const formattedDay = format(day, 'yyyy-MM-dd');
    // Tìm trong selectedDatesObject (sử dụng mảng duy nhất)
    let existingDay = this.selectedDatesObject.find(obj => obj.day_of_week === formattedDay);
    
    if (!existingDay) {
      // Nếu ngày chưa có, thêm mới với note = true (nửa ngày)
      existingDay = { day_of_week: formattedDay, note: true };
      this.selectedDatesObject.push(existingDay);
      // Đồng thời, thêm ngày vào newSelectedDatesObject nếu bạn cần gửi lên BE
      this.newSelectedDatesObject.push(existingDay);
      console.log(`Chọn ngày ${formattedDay} làm nửa ngày`);
    } else {
      // Toggle trạng thái note: nếu true => false, ngược lại
      existingDay.note = !existingDay.note;
      console.log(`Cập nhật ngày ${formattedDay}: ${existingDay.note}`);
    }
    
    console.log('Danh sách ngày làm việc (selectedDatesObject):', this.selectedDatesObject);
  }
  


  isSelected(day: Date): boolean {
    return this.selectedDatesObject.some(obj => obj.day_of_week === format(day, 'yyyy-MM-dd'));
  }


  isHalfDay(day: Date): boolean {
    return this.selectedDatesObject.some(obj => obj.day_of_week === format(day, 'yyyy-MM-dd') && obj.note === true);
  }

  fetchUserSchedule(month: string): void {
    this.scheduleService.fecthScheduleIntern(month).subscribe({
      next: (res: {
        message: string;
        data: {
          schedule: { work_days: { day_of_week: string; note: boolean }[], id: string, created_at: string },
          employee: any
        }[]
      }) => {
        const today = new Date();
        const currentWeekStart = this.getStartOfWeek(today);
        const currentWeekEnd = this.getEndOfWeek(today);
        const nextWeekStart = addDays(currentWeekStart, 7);
        const nextWeekEnd = addDays(currentWeekEnd, 7);
        console.log("Dữ liệu lịch đã đăng ký:", res);
        // Lưu thông tin đăng ký từ BE vào registeredDaysObject
        this.registeredDaysObject = res.data.flatMap(entry =>
          entry.schedule.work_days.map(day => ({
            day_of_week: day.day_of_week,
            note: day.note
          }))
        );
        
        // Chuyển đổi thành Date[] để dùng hiển thị (các ngày đăng ký từ DB)
        this.registeredDays = this.registeredDaysObject.map(obj => new Date(obj.day_of_week));
        this.selectedDates.set(this.registeredDays);
        
        // Xác định schedule_id cho tuần tiếp theo
        let nextWeekScheduleId = "";
        res.data.forEach(entry => {
          const workDays = entry.schedule.work_days.map(day => new Date(day.day_of_week));
          const workDaysNextWeek = workDays.filter(day => day >= nextWeekStart && day <= nextWeekEnd);
          if (workDaysNextWeek.length > 0) {
            nextWeekScheduleId = entry.schedule.id;
          }
        });
        
        if (nextWeekScheduleId) {
          this.schedule_id = nextWeekScheduleId;
          console.log("Lấy được schedule_id của tuần tiếp theo:", nextWeekScheduleId);
        } else {
          this.schedule_id = "";
          console.log("Không tìm thấy lịch cho tuần tiếp theo.");
        }
        
        console.log("Danh sách ngày đã đăng ký:", this.registeredDays);
      },
      error: (err) => {
        console.error("Lỗi khi fetch lịch đã đăng ký:", err);
      }
    });
  }
  
  
  
  

  isInNextWeek(day: Date): boolean {
    const today = new Date();
    const currentWeekStart = this.getStartOfWeek(today);
    // Tính toán đầu tuần và cuối tuần của tuần tiếp theo:
    const nextWeekStart = addDays(currentWeekStart, 7);
    const nextWeekEnd = addDays(this.getEndOfWeek(today), 7);
    return day >= nextWeekStart && day <= nextWeekEnd;
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
