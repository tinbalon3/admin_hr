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

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [DatePipe, NgClass, NgTemplateOutlet, NgFor, CommonModule, NgIf],
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

  protected currentMonth = computed(() =>
    format(this.currentDate(), 'MMMM yyyy')
  );

  protected readonly startDateOfSelectedMonth = computed(() => startOfMonth(this.currentDate()));
  protected readonly endDateOfSelectedMonth = computed(() => endOfMonth(this.currentDate()));

  protected readonly days = computed(() => this.eachDayOfInterval({
    start: this.startDateOfSelectedMonth(),
    end: this.endDateOfSelectedMonth(),
  }));

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

  // selectDate(day: Date): void {
  //   const currentSelected = this.selectedDate();
  //   if (currentSelected && isEqual(currentSelected, day)) {
  //     this.selectedDate.set(null); // Nếu đã chọn thì bỏ chọn
  //     console.log('Bỏ chọn ngày:', format(day, 'dd/MM/yyyy'));
  //   } else {
  //     this.selectedDate.set(day); // Nếu chưa chọn thì chọn ngày đó
  //     console.log('Ngày được chọn:', format(day, 'dd/MM/yyyy'));
  //   }
  // }
  selectDate(day: Date): void {
    const currentSelected = this.selectedDates();
    
    // Kiểm tra xem ngày đã tồn tại chưa
    const isAlreadySelected = currentSelected.some(selected =>
      isEqual(selected, day)
    );
  
    if (isAlreadySelected) {
      // Bỏ chọn ngày
      this.selectedDates.set(currentSelected.filter(selected => !isEqual(selected, day)));
      console.log('Bỏ chọn ngày:', format(day, 'dd/MM/yyyy'));
      console.log('Ngày được chọn:', this.selectedDates());
    } else {
      // Thêm ngày mới
      this.selectedDates.set([...currentSelected, day]);
      console.log('Chọn ngày:', format(day, 'dd/MM/yyyy'));
      console.log('Ngày được chọn:', this.selectedDates());
    }
  }
  
}

export interface CalendarMarkerData<Data = any> {
  date: Date;
  data: Data;
}
