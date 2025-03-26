import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';
import { NotificationComponent } from '../notification/notification.component';


@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NotificationComponent
],
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.css']
})
export class ChangePasswordDialogComponent {
  changePasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
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

  onSave(): void {
    if (this.changePasswordForm.valid) {
      if (this.changePasswordForm.value.newPassword !== this.changePasswordForm.value.confirmPassword) {
        this.warn('Mật khẩu mới không khớp!');
        return;
      }
     
      const data = {
        "password": this.changePasswordForm.value.currentPassword,
        "password_new": this.changePasswordForm.value.newPassword
      }
      this.userService.updatedUser(data).subscribe(
        (res) => {
          this.success(res.message);
        },
        (error) => {
         this.error(error.error.detail);
        }
      );
      setTimeout(() => {
        this.dialogRef.close(true);
      }
      , 3000
      );
    }
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}
