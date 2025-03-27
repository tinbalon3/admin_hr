import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ApprovalsService } from '../../services/approvals.service';

interface ApprovalData {
  approval: {
    id: string;
    decision: string;
    comments: string;
    decision_date: string;
    leave_request_id: string;
  };
  approver: {
    full_name: string;
    email: string;
    role: string;
    phone: string;
    location: string;
    id: string;
    created_at: string;
  };
  creator: {
    full_name: string;
    email: string;
    role: string;
    phone: string;
    location: string;
    id: string;
    created_at: string;
  };
}

interface ApiResponse {
  message: string;
  data: ApprovalData[];
}

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.css'
})
export class ApprovalsComponent implements OnInit {
  data: ApprovalData[] = [];
  pagedData: ApprovalData[] = [];
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private approvalService: ApprovalsService) {}

  ngOnInit(): void {
    this.approvalService.getApprovals()
      .subscribe({
        next: (res) => {
          this.data = res.data;
          // Calculate initial total pages
          this.totalPages = Math.ceil(this.data.length / this.pageSize);
          // Ensure we start at page 1
          this.currentPage = 1;
          this.updatePagedData();
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  updatePagedData(): void {
    // Calculate start and end indices
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.data.length);
    
    // Update total pages
    this.totalPages = Math.max(1, Math.ceil(this.data.length / this.pageSize));
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    // Get data for current page
    this.pagedData = this.data.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedData();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize); // Ensure number type
    this.currentPage = 1; // Reset to first page
    this.totalPages = Math.ceil(this.data.length / this.pageSize);
    this.updatePagedData();
  }
}
