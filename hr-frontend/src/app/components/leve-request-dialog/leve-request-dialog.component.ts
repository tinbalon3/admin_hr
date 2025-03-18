import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ListTypeService } from '../../services/list-type.service';
import { format } from 'date-fns';
import { LeaveRequestService } from '../../services/leave-request.service';
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

  leaveType :any;
  selectedLeaveType: string = '';
  constructor(
    public dialogRef: MatDialogRef<LeveRequestDialogComponent>,
    private listTypeService: ListTypeService,
    private leaveRequestService: LeaveRequestService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  ngOnInit(): void {
    this.fectchLeaveType();
  }
 
 

  cancel(): void {
    this.dialogRef.close();
  }
  fectchLeaveType(): void {
    this.listTypeService.get_list_type().subscribe((data: any) => {
      this.leaveType = data.data;
    }
    )
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

