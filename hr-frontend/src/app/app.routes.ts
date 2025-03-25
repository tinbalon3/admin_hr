import { Routes } from '@angular/router';

import { adminGuard } from './guards/admin.guard';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

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
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'inforcompany',
        // Using standardized dynamic import path
        loadComponent: async () => {
          const m = await import('./pages/inforcompany/inforcompany.component');
          return m.InforcompanyComponent;
        },
      },
      {
        path: 'create-leave-request',
        // Using standardized dynamic import path
        loadComponent: async () => {
          const m = await import('./pages/leave-request/leave-request.component');
          return m.LeaveRequestComponent;
        },
      },
      {
        path: 'list-leave-request',
        // Using standardized dynamic import path
        loadComponent: async () => {
          const m = await import('./pages/leave-request-admin/leave-request-admin.component');
          return m.LeaveRequestAdminComponent;
        },
        canActivate: [adminGuard]
      },
      {
        path: 'intern-schedule',
        // Using standardized dynamic import path
        loadComponent: async () => {
          const m = await import('./pages/schedule-intern/schedule-intern.component');
          return m.ScheduleInternComponent;
        },
      },
      {
        path: 'approvals',
        // Using standardized dynamic import path
        loadComponent: async () => {
          const m = await import('./pages/approvals/approvals.component');
          return m.ApprovalsComponent;
        },
        canActivate: [adminGuard]
      },
      {
        path: 'list-schedule-intern',
        // Using standardized dynamic import path
        loadComponent: async () => {
          const m = await import('./pages/list-schedule-intern/list-schedule-intern.component');
          return m.ListScheduleInternComponent;
        },
        canActivate: [adminGuard]
      },
      {
        path: 'leave-balance',
        // Using standardized dynamic import path
        loadComponent: async () => {
          const m = await import('./pages/leave-balance-chart/leave-balance-chart.component');
          return m.LeaveBalanceChartComponent;
        },
      },
      {
        path: 'admin-create-account',
        // Using standardized dynamic import path
        loadComponent: async () => {
          const m = await import('./pages/employee-registration/employee-registration.component');
          return m.EmployeeRegistrationComponent;
        },
      },
      {
        path: 'employee-leave-statistics',
        // Using standardized dynamic import path
        loadComponent: async () => {
          const m = await import('./pages/employee-leave-statistics/employee-leave-statistics.component');
          return m.EmployeeLeaveStatisticsComponent;
        },
        canActivate: [adminGuard]
      },
      {
        path: 'admin-leave-request',
        // Using standardized dynamic import path
        loadComponent: async () => {
          const m = await import('./pages/admin-leave-request/admin-leave-request.component');
          return m.AdminLeaveRequestComponent;
        },
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