import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';;
@Component({
  selector: 'app-profile',
  standalone : true, // thêm dòng này vào
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,  // thêm dòng này vào
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './personal-infor-dialog.component.html',
  styleUrls: ['./personal-infor-dialog.component.css']
})
export class PersonalInfoDialogComponent implements OnInit {
  profileForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullname: ['', [Validators.required]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]],
      gender: ['Nam', Validators.required],
      date_of_birth: ['', Validators.required]
    });

    this.loadUserProfile();
  }

  loadUserProfile(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUser = localStorage.getItem('inforUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.profileForm.patchValue({
          fullname: user.full_name || user.name || '',
          email: user.email || '',
          phone_number: user.phone || '',
          gender: user.gender || 'Nam',
          date_of_birth: user.date_of_birth || ''
        });
      }
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const profileData = this.profileForm.getRawValue();
      localStorage.setItem('inforUser', JSON.stringify(profileData));
      alert('Thông tin hồ sơ đã được cập nhật!');
      this.profileForm.markAsPristine();
    }
  }

  changePassword(): void {
    // Logic mở dialog hoặc form đổi mật khẩu
    alert('Chức năng đổi mật khẩu đang được phát triển!');
  }

  changeEmail(): void {
    // Logic mở dialog hoặc form đổi email
    alert('Chức năng đổi email đang được phát triển!');
  }
}
