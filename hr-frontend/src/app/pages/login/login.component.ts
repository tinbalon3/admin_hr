import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import từ @angular/material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationComponent } from '../../components/notification/notification.component';

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
    MatIconModule,
    MatCheckboxModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {}

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
   @ViewChild(NotificationComponent) notificationComponent?: NotificationComponent;
 
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

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response: LoginResponse) => {
        this.authService.saveToken(response.token.access_token);
        this.authService.saveRefreshToken(response.token.refresh_token);
        this.authService.savecurrentUser(response.user);
        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.error(error.error.detail);
      },
    });
  }
}
