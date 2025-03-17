// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { MatDialog } from '@angular/material/dialog';
import { PersonalInfoDialogComponent } from '../../components/personal-infor-dialog/personal-infor-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    // MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    RouterModule,
    NgxChartsModule,
    MatSidenavModule,
    CommonModule,
    MatMenuModule

  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  userRole: any;
  constructor(private dialog: MatDialog, private router: Router, private authService: AuthService) {}
  ngOnInit(): void {
    // Lấy thông tin người dùng từ localStorage
    // Kiểm tra nếu đang chạy trong môi trường trình duyệt
    if (typeof window !== 'undefined' && window.localStorage) {
      const userInfo = localStorage.getItem('inforUser');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        this.userName = parsedUser.full_name ;
        this.userRole = parsedUser.role;
       
      }
    }
  }

  openPersonalInfo(): void {
    // Mở dialog hoặc điều hướng đến trang thông tin cá nhân
    const dialogRef = this.dialog.open(PersonalInfoDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed', result);
    });
  }

  logout(): void {
    // Xóa thông tin người dùng khỏi localStorage và điều hướng đến trang đăng nhập
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('inforUser');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    
        this.router.navigate(['/login']); // Thay '/login' bằng route của trang đăng nhập
        console.log('Đăng xuất thành công');
      },
      error: (error) => {
        localStorage.removeItem('inforUser');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.router.navigate(['/login']); // Thay '/login' bằng route của trang đăng nhập
        console.error('Đăng xuất thất bại:', error);
    }
  });
   
  }
}



