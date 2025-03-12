// dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ScaleType } from '@swimlane/ngx-charts';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    RouterModule,
    NgxChartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  hcmData = [
    { name: 'Team A', value: 30 },
    { name: 'Team B', value: 50 },
    { name: 'Team C', value: 20 },
  ];

  danangData = [
    { name: 'Team X', value: 40 },
    { name: 'Team Y', value: 30 },
    { name: 'Team Z', value: 30 },
  ];

  view: [number, number] = [300, 300];
  showLegend = true;
  colorScheme = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };
}



