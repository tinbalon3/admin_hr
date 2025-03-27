import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveRequestService } from '../../services/leave-request.service';

interface LeaveRequest {
  leave_request: {
    id: string;
    start_date: string;
    end_date: string;
    notes: string;
    status: string;
    created_at: string;
  };
  employee: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    phone: string;
    location: string;
    created_at: string;
  };
  leave_type: {
    id: string;
    type_name: string;
    description: string;
  };
}

interface MonthlyLeave {
  name: string;
  days: number;
  percentage: number;
}

interface LeaveType {
  name: string;
  days: number;
  percentage: number;
  color: string;
  icon: string;
}

interface Tip {
  icon: string;
  text: string;
}

@Component({
  standalone: true,
  selector: 'app-leave-balance-chart',
  templateUrl: './leave-balance-chart.component.html',
  styleUrls: ['./leave-balance-chart.component.css'],
  imports: [CommonModule]
})
export class LeaveBalanceChartComponent implements OnInit {
  private readonly TOTAL_ANNUAL_LEAVE = 12;
  
  // Leave balance data
  daysTaken = 0;
  daysRemaining = 0;
  totalLeave = this.TOTAL_ANNUAL_LEAVE;
  takenPercent = 0;
  takenPercentRounded = 0;

  // Monthly breakdown
  monthlyData: MonthlyLeave[] = [];

  // Leave types
  leaveTypes: LeaveType[] = [];

  // Leave requests
  leaveRequests: LeaveRequest[] = [];

  // Tips
  tips: Tip[] = [
    { icon: 'fas fa-calendar-alt', text: 'Lên kế hoạch nghỉ phép sớm để cân bằng công việc và cuộc sống' },
    { icon: 'fas fa-clock', text: `Bạn có ${this.TOTAL_ANNUAL_LEAVE} ngày nghỉ phép trong năm` },
    { icon: 'fas fa-users', text: 'Phối hợp với đồng nghiệp khi lên kế hoạch nghỉ dài ngày' },
    { icon: 'fas fa-bell', text: 'Gửi đơn xin nghỉ phép sớm' }
  ];

  constructor(private leaveRequestService: LeaveRequestService) { }

  ngOnInit(): void {
    this.fetchLeaveRequests();
  }

  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  }

  private fetchLeaveRequests(): void {
    this.leaveRequestService.getListLeaveRequestUser().subscribe({
      next: (response) => {
        this.leaveRequests = response.data.filter((request: LeaveRequest) =>
          request.leave_request.status === 'APPROVED'
        );
        this.calculateLeaveStatistics();
        this.calculateMonthlyData();
        this.calculateLeaveTypes();
      },
      error: (error) => {
        console.error('Error fetching leave requests:', error);
      }
    });
  }

  private calculateLeaveStatistics(): void {
    this.daysTaken = this.leaveRequests.reduce((total, request) => {
      return total + this.calculateDays(request.leave_request.start_date, request.leave_request.end_date);
    }, 0);
    this.daysRemaining = Math.max(0, this.TOTAL_ANNUAL_LEAVE - this.daysTaken);
    this.calculatePercentages();
  }

  private calculateMonthlyData(): void {
    const months: { [key: string]: number } = {};
    const monthNames = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    
    // Initialize all months with 0 days
    monthNames.forEach(month => months[month] = 0);

    // Count days for each month
    this.leaveRequests.forEach(request => {
      const month = new Date(request.leave_request.start_date).getMonth();
      const days = this.calculateDays(request.leave_request.start_date, request.leave_request.end_date);
      months[monthNames[month]] += days;
    });

    // Convert to MonthlyLeave array
    this.monthlyData = monthNames.map(month => ({
      name: month,
      days: months[month],
      percentage: (months[month] / this.TOTAL_ANNUAL_LEAVE) * 100
    }));
  }

  private calculateLeaveTypes(): void {
    const typeCount: { [key: string]: number } = {};
    
    this.leaveRequests.forEach(request => {
      const days = this.calculateDays(request.leave_request.start_date, request.leave_request.end_date);
      const typeName = request.leave_type.type_name;
      typeCount[typeName] = (typeCount[typeName] || 0) + days;
    });

    this.leaveTypes = Object.entries(typeCount).map(([type, days]) => ({
      name: type,
      days: days,
      percentage: (days / this.TOTAL_ANNUAL_LEAVE) * 100,
      color: this.getColorForLeaveType(type),
      icon: this.getIconForLeaveType(type)
    }));
  }

  private calculatePercentages(): void {
    this.takenPercent = (this.daysTaken / this.TOTAL_ANNUAL_LEAVE) * 100;
    this.takenPercentRounded = Math.round(this.takenPercent);
  }

  private getColorForLeaveType(type: string): string {
    const colors: { [key: string]: string } = {
      'Nghỉ phép': '#4CAF50',
      'Nghỉ bệnh': '#F44336',
      'Nghỉ khác': '#2196F3',
      'Nghỉ không lương': '#FF9800'
    };
    return colors[type] || '#9E9E9E';
  }

  private getIconForLeaveType(type: string): string {
    const icons: { [key: string]: string } = {
      'Nghỉ phép': 'fas fa-umbrella-beach',
      'Nghỉ bệnh': 'fas fa-hospital',
      'Nghỉ khác': 'fas fa-user',
      'Nghỉ không lương': 'fas fa-money-bill-wave'
    };
    return icons[type] || 'fas fa-calendar';
  }
}