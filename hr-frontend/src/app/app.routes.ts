import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
 
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'inforcompany',
        loadComponent: () =>
          import('./pages/inforcompany/inforcompany.component').then(
            (m) => m.InforcompanyComponent
          ),
      },
      {
        path: 'create-leave-request',
        loadComponent: () =>
          import('./pages/leave-request/leave-request.component').then(
            (m) => m.LeaveRequestComponent
          ),
      },
      {
        path: 'submitted-leave-requests',
        loadComponent: () =>
          import('./pages/submitted-leave-requests/submitted-leave-requests.component').then(
            (m) => m.SubmittedLeaveRequestsComponent
          ),
      },
      {
        path: 'list-leave-request',
        loadComponent: () =>
          import('./pages/leave-request-admin/leave-request-admin.component').then(
            (m) => m.LeaveRequestAdminComponent
          ),
        canActivate: [adminGuard]
      },
      {
        path: 'intern-schedule',
        loadComponent: () =>
          import('./pages/schedule-intern/schedule-intern.component').then(
            (m) => m.ScheduleInternComponent
          ),
      },
      {
        path: 'approvals',
        loadComponent: () =>
          import('./pages/approvals/approvals.component').then(
            (m) => m.ApprovalsComponent
          ),
        canActivate: [adminGuard]
      },
      {
        path: 'list-schedule-intern',
        loadComponent: () =>
          import('./pages/list-schedule-intern/list-schedule-intern.component').then(
            (m) => m.ListScheduleInternComponent
          ),
        canActivate: [adminGuard]
      },
      {
        path: 'leave-balance',
        loadComponent: () =>
          import('./pages/leave-balance-chart/leave-balance-chart.component').then(
            (m) => m.LeaveBalanceChartComponent
          ),
      },
      {
        path: 'admin-create-account',
        loadComponent: () =>
          import('./pages/employee-registration/employee-registration.component').then(
            (m) => m.EmployeeRegistrationComponent
          ),
      },
      {
        path: 'employee-leave-statistics',
        loadComponent: () =>
          import('./pages/employee-leave-statistics/employee-leave-statistics.component').then(
            (m) => m.EmployeeLeaveStatisticsComponent
          ),
        canActivate: [adminGuard]
      },
      {
        path: 'admin-leave-request',
        loadComponent: () =>
          import('./pages/admin-leave-request/admin-leave-request.component').then(
            (m) => m.AdminLeaveRequestComponent
          ),
        canActivate: [adminGuard]
      },
     
      {
        path: '',
        redirectTo: 'inforcompany',
        pathMatch: 'full',
      },
    ],
  },
];