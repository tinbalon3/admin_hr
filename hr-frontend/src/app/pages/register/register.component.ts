import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { RegisterService } from '../../services/register.service';
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
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  password = '';

  constructor(private registerService: RegisterService, private router: Router) {}

  /**
   * Xử lý khi người dùng đăng ký
   */
  onRegister() {
    const registerData = {
      username: this.username,
      password: this.password,
    };

    this.registerService.register(registerData).subscribe({
      next: (response) => {
        console.log('Register Success:', response);
        this.router.navigate(['/login']); // Chuyển hướng sau khi đăng ký thành công
      },
      error: (error) => {
        console.error('Register Failed:', error);
      },
    });
  }
}
