import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LeaveRequestComponent } from './pages/leave-request/leave-request.component';
import { InforcompanyComponent } from './pages/inforcompany/inforcompany.component';
// import { LeaveListComponent } from './pages/leave-list/leave-list.component'; // Giả định component này tồn tại
// import { InternScheduleComponent } from './pages/intern-schedule/intern-schedule.component'; // Giả định component này tồn tại

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
      // {
      //   path: 'leave-list',
      //   loadComponent: () =>
      //     import('./pages/leave-list/leave-list.component').then(
      //       (m) => m.LeaveListComponent
      //     ),
      // },
      // {
      //   path: 'intern-schedule',
      //   loadComponent: () =>
      //     import('./pages/intern-schedule/intern-schedule.component').then(
      //       (m) => m.InternScheduleComponent
      //     ),
      // },
      {
        path: '', // Default route khi vào /dashboard
        redirectTo: 'inforcompany',
        pathMatch: 'full',
      },
    ],
  },
];