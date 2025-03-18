import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';import { ChangePasswordDialogComponent } from '../change-password-dialog/change-password-dialog.component';
import { UsersService } from '../../services/users.service';
;
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

  constructor(private fb: FormBuilder,private dialog: MatDialog, private userService: UsersService) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullname: [{value:'', disabled: true }],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]],
    });

    this.loadUserProfile();
  }
  onClose(): void {
    this.dialog.closeAll();
  }
  changePassword(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '400px',
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        alert('Mật khẩu đã được cập nhật thành công!');
      }
    });
  }
  loadUserProfile(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUser = localStorage.getItem('inforUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.profileForm.patchValue({
          fullname: user.full_name  || '',
          email: user.email || '',
          phone_number: user.phone || '',
        });
      }
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const profileData = this.profileForm.getRawValue();
      localStorage.setItem('inforUser', JSON.stringify(profileData));
      const data = {
        'phone': profileData.phone_number,
      }
      this.userService.updatedUser(data).subscribe(
        (res) => {
          alert('Cập nhật thông tin thành công!');
        },
        (error) => {
          alert('Cập nhật thông tin thất bại!');
        }
      );
      this.profileForm.markAsPristine();
    }
  }



  changeEmail(): void {
    // Logic mở dialog hoặc form đổi email
    alert('Chức năng đổi email đang được phát triển!');
  }
}
