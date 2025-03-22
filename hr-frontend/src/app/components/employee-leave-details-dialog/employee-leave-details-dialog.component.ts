import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

interface LeaveDetail {
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  notes: string;
}

interface MonthlyStatistic {
  month: string;
  count: number;
  days: number;
}

interface DialogData {
  employeeId: string;
  employeeName: string;
  leaveDetails: LeaveDetail[];
  totalLeaves: number;
  remainingBalance: number;
  monthlyStats: MonthlyStatistic[];
  leaveTypes: { [key: string]: number };
}

@Component({
  selector: 'app-employee-leave-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule
  ],
  template: `
    <h2 mat-dialog-title>Chi tiết nghỉ phép - {{data.employeeName}}</h2>
    
    <mat-dialog-content>
      <mat-tab-group>
        <!-- Tổng quan -->
        <mat-tab label="Tổng quan">
          <div class="overview-stats">
            <mat-card class="stat-card">
              <mat-card-header>
                <mat-card-title>{{data.totalLeaves}}</mat-card-title>
                <mat-card-subtitle>Tổng ngày đã nghỉ</mat-card-subtitle>
              </mat-card-header>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-header>
                <mat-card-title>{{data.remainingBalance}}</mat-card-title>
                <mat-card-subtitle>Ngày còn lại</mat-card-subtitle>
              </mat-card-header>
            </mat-card>
          </div>

          <div class="leave-types">
            <h3>Phân loại nghỉ phép</h3>
            <div class="type-bars">
              <div *ngFor="let type of getLeaveTypes()" class="type-bar">
                <span class="type-name">{{type}}</span>
                <div class="bar-container">
                  <div class="bar" [style.width.%]="getTypePercentage(type)"></div>
                </div>
                <span class="type-value">{{data.leaveTypes[type]}} ngày</span>
              </div>
            </div>
          </div>

          <div class="monthly-stats">
            <h3>Thống kê theo tháng</h3>
            <div class="month-grid">
              <div *ngFor="let stat of data.monthlyStats" class="month-stat">
                <div class="month-name">{{stat.month}}</div>
                <div class="month-value">{{stat.days}} ngày</div>
                <div class="month-count">({{stat.count}} lần)</div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Chi tiết -->
        <mat-tab label="Chi tiết">
          <table mat-table [dataSource]="data.leaveDetails" class="detail-table">
            <ng-container matColumnDef="start_date">
              <th mat-header-cell *matHeaderCellDef>Ngày bắt đầu</th>
              <td mat-cell *matCellDef="let leave">{{formatDate(leave.start_date)}}</td>
            </ng-container>

            <ng-container matColumnDef="end_date">
              <th mat-header-cell *matHeaderCellDef>Ngày kết thúc</th>
              <td mat-cell *matCellDef="let leave">{{formatDate(leave.end_date)}}</td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Loại</th>
              <td mat-cell *matCellDef="let leave">{{leave.type}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Trạng thái</th>
              <td mat-cell *matCellDef="let leave">
                <span [class]="'status-' + leave.status.toLowerCase()">
                  {{getStatusText(leave.status)}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="notes">
              <th mat-header-cell *matHeaderCellDef>Ghi chú</th>
              <td mat-cell *matCellDef="let leave">{{leave.notes}}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Đóng</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      width: 90vw;
    }

    mat-dialog-content {
      max-height: 70vh;
    }

    .overview-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 16px 0;
    }

    .stat-card {
      text-align: center;
    }

    .leave-types {
      margin: 24px 0;
    }

    .type-bars {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .type-bar {
      display: grid;
      grid-template-columns: 120px 1fr 80px;
      align-items: center;
      gap: 16px;
    }

    .bar-container {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      background: #1e88e5;
      border-radius: 4px;
    }

    .monthly-stats {
      margin: 24px 0;
    }

    .month-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
    }

    .month-stat {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      text-align: center;
    }

    .month-name {
      font-weight: 500;
      margin-bottom: 8px;
    }

    .month-value {
      font-size: 1.2em;
      color: #1e88e5;
    }

    .month-count {
      font-size: 0.9em;
      color: #666;
    }

    .detail-table {
      width: 100%;
      margin-top: 16px;
    }

    .status-approved {
      color: #2e7d32;
    }

    .status-pending {
      color: #ed6c02;
    }

    .status-rejected {
      color: #d32f2f;
    }
  `]
})
export class EmployeeLeaveDetailsDialogComponent {
  displayedColumns = ['start_date', 'end_date', 'type', 'status', 'notes'];

  constructor(
    public dialogRef: MatDialogRef<EmployeeLeaveDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'APPROVED': 'Đã duyệt',
      'PENDING': 'Đang chờ',
      'REJECTED': 'Từ chối'
    };
    return statusMap[status] || status;
  }

  getLeaveTypes(): string[] {
    return Object.keys(this.data.leaveTypes);
  }

  getTypePercentage(type: string): number {
    const total = Object.values(this.data.leaveTypes).reduce((a, b) => a + b, 0);
    return (this.data.leaveTypes[type] / total) * 100;
  }
}