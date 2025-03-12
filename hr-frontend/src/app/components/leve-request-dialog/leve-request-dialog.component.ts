import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VietnameseDateAdapter } from '../../customer/vietnamese-date-adapter';
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
export class LeveRequestDialogComponent {
  startDate: Date | null = null;
  endDate: Date | null = null;
  note: string = '';
  type: string = '';

  constructor(
    public dialogRef: MatDialogRef<LeveRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.startDate && this.endDate && this.type) {
      const leaveRequest = {
        startDate: this.startDate,
        endDate: this.endDate,
        note: this.note,
        type: this.type,
      };
      this.dialogRef.close(leaveRequest);
    }
  }
}