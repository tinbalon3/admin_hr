import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { UsersService } from '../../services/users.service';
import { CreateLeaveRequestDialogComponent } from './create-leave-request-dialog.component';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string;
  location: string;
  created_at: string;
}

@Component({
  selector: 'app-admin-leave-request',
  template: `
    <div class="container mx-auto px-4 py-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Danh sách nhân viên</h2>
      
      <!-- Loading spinner -->
      <div *ngIf="loading" class="flex justify-center my-8">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Employee table -->
      <div *ngIf="!loading" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <table mat-table [dataSource]="dataSource" class="w-full">
          <!-- Full Name Column -->
          <ng-container matColumnDef="full_name">
            <th mat-header-cell *matHeaderCellDef> Họ và tên </th>
            <td mat-cell *matCellDef="let employee"> {{employee.full_name}} </td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef> Email </th>
            <td mat-cell *matCellDef="let employee"> {{employee.email}} </td>
          </ng-container>

          <!-- Phone Column -->
          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef> Số điện thoại </th>
            <td mat-cell *matCellDef="let employee"> {{employee.phone}} </td>
          </ng-container>

          <!-- Role Column -->
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef> Chức vụ </th>
            <td mat-cell *matCellDef="let employee">
              <span [ngClass]="{
                'text-blue-600': employee.role === 'INTERN',
                'text-green-600': employee.role === 'EMPLOYEE',
                'text-red-600': employee.role === 'ADMIN'
              }">
                {{employee.role}}
              </span>
            </td>
          </ng-container>

          <!-- Location Column -->
          <ng-container matColumnDef="location">
            <th mat-header-cell *matHeaderCellDef> Địa điểm </th>
            <td mat-cell *matCellDef="let employee"> {{employee.location}} </td>
          </ng-container>

          <!-- Created At Column -->
          <ng-container matColumnDef="created_at">
            <th mat-header-cell *matHeaderCellDef> Ngày tạo </th>
            <td mat-cell *matCellDef="let employee"> 
              {{employee.created_at | date:'dd/MM/yyyy HH:mm'}}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Thao tác </th>
            <td mat-cell *matCellDef="let employee">
              <button mat-raised-button color="primary"
                      (click)="createLeaveRequest(employee)"
                      [disabled]="loading">
                <mat-icon class="mr-2">note_add</mat-icon>
                Tạo đơn
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>

      <!-- No data message -->
      <div *ngIf="!loading && dataSource.data.length === 0" 
           class="text-center py-8 text-gray-500">
        Không có nhân viên nào
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .mat-mdc-row:hover {
      background-color: #f5f5f5;
    }
    .mat-mdc-header-cell {
      font-weight: bold;
      color: rgba(0, 0, 0, 0.87);
    }
    .mat-column-actions {
      width: 120px;
      text-align: center;
    }
    .mat-column-role {
      width: 100px;
    }
    .mat-column-created_at {
      width: 150px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    MatDatepickerModule,
    { provide: DateAdapter, useClass: NativeDateAdapter }
  ]
})
export class AdminLeaveRequestComponent implements OnInit {
  dataSource: MatTableDataSource<Employee>;
  loading = false;
  displayedColumns: string[] = [
    'full_name',
    'email',
    'phone',
    'role',
    'location',
    'created_at',
    'actions'
  ];

  constructor(
    private usersService: UsersService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Employee>([]);
  }

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.usersService.getListUser().subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.snackBar.open('Không thể tải danh sách nhân viên', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  createLeaveRequest(employee: Employee) {
    const dialogRef = this.dialog.open(CreateLeaveRequestDialogComponent, {
      width: '600px',
      data: {
        employeeId: employee.id,
        employeeName: employee.full_name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Optionally reload the data if needed
        // this.loadEmployees();
      }
    });
  }
}