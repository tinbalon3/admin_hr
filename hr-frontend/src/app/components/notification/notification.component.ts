import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { 
  animate, 
  state, 
  style, 
  transition, 
  trigger 
} from '@angular/animations';

export interface NotificationData {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
  dismissable?: boolean;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="notification-container" 
         [@notificationState]="state" 
         [class.success]="data.type === 'success'"
         [class.error]="data.type === 'error'"
         [class.info]="data.type === 'info'"
         [class.warning]="data.type === 'warning'">
     <div class="icon-container">
       <mat-icon>{{getIcon()}}</mat-icon>
     </div>
     <div class="content">
       <div class="message">{{data.message}}</div>
     </div>
     <button class="close-button" (click)="dismiss()">
       <mat-icon>close</mat-icon>
     </button>
     <div class="progress-bar" [style.animation-duration]="data.duration + 'ms'"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }

    .notification-container {
      display: flex;
      align-items: center;
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 300px;
      max-width: 400px;
      position: relative;
      overflow: hidden;
      gap: 12px;
    }

    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .content {
      flex-grow: 1;
    }

    .message {
      color: #2c3e50;
      font-size: 14px;
      line-height: 1.4;
    }

    .close-button {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      color: #64748b;
    }

    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      animation: progress linear forwards;
    }

    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }

    /* Success style */
    .success {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      .icon-container {
        background: #dcfce7;
        color: #16a34a;
      }
      .message {
        color: #166534;
      }
      .progress-bar {
        background: #22c55e;
      }
    }

    /* Error style */
    .error {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      .icon-container {
        background: #fee2e2;
        color: #dc2626;
      }
      .message {
        color: #991b1b;
      }
      .progress-bar {
        background: #ef4444;
      }
    }

    /* Info style */
    .info {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      .icon-container {
        background: #dbeafe;
        color: #2563eb;
      }
      .message {
        color: #1e40af;
      }
      .progress-bar {
        background: #3b82f6;
      }
    }

    /* Warning style */
    .warning {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      .icon-container {
        background: #fef3c7;
        color: #d97706;
      }
      .message {
        color: #92400e;
      }
      .progress-bar {
        background: #f59e0b;
      }
    }
  `],
  animations: [
    trigger('notificationState', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('enter', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('leave', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      transition('void => enter', animate('300ms ease-out')),
      transition('enter => leave', animate('300ms ease-in'))
    ])
  ]
})
export class NotificationComponent implements OnInit {
  state: 'void' | 'enter' | 'leave' = 'void';
  @Input() data: NotificationData = {
    message: '',
    type: 'info',
    duration: 3000,
    dismissable: true
  };

  ngOnInit() {
    this.state = 'enter';
  }

  dismiss() {
    this.state = 'leave';
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }
}