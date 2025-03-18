import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScheduleInternServiceService } from '../../services/schedule-intern-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { addDays } from 'date-fns';
import { JsonPipe } from '@angular/common';
import { CalendarComponent, CalendarMarkerData } from '../../components/calendar/calendar.component';
interface ScheduleData {
  username: string;
  schedule: Record<string, boolean>;
}

@Component({
  selector: 'app-schedule-intern',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule,
    CalendarComponent, JsonPipe
  ],
  templateUrl: './schedule-intern.component.html',
  styleUrl: './schedule-intern.component.css'
})
export class ScheduleInternComponent {
  // days = [
  //   { key: '2', label: 'T2' },
  //   { key: '3', label: 'T3' },
  //   { key: '4', label: 'T4' },
  //   { key: '5', label: 'T5' },
  //   { key: '6', label: 'T6' },
  // ];
  // userName: any;
 
  // constructor(private scheduleService: ScheduleInternServiceService,private snackBar: MatSnackBar) {
  //    // Lấy thông tin người dùng từ localStorage
  //   // Kiểm tra nếu đang chạy trong môi trường trình duyệt
  //   if (typeof window !== 'undefined' && window.localStorage) {
  //     const userInfo = localStorage.getItem('inforuser');
  //     if (userInfo) {
  //       const parsedUser = JSON.parse(userInfo);
  //       this.userName = parsedUser.name || 'User Name';
     
  //     }
  //   }
  // }
  // displayedColumns: string[] = ['name', ...this.days.map(day => day.key)];

  // scheduleData: ScheduleData[] = [
  //   {
  //     username: "this.userName",
  //     schedule: {
  //       '2': false,
  //       '3': false,
  //       '4': false,
  //       '5': false,
  //       '6': false,
  //     },
  //   },
  // ];
  // showNotification(message: string, isError: boolean = false) {
  //   this.snackBar.open(message, 'Đóng', {
  //     duration: 4000,
  //     horizontalPosition: 'right',
  //     verticalPosition: 'top',
  //     panelClass: isError ? 'error-snackbar' : 'success-snackbar',
  //   });
  // }
  // submitSchedule() {
  //   const workDays = [];

  //   // Duyệt qua các ngày trong tuần và lấy ra những ngày được chọn
  //   for (const day of this.days) {
  //     if (this.scheduleData[0].schedule[day.key]) {
  //       workDays.push({ day_of_week: day.key });
  //     }
  //   }

  //   const payload = {
  //     work_days: workDays
  //   };
  //   console.log(payload);

  //   this.scheduleService.submitSchedule(payload).subscribe({
  //     next: () => {
  //      this.showNotification('Lưu lịch làm việc thành công');
  //     },
  //     error: (error) => {
  //       console.log(error);
  //       this.showNotification('Lưu lịch làm việc thất bại', true);
  //     }
  //   });
  // }

  markers: CalendarMarkerData[] = [
    {
      date: addDays(new Date(), 1),
      data: {
        title: 'Đã đăng kí',
      },
    },
    {
      date: addDays(new Date(), 1),
      data: {
        title: 'Đã đăng kí',
      },
    },
    {
      date: addDays(new Date(), 5),
      data: {
        title: 'Đã đăng kí',
      },
    },
  ];
}
