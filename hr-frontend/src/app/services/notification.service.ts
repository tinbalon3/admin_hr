import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private config: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top'
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string) {
    this.config.panelClass = ['success-snackbar'];
    this.snackBar.open(message, 'Đóng', this.config);
  }

  error(message: string) {
    this.config.panelClass = ['error-snackbar'];
    this.config.duration = 5000; // Longer duration for errors
    this.snackBar.open(message, 'Đóng', this.config);
  }

  warn(message: string) {
    this.config.panelClass = ['warning-snackbar'];
    this.snackBar.open(message, 'Đóng', this.config);
  }

  info(message: string) {
    this.config.panelClass = ['info-snackbar'];
    this.snackBar.open(message, 'Đóng', this.config);
  }
}