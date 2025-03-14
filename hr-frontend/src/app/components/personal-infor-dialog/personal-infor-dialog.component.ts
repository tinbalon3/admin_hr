import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-personal-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './personal-infor-dialog.component.html',
  styleUrls: ['./personal-infor-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalInfoDialogComponent {
  userInfo: any = {
    phone: '',
    password: '',
    password_new: ''
  };
  storedUserInfo: any
  oldPassword: string = ''; // Mật khẩu cũ
  newPassword: string = ''; // Mật khẩu mới
  passwordMismatch: boolean = false; // Flag lỗi mật khẩu cũ
  showPasswordFields: boolean = false; // Điều khiển hiển thị trường mật khẩu

  constructor(
    public dialogRef: MatDialogRef<PersonalInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.storedUserInfo = localStorage.getItem('inforUser');
      if (this.storedUserInfo) {
        const parsedUser = JSON.parse(this.storedUserInfo);
        this.userInfo.full_name = parsedUser.full_name || parsedUser.name || '';
        this.userInfo.email = parsedUser.email || '';
        this.userInfo.phone = parsedUser.phone || '';
        this.userInfo.password = parsedUser.password || ''; // Lấy mật khẩu hiện tại
      }
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      

      // Cập nhật mật khẩu mới nếu có
      if (this.showPasswordFields && this.newPassword) {
        this.userInfo.password = this.oldPassword;
        this.userInfo.password_new = this.newPassword;
      }

      // Lưu thông tin mới vào localStorage (phone và password nếu có)
      localStorage.setItem('inforUser', JSON.stringify(this.userInfo));
      this.dialogRef.close(this.userInfo);
      this.passwordMismatch = false; // Reset flag lỗi
      this.showPasswordFields = false; // Ẩn các trường mật khẩu sau khi lưu
    }
  }

  // Hiển thị các trường mật khẩu khi nhấn nút
  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    this.passwordMismatch = false; // Reset lỗi khi mở lại
    this.oldPassword = ''; // Reset giá trị khi mở
    this.newPassword = ''; // Reset giá trị khi mở
  }

  // Validation cơ bản cho mật khẩu mới
  isPasswordValid(): boolean {
    return this.newPassword.length >= 6; // Yêu cầu mật khẩu ít nhất 6 ký tự
  }
}