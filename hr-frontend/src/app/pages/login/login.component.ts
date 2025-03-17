import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import từ @angular/material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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
  constructor(private authService: AuthService, private router: Router,private snackBar: MatSnackBar) {}
  showNotification(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Đóng', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: isError ? 'error-snackbar' : 'success-snackbar',
    });
  }
  onLogin() {
    
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        
        this.authService.saveToken(response.token.access_token);
        this.authService.saveRefreshToken(response.token.refresh_token);
        this.authService.saveInforUser(response.user);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.showNotification(error.error.detail, true);
      },
    });
  }
}
