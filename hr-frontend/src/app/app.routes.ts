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
        loadComponent: () => import('./pages/inforcompany/inforcompany.component')
          .then(m => m.InforcompanyComponent),
      },
      {
        path: 'create-leave-request',
        // Using standardized dynamic import path
        loadComponent: () => import('./pages/leave-request/leave-request.component')
          .then(m => m.LeaveRequestComponent),
      },
      {
        path: 'list-leave-request',
        // Using standardized dynamic import path
        loadComponent: () => import('./pages/leave-request-admin/leave-request-admin.component')
          .then(m => m.LeaveRequestAdminComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'intern-schedule',
        // Using standardized dynamic import path
        loadComponent: () => import('./pages/schedule-intern/schedule-intern.component')
          .then(m => m.ScheduleInternComponent),
      },
      {
        path: 'approvals',
        // Using standardized dynamic import path
        loadComponent: () => import('./pages/approvals/approvals.component')
          .then(m => m.ApprovalsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'list-schedule-intern',
        // Using standardized dynamic import path
        loadComponent: () => import('./pages/list-schedule-intern/list-schedule-intern.component')
          .then(m => m.ListScheduleInternComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'leave-balance',
        // Using standardized dynamic import path
        loadComponent: () => import('./pages/leave-balance-chart/leave-balance-chart.component')
          .then(m => m.LeaveBalanceChartComponent),
      },
      {
        path: 'admin-create-account',
        // Using standardized dynamic import path
        loadComponent: () => import('./pages/employee-registration/employee-registration.component')
          .then(m => m.EmployeeRegistrationComponent),
      },
      {
        path: 'employee-leave-statistics',
        // Using standardized dynamic import path
        loadComponent: () => import('./pages/employee-leave-statistics/employee-leave-statistics.component')
          .then(m => m.EmployeeLeaveStatisticsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'admin-leave-request',
        // Using standardized dynamic import path
        loadComponent:() => import ('./pages/admin-leave-request/admin-leave-request.component')
          .then(m => m.AdminLeaveRequestComponent),
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