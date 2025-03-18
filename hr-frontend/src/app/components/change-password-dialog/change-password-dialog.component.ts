import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
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

  onSave(): void {
    if (this.changePasswordForm.valid) {
      if (this.changePasswordForm.value.newPassword !== this.changePasswordForm.value.confirmPassword) {
        alert('Mật khẩu mới không khớp!');
        return;
      }
     
      const data = {
        "password": this.changePasswordForm.value.currentPassword,
        "password_new": this.changePasswordForm.value.newPassword
      }
      this.userService.updatedUser(data).subscribe(
        (res) => {
          console.log(res);
        },
        (error) => {
         console.log(error);
        }
      );
      this.dialogRef.close(true);
    }
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}
