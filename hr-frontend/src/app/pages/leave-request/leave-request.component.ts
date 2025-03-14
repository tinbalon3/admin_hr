import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu'; // Thêm MatMenuModule
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
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatMenuModule
  ],
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.css']
})
export class LeaveRequestComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  displayedColumns: string[] = ['username', 'startDate', 'endDate', 'note', 'status', 'type', 'actions', 'action'];
  leaveType: any;
  leave_type_id_change: any;

  constructor(
    private dialog: MatDialog,
    private leaveRequestService: LeaveRequestService,
    private listTypeService: ListTypeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchLeaveRequests();
    this.fectchLeaveType();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(LeveRequestDialogComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Dialog đã đóng và gửi dữ liệu:', result);
        this.leaveRequestService.createLeaveRequest(result).subscribe((data: any) => {
          console.log('data', data);
          this.fetchLeaveRequests();
        });
      } else {
        console.log('Dialog bị đóng mà không gửi dữ liệu.');
      }
    });
  }

  fectchLeaveType(): void {
    this.listTypeService.get_list_type().subscribe((data: any) => {
      this.leaveType = data.data;
      console.log('leaveType', this.leaveType);
    });
  }

  onLeaveTypeChange(element: any, selectedTypeId: string): void {
    this.leave_type_id_change = selectedTypeId;
    element.leave_type.id = selectedTypeId;
    console.log('ID Loại nghỉ phép đã chọn:', this.leave_type_id_change);
    console.log('Element đã cập nhật:', element);
  }
  performAction(element: any): void {
    if (element.selectedAction === 'update') {
      this.updateLeaveRequest(element);
    } else if (element.selectedAction === 'delete') {
      this.deleteLeaveRequest(element.leave_request.id);
    }
  }
  updateLeaveRequest(element: any): void {
    const updatedRequest = {
      start_date: element.leave_request.start_date,
      end_date: element.leave_request.end_date,
      notes: element.leave_request.notes,
      leave_type_id: element.leave_type.id,
    };
    console.log('updatedRequest', updatedRequest);
    this.leaveRequestService.updateLeaveRequest(element.leave_request.id, updatedRequest).subscribe({
      next: () => {
        this.snackBar.open('Cập nhật thành công!', 'Đóng', { duration: 3000 });
      },
      error: (error) => {
        console.log(error)
        this.snackBar.open('Cập nhật thất bại!', 'Đóng', { duration: 3000 });
      }
    });
  }
  deleteLeaveRequest(element:any): void {
    console.log('element', element);
    const id = element.leave_request.id;
    if (confirm('Bạn có chắc chắn muốn xóa đơn nghỉ phép này?')) {
      this.leaveRequestService.deleteLeaveRequest(id).subscribe({
        next: () => {
          this.snackBar.open('Xóa thành công!', 'Đóng', { duration: 3000 });
          this.fetchLeaveRequests(); // Cập nhật lại danh sách sau khi xóa
        },
        error: (err) => {
          this.snackBar.open('Xóa thất bại!', 'Đóng', { duration: 3000 });
          console.error('Lỗi khi xóa:', err);
        }
      });
    }
  }
  fetchLeaveRequests(): void {
    this.leaveRequestService.getListLeaveRequest().subscribe((data: any) => {
      this.leaveRequests = data.data;
      console.log('leaveRequests', this.leaveRequests);
    });
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
  };
  leave_type?: { id: string };
  selected?: boolean;
}