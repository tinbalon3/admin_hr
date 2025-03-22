import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LeaveRequestService } from '../../services/leave-request.service';
import { EmployeeLeaveDetailsDialogComponent } from '../../components/employee-leave-details-dialog/employee-leave-details-dialog.component';

interface LeaveStatistics {
  employeeId: string;
  employeeName: string;
  totalLeavesTaken: number;
  remainingBalance: number;
  approvedLeaves: number;
  pendingLeaves: number;
  rejectedLeaves: number;
  leaveTypes: { [key: string]: number };
}

interface FilterOptions {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: string[];
  leaveType: string[];
}

@Component({
  selector: 'app-employee-leave-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './employee-leave-statistics.component.html',
  styleUrls: ['./employee-leave-statistics.component.css']
})
export class EmployeeLeaveStatisticsComponent implements OnInit {
  displayedColumns: string[] = [
    'employeeName',
    'totalLeavesTaken',
    'remainingBalance',
    'approvedLeaves',
    'pendingLeaves',
    'rejectedLeaves',
    'actions'
  ];
  
  filterForm: FormGroup;
  dataSource: LeaveStatistics[] = [];
  isLoading = false;
  error: string | null = null;
  leaveTypes: string[] = ['Nghỉ phép', 'Nghỉ bệnh', 'Nghỉ không lương', 'Nghỉ khác'];
  leaveStatuses = ['APPROVED', 'PENDING', 'REJECTED'];

  private rawLeaveData: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<LeaveStatistics>;

  constructor(
    private leaveRequestService: LeaveRequestService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      dateRange: this.fb.group({
        start: [null],
        end: [null]
      }),
      status: [[]],
      leaveType: [[]]
    });
  }

  ngOnInit(): void {
    this.loadStatistics();
    this.setupFilterSubscription();
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.loadStatistics();
    });
  }

  private loadStatistics(): void {
    this.isLoading = true;
    this.error = null;

    const filters: FilterOptions = this.filterForm.value;

    this.leaveRequestService.getApprovedLeaveRequestAdminList().subscribe({
      next: (response: any) => {
        this.rawLeaveData = response.data;
        this.dataSource = this.processLeaveData(response.data);
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading leave statistics:', error);
      }
    });
  }

  private processLeaveData(data: any[]): LeaveStatistics[] {
    const employeeMap = new Map<string, any[]>();
    
    data.forEach(item => {
      const employeeId = item.employee.id;
      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, []);
      }
      employeeMap.get(employeeId)?.push(item);
    });

    return Array.from(employeeMap.entries()).map(([employeeId, leaves]) => {
      const employee = leaves[0].employee;
      return {
        employeeId,
        employeeName: employee.full_name,
        totalLeavesTaken: this.calculateTotalLeaves(leaves),
        remainingBalance: this.calculateRemainingBalance(leaves),
        approvedLeaves: this.countLeavesByStatus(leaves, 'APPROVED'),
        pendingLeaves: this.countLeavesByStatus(leaves, 'PENDING'),
        rejectedLeaves: this.countLeavesByStatus(leaves, 'REJECTED'),
        leaveTypes: this.categorizeLeavesByType(leaves)
      };
    });
  }

  viewDetails(employeeId: string, employeeName: string): void {
    const employeeLeaves = this.rawLeaveData.filter(item => item.employee.id === employeeId);
    
    const monthlyStats = this.calculateMonthlyStats(employeeLeaves);
    const leaveTypes = this.categorizeLeavesByType(employeeLeaves);
    const totalLeaves = this.calculateTotalLeaves(employeeLeaves);
    const remainingBalance = 12 - totalLeaves;

    const dialogData = {
      employeeId,
      employeeName,
      leaveDetails: employeeLeaves.map(leave => ({
        start_date: leave.leave_request.start_date,
        end_date: leave.leave_request.end_date,
        type: leave.leave_type.type_name,
        status: leave.leave_request.status,
        notes: leave.leave_request.notes || ''
      })),
      totalLeaves,
      remainingBalance,
      monthlyStats,
      leaveTypes
    };

    this.dialog.open(EmployeeLeaveDetailsDialogComponent, {
      data: dialogData,
      width: '90%',
      maxWidth: '1200px'
    });
  }

  private calculateMonthlyStats(leaves: any[]): any[] {
    const monthStats: { [key: string]: { count: number; days: number } } = {};
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    // Initialize all months
    monthNames.forEach(month => {
      monthStats[month] = { count: 0, days: 0 };
    });

    // Calculate stats for each leave request
    leaves.forEach(leave => {
      const startDate = new Date(leave.leave_request.start_date);
      const monthName = monthNames[startDate.getMonth()];
      monthStats[monthName].count++;
      monthStats[monthName].days += this.calculateDays(
        leave.leave_request.start_date,
        leave.leave_request.end_date
      );
    });

    return monthNames.map(month => ({
      month,
      count: monthStats[month].count,
      days: monthStats[month].days
    }));
  }

  private calculateTotalLeaves(leaves: any[]): number {
    return leaves.filter(leave => leave.leave_request.status === 'APPROVED')
      .reduce((total, leave) => total + this.calculateDays(
        leave.leave_request.start_date,
        leave.leave_request.end_date
      ), 0);
  }

  private calculateRemainingBalance(leaves: any[]): number {
    const totalAnnualLeave = 12; // This should come from configuration
    return totalAnnualLeave - this.calculateTotalLeaves(leaves);
  }

  private countLeavesByStatus(leaves: any[], status: string): number {
    return leaves.filter(leave => leave.leave_request.status === status).length;
  }

  private categorizeLeavesByType(leaves: any[]): { [key: string]: number } {
    const types: { [key: string]: number } = {};
    leaves.filter(leave => leave.leave_request.status === 'APPROVED')
      .forEach(leave => {
        const type = leave.leave_type.type_name;
        const days = this.calculateDays(
          leave.leave_request.start_date,
          leave.leave_request.end_date
        );
        types[type] = (types[type] || 0) + days;
      });
    return types;
  }

  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  exportToExcel(): void {
    console.log('Export to Excel functionality will be implemented later');
  }
}