import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LeveRequestDialogComponent } from '../../components/leve-request-dialog/leve-request-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card'
import { FormsModule } from '@angular/forms';
import { ListTypeService } from '../../services/list-type.service';
import { MatIconModule } from '@angular/material/icon';
import { LeaveRequestService } from '../../services/leave-request.service';
import { log } from 'console';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
    MatNativeDateModule       
  ],
  templateUrl: './leave-request.component.html',
  styleUrl: './leave-request.component.css'
})
export class LeaveRequestComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  displayedColumns: string[] = ['username', 'startDate', 'endDate','status', 'note', 'type', 'edit','action'];
  leaveType :any;
  leave_type_id_change: any;
  constructor( private dialog: MatDialog, 
    private leaveRequestService: LeaveRequestService, 
    private listTypeService: ListTypeService, 
    private snackBar: MatSnackBar) {}
  ngOnInit(): void {
    this.fetchLeaveRequests();
    this.fectchLeaveType();
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(LeveRequestDialogComponent, {
      width: '500px',
    });
      // Nhận dữ liệu sau khi dialog đóng
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log('Dialog đã đóng và gửi dữ liệu:', result);
          this.leaveRequestService.createLeaveRequest(result).subscribe((data: any) => {
            console.log('data', data);
            this.fetchLeaveRequests();
          }
          );
        } else {
          console.log('Dialog bị đóng mà không gửi dữ liệu.');
        }
      });
    
  }
  fectchLeaveType(): void {
    this.listTypeService.get_list_type().subscribe((data: any) => {
      this.leaveType = data.data;
      console.log('leaveType', this.leaveType);
    }
    )
  }
  onLeaveTypeChange(element: any, selectedTypeId: string): void {
    this.leave_type_id_change = selectedTypeId;  // Gán id vào biến
    element.leave_type.id = selectedTypeId;      // Cập nhật lại element ngay lập tức
  
    console.log('ID Loại nghỉ phép đã chọn:', this.leave_type_id_change);
    console.log('Element đã cập nhật:', element);
  }

  updateLeaveRequest(element: any): void {
    const updatedRequest = {
      start_date: element.leave_request.start_date,
      end_date: element.leave_request.end_date,
      notes: element.leave_request.notes,
      leave_type_id: this.leave_type_id_change,
    };

    this.leaveRequestService.updateLeaveRequest(element.leave_request.id, updatedRequest).subscribe({
      next: () => {
        this.snackBar.open('Cập nhật thành công!', 'Đóng', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Cập nhật thất bại!', 'Đóng', { duration: 3000 });
      }
    });
  }
  fetchLeaveRequests(): void {
   this.leaveRequestService.getListLeaveRequest().subscribe((data: any) => {

    this.leaveRequests = data.data;
    console.log('leaveRequests', this.leaveRequests);
   })
      
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
  id: number;
  username: string;
  startDate: string;
  endDate: string;
  note: string;
  type: string;
  selected?: boolean;
}
