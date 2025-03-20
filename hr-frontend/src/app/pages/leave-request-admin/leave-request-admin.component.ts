import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
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
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-leave-request-admin',
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
  templateUrl: './leave-request-admin.component.html',
  styleUrl: './leave-request-admin.component.css'
})
export class LeaveRequestAdminComponent {
  leaveRequests: LeaveRequest[] = [];
  displayedColumns: string[] = ['username', 'startDate', 'endDate', 'note', 'status', 'type', 'action'];
  leaveType: any;
  leave_type_id_change: any;

  constructor(
    private dialog: MatDialog,
    private leaveRequestService: LeaveRequestService,
    private listTypeService: ListTypeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchLeaveRequestAdmin();
    this.fectchLeaveType();
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
    this.listTypeService.get_list_type().subscribe((data: any) => {
      this.leaveType = data.data;
      console.log('leaveType', this.leaveType);
    });
  }

  
 
  changeDecision(request: any): void {
    console.log('request', request);
    const updatedRequest = {
      comments: "OK",
      leave_request_id: request.leave_request.id,
      decision: request.leave_request.status,
      
    };
    console.log('updatedRequest', updatedRequest);
    this.leaveRequestService.changeDecsion(updatedRequest).subscribe({
      next: () => {
        this.snackBar.open('Cập nhật thành công!', 'Đóng', { duration: 3000 });
      },
      error: (error) => {
        console.log(error)
        this.snackBar.open('Cập nhật thất bại!', 'Đóng', { duration: 3000 });
      }
    });
  }
 
  fetchLeaveRequestAdmin(): void {
    this.leaveRequestService.getListLeaveRequestAdmin().subscribe({
      next: (data: any) => {
        this.leaveRequests = data.data;
        console.log('Leave Requests:', this.leaveRequests);
      },
      error: (error) => {
        console.error('Error fetching leave requests:', error);
      }
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
  leave_type?: { 
    type_name: string;
    id: string };
  selected?: boolean;

}
