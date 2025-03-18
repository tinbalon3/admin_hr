import { Component, Input, TemplateRef } from '@angular/core';
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

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [DatePipe, NgClass, NgTemplateOutlet, NgFor, CommonModule, NgIf, MatTooltip],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
  @Input() markers: CalendarMarkerData[] = [];
  @Input() markerTpl!: TemplateRef<any>;

  public monthChange = output<Date>();
  protected currentDate = signal(startOfToday());
  protected selectedDate = signal<Date | null>(null);  // Ngày được chọn
  protected selectedDates = signal<Date[]>([]);  // Lưu nhiều ngày được chọn
  selectedDatesObject: { day_of_week: string; note: boolean }[] = []; 
  protected currentMonth = computed(() =>
    format(this.currentDate(), 'MMMM yyyy')
  );
  constructor(private scheduleService: ScheduleInternService) {}
  protected readonly startDateOfSelectedMonth = computed(() => startOfMonth(this.currentDate()));
  protected readonly endDateOfSelectedMonth = computed(() => endOfMonth(this.currentDate()));

  protected readonly days = computed(() => this.eachDayOfInterval({
    start: this.startDateOfSelectedMonth(),
    end: this.endDateOfSelectedMonth(),
  }));

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
    const formattedDay = format(day, 'yyyy-MM-dd');

    // Kiểm tra xem ngày đã có trong danh sách chưa
    const currentSelected = this.selectedDates();
    const isAlreadySelected = currentSelected.some(selected => isEqual(selected, day));

    if (isAlreadySelected) {
      // Nếu đã chọn, bỏ ngày đó khỏi danh sách
      this.selectedDates.set(currentSelected.filter(selected => !isEqual(selected, day)));
      this.selectedDatesObject = this.selectedDatesObject.filter(obj => obj.day_of_week !== formattedDay);

      console.log(`Bỏ chọn ngày: ${formattedDay}`);
    } else {
      // Nếu chưa có, thêm vào danh sách với note mặc định
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
    const formattedDay = format(day, 'yyyy-MM-dd');

    // Tìm ngày trong danh sách
    let existingDay = this.selectedDatesObject.find(obj => obj.day_of_week === formattedDay);

    if (!existingDay) {
      // Nếu ngày chưa có, thêm mới vào danh sách với note = true
      existingDay = { day_of_week: formattedDay, note: true };
      this.selectedDatesObject.push(existingDay);

      // Chỉ thêm vào selectedDates nếu chưa có
      if (!this.isSelected(day)) {
        this.selectedDates.set([...this.selectedDates(), day]);
      }

      console.log(`Chọn ngày ${formattedDay} làm nửa ngày`);
    } else {
      // Nếu ngày đã có, chỉ đổi trạng thái note mà không xóa ngày
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
}

export interface CalendarMarkerData<Data = any> {
  date: Date;
  data: Data;
}
