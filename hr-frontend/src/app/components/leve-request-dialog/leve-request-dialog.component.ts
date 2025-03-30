import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { format } from 'date-fns';
import { LeaveRequestService } from '../../services/leave-request.service';
import { NotificationComponent } from '../notification/notification.component';
import { LeaveTypeService } from '../../services/leave-type.service';
@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    NotificationComponent
],
  providers: [
    provideNativeDateAdapter(), // Cung cấp DateAdapter và MAT_DATE_FORMATS mặc định
    { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' }, // Đặt locale là tiếng Việt (tùy chọn)
  ],
  templateUrl: './leve-request-dialog.component.html',
  styleUrls: ['./leve-request-dialog.component.css'],
})
export class LeveRequestDialogComponent implements OnInit {
  startDate: Date | null= null;
  endDate: Date | null= null;
  note: string = '';
 @ViewChild(NotificationComponent) notificationComponent?: NotificationComponent;
  leaveType :any;
  selectedLeaveType: string = '';
  constructor(
    public dialogRef: MatDialogRef<LeveRequestDialogComponent>,
    private leaveTypeService: LeaveTypeService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  ngOnInit(): void {
    this.fectchLeaveType();
  }
 
  cancel(): void {
    this.dialogRef.close();
  }
  fectchLeaveType(): void {
    this.leaveTypeService.getLeaveTypes().subscribe((data: any) => {
      this.leaveType = data.data;
    }
    )
  }
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
  submit(): void {
   
      const leaveRequest = {
        start_date: this.startDate,
        end_date: this.endDate,
        leave_type_id: this.selectedLeaveType,
        notes: this.note,
      };
      
        this.dialogRef.close(leaveRequest);
     
  }

}

