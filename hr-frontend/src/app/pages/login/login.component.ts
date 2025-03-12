import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import từ @angular/material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  ngOnInit(): void {
    
  }
  email = '';
  password = '';
  constructor(private loginService: LoginService, private router: Router,private snackBar: MatSnackBar) {}
  showNotification(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Đóng', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: isError ? 'error-snackbar' : 'success-snackbar',
    });
  }
  onLogin() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        
        this.loginService.saveToken(response.token.access_token);
        this.loginService.saveRefreshToken(response.token.refresh_token);
        this.loginService.saveInforUser(response.user);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.showNotification(error.error.detail, true);
      },
    });
  }
}
