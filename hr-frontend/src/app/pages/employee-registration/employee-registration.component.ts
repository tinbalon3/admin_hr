import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../services/auth.service';

import { NotificationComponent } from '../../components/notification/notification.component';
@Component({
  selector: 'app-employee-registration',
  templateUrl: './employee-registration.component.html',
  styleUrls: ['./employee-registration.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    NotificationComponent
  ]
})
export class EmployeeRegistrationComponent {
  registrationForm: FormGroup;
  loading = false;
  hidePassword = true;
  @ViewChild(NotificationComponent) notificationComponent?: NotificationComponent;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
 
  ) {
    this.registrationForm = this.fb.group({
      full_name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[\p{L}\s'-]+$/u)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^\+?[0-9]{10,15}$/)
      ]],
      role: ['EMPLOYEE', [Validators.required]],
      location: ['', [
        Validators.required
      ]]
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

  private success(message: string) {
    this.notify('success', message);
  }

  private error(message: string) {
    this.notify('error', message);
  }

  private warn(message: string) {
    this.notify('warning', message);
  }

  private info(message: string) {
    this.notify('info', message);
  }
  getErrorMessage(controlName: string): string {
    const control = this.registrationForm.get(controlName);
    if (!control?.errors || !control.touched) return '';

    const errors = control.errors;
    
    switch (controlName) {
      case 'full_name':
        if (errors['required']) return 'Họ và tên là bắt buộc';
        if (errors['minlength']) return 'Họ và tên phải có ít nhất 3 ký tự';
        if (errors['pattern']) return 'Họ và tên chỉ được chứa chữ cái và dấu';
        break;
      
      case 'email':
        if (errors['required']) return 'Email là bắt buộc';
        if (errors['email'] || errors['pattern']) return 'Email không hợp lệ';
        break;
      
      case 'password':
        if (errors['required']) return 'Mật khẩu là bắt buộc';
        break;
      
      case 'phone':
        if (errors['required']) return 'Số điện thoại là bắt buộc';
        if (errors['pattern']) return 'Số điện thoại không hợp lệ';
        break;
      
      case 'location':
        if (errors['required']) return 'Vui lòng chọn địa điểm';
        break;
        
      case 'role':
        if (errors['required']) return 'Vui lòng chọn chức vụ';
        break;
    }
    
    return 'Giá trị không hợp lệ';
  }

  onSubmit() {
    if (this.registrationForm.invalid) {
      Object.keys(this.registrationForm.controls).forEach(key => {
        const control = this.registrationForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;

    this.authService.adminCreateEmployee(this.registrationForm.value).subscribe({
      next: (response) => {
        console.log(response)
        this.success(response.message);
        this.registrationForm.reset();
        Object.keys(this.registrationForm.controls).forEach(key => {
          const control = this.registrationForm.get(key);
          control?.setErrors(null);
          control?.markAsUntouched();
        });
        this.loading = false;
      },
      error: (error) => {
        const message = error.error?.detail || 'Đã xảy ra lỗi. Vui lòng thử lại.';
        this.error(message);
        this.loading = false;
      }
    });
  }
}