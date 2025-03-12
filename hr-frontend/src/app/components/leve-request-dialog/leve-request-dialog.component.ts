import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-leve-request-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './leve-request-dialog.component.html',
  styleUrl: './leve-request-dialog.component.css'
})
export class LeveRequestDialogComponent {
  startDate: string = '';
  endDate: string = '';
  note: string = '';
  type: string = '';

  constructor(private dialogRef: MatDialogRef<LeveRequestDialogComponent>) {}

  submit() {
    // Xử lý dữ liệu tại đây
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }
}
