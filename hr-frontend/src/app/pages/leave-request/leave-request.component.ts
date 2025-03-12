import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LeveRequestDialogComponent } from '../../components/leve-request-dialog/leve-request-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card'
import { FormsModule } from '@angular/forms';
import { ListTypeService } from '../../services/list-type.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule,MatSidenavModule,MatCheckboxModule,MatCardModule,MatTableModule,FormsModule,MatIconModule],
  templateUrl: './leave-request.component.html',
  styleUrl: './leave-request.component.css'
})
export class LeaveRequestComponent {
  leaveRequests: LeaveRequest[] = [];
  displayedColumns: string[] = ['username', 'startDate', 'endDate', 'note', 'type', 'action'];
  constructor(private listTypeService: ListTypeService, private dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(LeveRequestDialogComponent, {
      width: '500px',
    });
  }

  ngOnInit(): void {
    this.fetchLeaveRequests();
  }

  fetchLeaveRequests(): void {
    this.listTypeService.get_list_type()
      .subscribe((data: any) => {
        this.leaveRequests = data.map((request: any) => ({ ...request, selected: false }));
      });
      
  }

  hasSelected(): boolean {
    return this.leaveRequests.some(request => request.selected);
  }

  submitSelected(): void {
    const selectedRequests = this.leaveRequests.filter(request => request.selected);
    console.log('Selected Requests:', selectedRequests);
  }

}

interface LeaveRequest {
  id: number;
  username: string;
  startDate: string;
  endDate: string;
  note: string;
  type: string;
  selected?: boolean;
}
