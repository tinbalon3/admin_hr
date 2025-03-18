import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScheduleInternService } from '../../services/schedule-intern-service.service';
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
    CalendarComponent
  ],
  templateUrl: './schedule-intern.component.html',
  styleUrl: './schedule-intern.component.css'
})
export class ScheduleInternComponent {
 
  markers: CalendarMarkerData[] = [
    {
      date: addDays(new Date(), 1),
      data: {
        title: 'Đã đăng kí',
      },
    },
   
  ];
}
