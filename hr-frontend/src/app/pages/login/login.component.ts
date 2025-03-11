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
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  ngOnInit(): void {
    console.log('LoginComponent initialized!');
  }
  email = '';
  password = '';
  constructor(private loginService: LoginService, private router: Router) {}
  onLogin() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login Success:', response);
        this.loginService.saveToken(response.access_token);
        alert('Login Success');
      },
      error: (error) => {
        console.error('Login Failed:', error);
      },
    });
  }
}
