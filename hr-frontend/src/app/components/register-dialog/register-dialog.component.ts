import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface RegistrationData {
  day: string; // định dạng yyyy-MM-dd
  registrations: { intern: string; note: boolean }[];
}

@Component({
  selector: 'app-registration-dialog',
  templateUrl:  './register-dialog.component.html',
  styleUrl:'./register-dialog.component.css',
  imports: [MatDialogModule ,CommonModule],
  standalone: true
})
export class RegistrationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RegistrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RegistrationData
  ) {}
}
