import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../services/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    MatSnackBarModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{
  full_name = '';
  email = '';
  password = '';
  confirmPassword = '';
  phone = '';
  location = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private registerService: RegisterService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
  
  }

  showNotification(message: string, isError: boolean = false) {
    if (isError) {
      this.notificationService.error(message);
    } else {
      this.notificationService.success(message);
    }
  }
  /**
   * Xử lý khi người dùng đăng ký
   */
  onRegister() {
    const registerData = {
      full_name: this.full_name,
      email: this.email,
      password: this.password,
      phone: this.phone,
      location: this.location
    };

    this.registerService.register(registerData).subscribe({
      next: (response) => {
        console.log('Register Success:', response);
        this.router.navigate(['/login']); // Chuyển hướng sau khi đăng ký thành công
      },
      error: (error) => {
        this.showNotification(error.error.detail, true);
      },
    });
  }
}
