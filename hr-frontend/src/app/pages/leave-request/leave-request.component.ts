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

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [CommonModule, MatDialogModule, 
    MatButtonModule,MatSidenavModule,
    MatCheckboxModule,MatCardModule,MatTableModule,
    FormsModule,MatIconModule,MatFormFieldModule ,MatSelectModule],
  templateUrl: './leave-request.component.html',
  styleUrl: './leave-request.component.css'
})
export class LeaveRequestComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  displayedColumns: string[] = ['username', 'startDate', 'endDate', 'note', 'type', 'action'];
  constructor( private dialog: MatDialog, private leaveRequestService: LeaveRequestService, private listTypeService: ListTypeService,) {}
  leaveType :any;
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

  ngOnInit(): void {
    this.fetchLeaveRequests();
    this.fectchLeaveType();
  }

  fetchLeaveRequests(): void {
   this.leaveRequestService.getListLeaveRequest().subscribe((data: any) => {

    this.leaveRequests = data.data;
    console.log('leaveRequests', this.leaveRequests);
   })
      
  }

  onLeaveTypeChange(element: any): void {
    console.log('Cập nhật loại nghỉ phép:', element);

    const updatedRequest = {
      "start_date": element.leave_request.start_date,
      "end_date": element.leave_request.end_date,
      "leave_type_id": element.leave_type.id,
      "notes": element.leave_request.notes,
    };
    const leave_request_id = element.leave_request.id;
    this.leaveRequestService.updateLeaveRequest(leave_request_id,updatedRequest).subscribe({
      next: (response) => {
        console.log('Cập nhật thành công:', response);
      },
      error: (error) => {
        console.error('Lỗi khi cập nhật:', error);
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
  id: number;
  username: string;
  startDate: string;
  endDate: string;
  note: string;
  type: string;
  selected?: boolean;
}
