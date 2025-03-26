import { Component, OnInit, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
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

// Custom Date Adapter
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    }
    return date.toDateString();
  }
}

// Custom date formats
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'MM/DD/YYYY',
  },
  display: {
    dateInput: 'input',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

interface LeaveRequest {
  start_date: string;
  end_date: string;
  status: string;
  notes: string;
}

interface LeaveType {
  type_name: string;
}

interface Employee {
  id: string;
  full_name: string;
}

interface LeaveData {
  employee: Employee;
  leave_request: LeaveRequest;
  leave_type: LeaveType;
}

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
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
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
  pagedData: LeaveStatistics[] = [];
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  isLoading = false;
  error: string | null = null;
  leaveTypes: string[] = ['Nghỉ phép', 'Nghỉ bệnh', 'Nghỉ không lương', 'Nghỉ khác'];
  leaveStatuses = ['APPROVED', 'PENDING', 'REJECTED'];

  private rawLeaveData: any[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<LeaveStatistics>;

  constructor(
    private leaveRequestService: LeaveRequestService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.filterForm = this.fb.group({
      dateRange: this.fb.group({
        start: [null],
        end: [null]
      }),
      status: [[]],
      leaveType: [[]]
    });

    this.dateAdapter.setLocale('en-US');
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
        let filteredData = response.data;

        // Apply filters
        if (filters.dateRange.start || filters.dateRange.end) {
          filteredData = filteredData.filter((item: LeaveData) => {
            const startDate = new Date(item.leave_request.start_date);
            const endDate = new Date(item.leave_request.end_date);
            const filterStart = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
            const filterEnd = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

            if (filterStart && filterEnd) {
              return startDate >= filterStart && endDate <= filterEnd;
            } else if (filterStart) {
              return startDate >= filterStart;
            } else if (filterEnd) {
              return endDate <= filterEnd;
            }
            return true;
          });
        }

        if (filters.status && filters.status.length > 0) {
          filteredData = filteredData.filter((item: LeaveData) =>
            filters.status.includes(item.leave_request.status)
          );
        }

        if (filters.leaveType && filters.leaveType.length > 0) {
          filteredData = filteredData.filter((item: LeaveData) =>
            filters.leaveType.includes(item.leave_type.type_name)
          );
        }

        this.dataSource = this.processLeaveData(filteredData);
        this.updatePagedData();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading leave statistics:', error);
      }
    });
  }

  updatePagedData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.dataSource.length);
    this.pagedData = this.dataSource.slice(startIndex, endIndex);
    this.totalPages = Math.max(1, Math.ceil(this.dataSource.length / this.pageSize));

    // Ensure current page is valid
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
    this.pageSize = Number(newSize);
    this.currentPage = 1; // Reset to first page
    this.updatePagedData();
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

    monthNames.forEach(month => {
      monthStats[month] = { count: 0, days: 0 };
    });

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
    const totalAnnualLeave = 12;
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
    if (!this.dataSource || this.dataSource.length === 0) {
      return;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.sheet_add_aoa(worksheet, [[
      'Tên nhân viên',
      'Tổng ngày nghỉ',
      'Ngày còn lại',
      'Đã duyệt',
      'Đang chờ',
      'Từ chối',
      'Chi tiết loại nghỉ'
    ]]);

    const data = this.dataSource.map(row => ({
      'Tên nhân viên': row.employeeName,
      'Tổng ngày nghỉ': row.totalLeavesTaken,
      'Ngày còn lại': row.remainingBalance,
      'Đã duyệt': row.approvedLeaves,
      'Đang chờ': row.pendingLeaves,
      'Từ chối': row.rejectedLeaves,
      'Chi tiết loại nghỉ': Object.entries(row.leaveTypes)
        .map(([type, days]) => `${type}: ${days} ngày`)
        .join(', ')
    }));

    XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A2', skipHeader: true });

    const max_width = data.reduce((w, r) => Math.max(w, r['Tên nhân viên'].length), 10);
    const col_width = Array(7).fill({ wch: max_width });
    worksheet['!cols'] = col_width;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave Statistics');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const fileName = `leave_statistics_${new Date().toISOString().split('T')[0]}.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}