import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LeveRequestDialogComponent } from '../../components/leve-request-dialog/leve-request-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LeaveRequestService } from '../../services/leave-request.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationComponent } from '../../components/notification/notification.component';
import { LeaveTypeService } from '../../services/leave-type.service';

@Component({
  selector: 'app-leave-request-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatMenuModule,
    NotificationComponent
  ],
  templateUrl: './leave-request-admin.component.html',
  styleUrl: './leave-request-admin.component.css'
})
export class LeaveRequestAdminComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  pagedData: LeaveRequest[] = [];
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  displayedColumns: string[] = ['username', 'startDate', 'endDate', 'note', 'status', 'type', 'action'];
  leaveType: any;
  leave_type_id_change: any;
  
  @ViewChild(NotificationComponent) notificationComponent?: NotificationComponent;

  constructor(

    private leaveRequestService: LeaveRequestService,
    private leaveTypeService: LeaveTypeService,
  
  ) {}

  ngOnInit(): void {
    this.fetchLeaveRequestAdmin();
    this.fectchLeaveType();
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

  approveRequest(element: any): void {
    element.leave_request.status = 'APPROVED';
    this.changeDecision(element);
  }
  
  rejectRequest(element: any): void {
    element.leave_request.status = 'REJECTED';
    this.changeDecision(element);
  }

  fectchLeaveType(): void {
    this.leaveTypeService.getLeaveTypes().subscribe((data: any) => {
      this.leaveType = data.data;
    });
  }

  changeDecision(request: any): void {
    const updatedRequest = {
      comments: "OK",
      leave_request_id: request.leave_request.id,
      decision: request.leave_request.status,
    };
  
    this.leaveRequestService.changeDecision(updatedRequest).subscribe({
      next: () => {
        this.success('Cập nhật thành công!');
        this.fetchLeaveRequestAdmin();
      },
      error: (error) => {
        console.log(error)
        this.fetchLeaveRequestAdmin();
        this.error('Cập nhật thất bại!');
      }
    });
  }
 
  fetchLeaveRequestAdmin(): void {
    this.leaveRequestService.getListLeaveRequestAdmin().subscribe({
      next: (data: any) => {
        this.leaveRequests = data.data;
        this.updatePagedData();
        console.log('Leave Requests:', this.leaveRequests);
      },
      error: (error) => {
        console.error('Error fetching leave requests:', error);
      }
    });
  }

  updatePagedData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.leaveRequests.length);
    this.pagedData = this.leaveRequests.slice(startIndex, endIndex);
    this.totalPages = Math.max(1, Math.ceil(this.leaveRequests.length / this.pageSize));
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedData();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1; // Reset to first page
    this.updatePagedData();
  }

  hasSelected(): boolean {
    return this.leaveRequests.some(request => request.selected);
  }

  submitSelected(): void {
    const selectedRequests = this.leaveRequests.filter(request => request.selected);
    console.log('Selected Requests:', selectedRequests);
  }
}

interface LeaveRequest {
  id?: number;
  employee?: { full_name: string };
  leave_request?: {
    start_date: Date | string;
    end_date: Date | string;
    notes: string;
    status: string;
    id: string;
  };
  leave_type?: { 
    type_name: string;
    id: string 
  };
  selected?: boolean;
}
