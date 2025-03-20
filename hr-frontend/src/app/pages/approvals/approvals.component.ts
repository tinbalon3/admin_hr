import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ApprovalsService } from '../../services/approvals.service';
interface ApprovalData {
  approval: {
    id: string;
    decision: string;
    comments: string;
    decision_date: string;
    leave_request_id: string;
  };
  employee_id: {
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
  imports: [CommonModule],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.css'
})
export class ApprovalsComponent {
  data: ApprovalData[] = [];

  constructor(private http: HttpClient,private approvalService: ApprovalsService) {}

  ngOnInit(): void {
   this.approvalService.getApprovals() // endpoint trả về JSON như trên
      .subscribe({
        next: (res) => {
          // res.data là mảng ApprovalData
          this.data = res.data;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
}
