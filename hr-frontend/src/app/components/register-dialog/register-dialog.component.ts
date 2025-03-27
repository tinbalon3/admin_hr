import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

export interface RegistrationData {
  day: string; // format "yyyy-MM-dd"
  registrations: { intern: string; note: boolean }[];
}

@Component({
  selector: 'app-registration-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule],
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.css']
})
export class RegistrationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RegistrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RegistrationData
  ) {
   
  }
}
