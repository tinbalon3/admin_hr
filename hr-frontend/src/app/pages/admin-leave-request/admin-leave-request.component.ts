import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { LeaveTypeService } from '../../services/leave-type.service';
import { LeaveRequestService } from '../../services/leave-request.service';
import { NotificationComponent } from '../../components/notification/notification.component';
import { UsersService } from '../../services/users.service';

interface Employee {
  id: string;
  full_name: string;
}

interface LeaveType {
  id: string;
  type_name: string;
}

@Component({
  selector: 'app-admin-leave-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NotificationComponent
  ],
  templateUrl: './admin-leave-request.component.html',
  styleUrl: './admin-leave-request.component.css'
})
export class AdminLeaveRequestComponent implements OnInit {
  leaveRequestForm: FormGroup;
  leaveTypes: LeaveType[] = [];
  allEmployees: Employee[] = [];
  employees: Employee[] = [];
  loading = false;
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  @ViewChild(NotificationComponent) notificationComponent?: NotificationComponent;

  constructor(
    private fb: FormBuilder,
    private leaveTypeService: LeaveTypeService,
    private leaveRequestService: LeaveRequestService,
    private usersService: UsersService
  ) {
    this.leaveRequestForm = this.fb.group({
      employee_id: ['', Validators.required],
      leave_type_id: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.fetchLeaveTypes();
    this.fetchEmployees();
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

  fetchLeaveTypes(): void {
    this.leaveTypeService.getLeaveTypes().subscribe({
      next: (response: { data: any }) => {
        console.log('Leave types:', response.data);
        this.leaveTypes = response.data;
      },
      error: (error: Error) => {
        console.error('Error fetching leave types:', error);
        this.error('Không thể tải danh sách loại nghỉ phép');
      }
    });
  }

  fetchEmployees(): void {
    // Simulating employee data fetch since actual service is not available
    this.usersService.getListUser().subscribe({
      next: (response) => {
        this.allEmployees = response.data;
        this.updatePagedEmployees();
      }
    })
  }

  updatePagedEmployees(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.allEmployees.length);
    this.employees = this.allEmployees.slice(startIndex, endIndex);
    this.totalPages = Math.max(1, Math.ceil(this.allEmployees.length / this.pageSize));
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedEmployees();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.updatePagedEmployees();
  }

  getErrorMessage(field: string): string {
    const control = this.leaveRequestForm.get(field);
    if (control?.hasError('required')) {
      switch (field) {
        case 'employee_id':
          return 'Vui lòng chọn nhân viên';
        case 'leave_type_id':
          return 'Vui lòng chọn loại nghỉ phép';
        case 'start_date':
          return 'Vui lòng chọn ngày bắt đầu';
        case 'end_date':
          return 'Vui lòng chọn ngày kết thúc';
        default:
          return 'Trường này là bắt buộc';
      }
    }
    return '';
  }

  onSubmit(): void {
    if (this.leaveRequestForm.valid) {
      this.loading = true;
      this.leaveRequestService.createLeaveRequest(this.leaveRequestForm.value).subscribe({
        next: (response) => {
          this.success(response.message);
          this.leaveRequestForm.reset();
          this.loading = false;
        },
        error: (error) => {
     
          this.error(error.error.detail || 'Đã xảy ra lỗi. Vui lòng thử lại.');
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.leaveRequestForm.controls).forEach(key => {
        const control = this.leaveRequestForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}