import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { log } from 'console';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../../components/success-dialog/dialog.component';
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
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{
  full_name = ''
  email = '';
  password = '';

  constructor(private registerService: RegisterService, private router: Router,private snackBar: MatSnackBar) {}
  ngOnInit(): void {
    console.log('RegisterComponent initialized!');
  }
  showNotification(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Đóng', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: isError ? 'error-snackbar' : 'success-snackbar',
    });
  }
  /**
   * Xử lý khi người dùng đăng ký
   */
  onRegister() {
    const registerData = {
      full_name: this.full_name,
      email: this.email,
      password: this.password,
    };

    this.registerService.register(registerData).subscribe({
      next: (response) => {
        console.log('Register Success:', response);
        this.router.navigate(['/login']); // Chuyển hướng sau khi đăng ký thành công
      },
      error: (error) => {
        this.showNotification('❌ Đăng ký thất bại. Vui lòng thử lại!', true);
      },
    });
  }
}
