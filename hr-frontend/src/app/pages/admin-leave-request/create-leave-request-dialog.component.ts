import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveRequestService } from '../../services/leave-request.service';
import { LeaveTypeService } from '../../services/leave-type.service';
import { NotificationComponent } from '../../components/notification/notification.component';

@Component({
  selector: 'app-create-leave-request-dialog',
  template: `
    <app-notification></app-notification>
    <div class="p-6">
      <h2 mat-dialog-title class="text-xl font-bold mb-4">Tạo đơn nghỉ phép cho {{data.employeeName}}</h2>
      <mat-dialog-content>
        <form [formGroup]="leaveRequestForm" class="space-y-4">
          <!-- Loading spinner for leave types -->
          <div *ngIf="loadingTypes" class="flex justify-center my-4">
            <mat-spinner diameter="30"></mat-spinner>
          </div>

          <!-- Loại nghỉ phép -->
          <mat-form-field class="w-full">
            <mat-label>Loại nghỉ phép</mat-label>
            <mat-select formControlName="leave_type_id" [disabled]="loadingTypes">
              <mat-option *ngFor="let type of leaveTypes" [value]="type.id">
                {{type.type_name}}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="leaveRequestForm.get('leave_type_id')?.touched && leaveRequestForm.get('leave_type_id')?.errors">
              {{ getErrorMessage('leave_type_id') }}
            </mat-error>
          </mat-form-field>

          <!-- Ngày bắt đầu -->
          <mat-form-field class="w-full">
            <mat-label>Ngày bắt đầu</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="start_date">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
            <mat-error *ngIf="leaveRequestForm.get('start_date')?.touched && leaveRequestForm.get('start_date')?.errors">
              {{ getErrorMessage('start_date') }}
            </mat-error>
          </mat-form-field>

          <!-- Ngày kết thúc -->
          <mat-form-field class="w-full">
            <mat-label>Ngày kết thúc</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="end_date">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
            <mat-error *ngIf="leaveRequestForm.get('end_date')?.touched && leaveRequestForm.get('end_date')?.errors">
              {{ getErrorMessage('end_date') }}
            </mat-error>
          </mat-form-field>

          <!-- Ghi chú -->
          <mat-form-field class="w-full">
            <mat-label>Ghi chú</mat-label>
            <textarea matInput formControlName="notes" rows="3" placeholder="Nhập ghi chú (nếu có)"></textarea>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="mt-4">
        <button mat-button (click)="dialogRef.close()">
          Hủy bỏ
        </button>
        <button mat-raised-button color="primary" 
                (click)="onSubmit()" 
                [disabled]="loading || loadingTypes || leaveRequestForm.invalid">
          <mat-spinner *ngIf="loading" diameter="20" class="mr-2 inline-block"></mat-spinner>
          <span>Tạo đơn nghỉ phép</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    NotificationComponent
  ],
  providers: [
    MatDatepickerModule,
    { provide: DateAdapter, useClass: NativeDateAdapter }
  ]
})
export class CreateLeaveRequestDialogComponent implements OnInit {
  leaveRequestForm: FormGroup;
  loading = false;
  loadingTypes = false;
  leaveTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private leaveRequestService: LeaveRequestService,
    private leaveTypeService: LeaveTypeService,
    public dialogRef: MatDialogRef<CreateLeaveRequestDialogComponent>,
  
    @Inject(MAT_DIALOG_DATA) public data: { employeeId: number, employeeName: string }
  ) {
    this.leaveRequestForm = this.fb.group({
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
      leave_type_id: ['', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadLeaveTypes();
  }

  loadLeaveTypes() {
    this.loadingTypes = true;
    this.leaveTypeService.getLeaveTypes().subscribe({
      next: (types) => {
        this.leaveTypes = types.data;
        this.loadingTypes = false;
      },
      error: (error) => {
        this.error('Không thể tải loại nghỉ phép');
        this.loadingTypes = false;
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.leaveRequestForm.get(controlName);
    if (!control?.errors || !control.touched) return '';

    const errors = control.errors;
    
    switch (controlName) {
      case 'start_date':
        if (errors['required']) return 'Ngày bắt đầu là bắt buộc';
        break;
      
      case 'end_date':
        if (errors['required']) return 'Ngày kết thúc là bắt buộc';
        break;
      
      case 'leave_type_id':
        if (errors['required']) return 'Loại nghỉ phép là bắt buộc';
        break;
    }
    
    return 'Giá trị không hợp lệ';
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
  onSubmit() {
    if (this.leaveRequestForm.invalid) {
      Object.keys(this.leaveRequestForm.controls).forEach(key => {
        const control = this.leaveRequestForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;

    // Format dates to remove time component
    const formatDate = (date: Date) => {
      return date ? date.toISOString().split('T')[0] : null;
    };

    const request = {
      ...this.leaveRequestForm.value,
      employee_id: this.data.employeeId,
      start_date: formatDate(this.leaveRequestForm.value.start_date),
      end_date: formatDate(this.leaveRequestForm.value.end_date)
    };
    console.log('Creating leave request:', request);

    this.leaveRequestService.createAdminLeaveRequest(request).subscribe({
      next: () => {
        this.success('Tạo đơn nghỉ phép thành công!');
        // Delay closing dialog to allow notification to be shown
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 3000);
      },
      error: (error) => {
        const message = error.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
        this.error(message);
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 3000);
        this.loading = false;
      }
    });
  }
}