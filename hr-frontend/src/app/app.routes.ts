import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LeaveRequestComponent } from './pages/leave-request/leave-request.component';

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
      path: 'dashboard/infor_company',
      component: DashboardComponent,
    },
    {
      path: 'dashboard/create_leave_request',
      component: LeaveRequestComponent,
    },
  ];