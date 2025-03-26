import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { LeaveRequestService } from '../../services/leave-request.service';
import { NotificationComponent } from '../../components/notification/notification.component';

interface LeaveRequest {
  employee: { 
    full_name: string; 
    email: string 
  };
  leave_request: {
    id: number;
    start_date: Date | string;
    end_date: Date | string;
    notes: string;
    status: string;
  };
  leave_type: { 
    id: string;
    type_name: string;
  };
}

@Component({
  selector: 'app-submitted-leave-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    NotificationComponent,
    FormsModule
  ],
  templateUrl: './submitted-leave-requests.component.html',
  styleUrls: ['./submitted-leave-requests.component.css']
})
export class SubmittedLeaveRequestsComponent implements OnInit {
  submittedRequests: LeaveRequest[] = [];
  pagedData: LeaveRequest[] = [];

  // Pagination
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(NotificationComponent) notificationComponent?: NotificationComponent;

  constructor(
    private leaveRequestService: LeaveRequestService
  ) { }

  ngOnInit(): void {
    this.fetchSubmittedRequests();
  }

  updatePagedData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.submittedRequests.length);
    this.pagedData = this.submittedRequests.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.submittedRequests.length / this.pageSize);
    
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
    this.pageSize = parseInt(newSize.toString(), 10);
    this.currentPage = 1;
    this.updatePagedData();
  }

  fetchSubmittedRequests(): void {
    this.leaveRequestService.getListLeaveRequestUser().subscribe((data: any) => {
      // Filter for non-pending requests
      this.submittedRequests = data.data.filter((request: LeaveRequest) => 
        request.leave_request.status !== 'PENDING'
      );
      this.updatePagedData();
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
}
