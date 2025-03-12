import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { RouterModule } from '@angular/router';

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
export class InforcompanyComponent {
  view: [number, number] = [300, 300];
  showLegend = true;


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
  colorScheme = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };
}
