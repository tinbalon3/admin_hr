import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LeveRequestDialogComponent } from '../../components/leve-request-dialog/leve-request-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule,MatSidenavModule],
  templateUrl: './leave-request.component.html',
  styleUrl: './leave-request.component.css'
})
export class LeaveRequestComponent {
  constructor(private dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(LeveRequestDialogComponent, {
      width: '400px',
    });
  }
}
