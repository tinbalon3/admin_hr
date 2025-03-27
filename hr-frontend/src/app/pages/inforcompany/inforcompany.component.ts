import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { NgxChartsModule, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';

interface User {
  id: number;
  location: 'HCM' | 'ĐN';
  role: string;
  full_name: string;
  created_at: string;
}

interface LocationData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-inforcompany',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    NgxChartsModule,
    RouterModule,
  ],
  templateUrl: './inforcompany.component.html',
  styleUrls: ['./inforcompany.component.css'],
})
export class InforcompanyComponent implements OnInit {
  view: [number, number] = [400, 300];
  showLegend = true;
  legendPosition: LegendPosition = LegendPosition.Below;
  totalEmployees = 0;
  loading = true;
  error = '';
  users: User[] = [];
  newUsers: User[] = [];

  hcmData: LocationData[] = [];
  danangData: LocationData[] = [];

  colorScheme = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#00C49F', '#0088FE', '#FFBB28', '#FF8042'],
  };

  constructor(private userService: UsersService) {}

  ngOnInit() {
    this.fetchUsers();
  }

  private getNewUsers(users: User[]): User[] {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);  // Reset to start of the day
    
    return users.filter(user => {
      const createdDate = new Date(user.created_at);
      return createdDate >= oneWeekAgo && createdDate <= new Date();
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort by newest first
  }

  private fetchUsers() {
    this.loading = true;
    this.userService.getListUser().subscribe({
      next: (response: { data: User[] }) => {
        this.users = response.data;
        this.totalEmployees = this.users.length;
        this.newUsers = this.getNewUsers(this.users);
        this.processUserData();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error fetching user data';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  private processUserData() {
    // Group users by location and role
    const hcmUsers = this.users.filter(user => user.location === 'HCM');
    const danangUsers = this.users.filter(user => user.location === 'ĐN');

    // Process HCM data
    const hcmRoles = this.groupByRole(hcmUsers);
    this.hcmData = Object.entries(hcmRoles).map(([role, count]) => ({
      name: role,
      value: count
    }));

    // Process Danang data
    const danangRoles = this.groupByRole(danangUsers);
    this.danangData = Object.entries(danangRoles).map(([role, count]) => ({
      name: role,
      value: count
    }));
  }

  private groupByRole(users: User[]): Record<string, number> {
    return users.reduce((acc: Record<string, number>, user: User) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
  }

  getLocationTotal(data: LocationData[]): number {
    return data.reduce((total, item) => total + item.value, 0);
  }

  getLocationPercentage(data: LocationData[]): string {
    const locationTotal = this.getLocationTotal(data);
    return ((locationTotal / this.totalEmployees) * 100).toFixed(1);
  }
}
