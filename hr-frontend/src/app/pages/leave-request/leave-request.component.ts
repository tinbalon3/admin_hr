import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LeveRequestDialogComponent } from '../../components/leve-request-dialog/leve-request-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { ListTypeService } from '../../services/list-type.service';
import { MatIconModule } from '@angular/material/icon';
import { LeaveRequestService } from '../../services/leave-request.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { NotificationComponent } from '../../components/notification/notification.component';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatCardModule,
    MatTableModule,
    FormsModule,
    MatIconModule,  
    MatPaginatorModule,
    NotificationComponent
  ],
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.css']
})
export class LeaveRequestComponent implements OnInit {
  leaveRequests: any[] = [];  // Raw data
  pagedData: any[] = [];      // Data for current page
  leaveType: any;
  leave_type_id_change: any;
  
  // Pagination
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(NotificationComponent) notificationComponent?: NotificationComponent;

  constructor(
    private dialog: MatDialog,
    private leaveRequestService: LeaveRequestService,
    private listTypeService: ListTypeService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.fetchLeaveRequestUsers();
    this.fectchLeaveType();
  }

  updatePagedData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.leaveRequests.length);
    this.pagedData = this.leaveRequests.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.leaveRequests.length / this.pageSize);
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
      this.updatePagedData();
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedData();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.updatePagedData();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(LeveRequestDialogComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.leaveRequestService.createLeaveRequest(result).subscribe((data: any) => {
          this.success(data.message);
          this.fetchLeaveRequestUsers();
        });
      } else {
        this.info('Dialog bị đóng mà không gửi dữ liệu.');
      }
    });
  }

  fectchLeaveType(): void {
    this.listTypeService.get_list_type().subscribe((data: any) => {
      this.leaveType = data.data;
    });
  }

  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    this.leaveRequests.forEach(request => {
      if (request.leave_request.status === 'PENDING') {
        request.selected = isChecked;
      }
    });
  }

  onLeaveTypeChange(element: any, selectedTypeId: string): void {
    this.leave_type_id_change = selectedTypeId;
    element.leave_type.id = selectedTypeId;
  }

  performAction(element: any): void {
    if (element.selectedAction === 'update') {
      this.updateLeaveRequest(element);
    } else if (element.selectedAction === 'delete') {
      this.deleteLeaveRequest(element);
    }
  }

  updateLeaveRequest(element: any): void {
    const updatedRequest = {
      start_date: element.leave_request.start_date,
      end_date: element.leave_request.end_date,
      notes: element.leave_request.notes,
      leave_type_id: element.leave_type.id,
    };
    this.leaveRequestService.updateLeaveRequest(element.leave_request.id, updatedRequest).subscribe({
      next: (response) => {
        this.success(response.message);
      },
      error: (error) => {
        console.log(error)
        this.error(error.error.detail || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    });
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

  deleteLeaveRequest(element: any): void {
    const id = element.leave_request.id;
    if (confirm('Bạn có chắc chắn muốn xóa đơn nghỉ phép này?')) {
      this.leaveRequestService.deleteLeaveRequest(id).subscribe({
        next: (response) => {
          this.success(response.message);
          this.fetchLeaveRequestUsers();
        },
        error: (err) => {
          this.error(err.error.detail || 'Đã xảy ra lỗi. Vui lòng thử lại.');
          console.error('Lỗi khi xóa:', err);
        }
      });
    }
  }

  fetchLeaveRequestUsers(): void {
    this.leaveRequestService.getListLeaveRequestUser().subscribe((data: any) => {
      // Filter for only pending requests
      this.leaveRequests = data.data.filter((request: LeaveRequest) =>
        request.leave_request?.status === 'PENDING'
      );
      this.leaveRequests.forEach(request => {
        request.originalData = {
          ...JSON.parse(JSON.stringify(request.leave_request)),
          leave_type_id: request.leave_type.id
        };
        request.selected = false;
      });
      this.updatePagedData();
    });
  }

  hasChanges(request: any): boolean {
    const typeChanged = !request.originalData.leave_type_id ||
      request.leave_type.id !== request.originalData.leave_type_id;

    return request.leave_request.start_date !== request.originalData.start_date ||
      request.leave_request.end_date !== request.originalData.end_date ||
      request.leave_request.notes !== request.originalData.notes ||
      typeChanged;
  }

  hasSelected(): boolean {
    return this.leaveRequests.some(request => request.selected);
  }

  submitSelected(selectedRequest: any): void {
  

    if (!selectedRequest) {
      return;
    }

    const formattedData = {
      data: {
        leave_request: {
          id: selectedRequest.leave_request.id,
          start_date: selectedRequest.leave_request.start_date,
          end_date: selectedRequest.leave_request.end_date
        },
        employee: {
          full_name: selectedRequest.employee.full_name,
          email: selectedRequest.employee.email
        },
        leave_type: {
          type_name: selectedRequest.leave_type.type_name
        }
      }
    };

    this.leaveRequestService.sendLeaveRequestToAdmin(formattedData).subscribe({
      next: () => {
        this.success('Gửi yêu cầu thành công!');
        this.fetchLeaveRequestUsers();
      }
    });
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
  };
  leave_type?: { id: string };
  selected?: boolean;
}