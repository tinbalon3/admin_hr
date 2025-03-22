import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  animate,
  state,
  style,
  transition,
  trigger,
  keyframes
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
      width: 320px;
    }

    .notification-container {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 16px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      min-width: 320px;
      max-width: 420px;
      position: relative;
      overflow: hidden;
      gap: 16px;
      margin-left: auto;
      will-change: transform, opacity;
    }

    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .content {
      flex-grow: 1;
      margin-right: 8px;
    }

    .message {
      font-size: 14.5px;
      line-height: 1.5;
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    .close-button {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      transition: all 0.2s ease;
      margin-right: -4px;
      opacity: 0.7;
    }

    .close-button:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #64748b;
      opacity: 1;
    }

    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      transform-origin: left;
      animation: progress linear forwards;
      border-bottom-left-radius: 3px;
    }

    @keyframes progress {
      0% {
        transform: scaleX(1);
      }
      100% {
        transform: scaleX(0);
      }
    }

    /* Success style */
    .success {
      background: rgba(240, 253, 244, 0.95);
      border-left: 4px solid #22c55e;
      box-shadow: 0 8px 32px rgba(34, 197, 94, 0.12);
      .icon-container {
        background: linear-gradient(135deg, #dcfce7, #bbf7d0);
        color: #15803d;
      }
      .message {
        color: #166534;
      }
      .progress-bar {
        background: linear-gradient(to right, #22c55e, #4ade80);
      }
    }

    /* Error style */
    .error {
      background: rgba(254, 242, 242, 0.95);
      border-left: 4px solid #ef4444;
      box-shadow: 0 8px 32px rgba(239, 68, 68, 0.12);
      .icon-container {
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        color: #b91c1c;
      }
      .message {
        color: #991b1b;
      }
      .progress-bar {
        background: linear-gradient(to right, #ef4444, #f87171);
      }
    }

    /* Info style */
    .info {
      background: rgba(239, 246, 255, 0.95);
      border-left: 4px solid #3b82f6;
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
      .icon-container {
        background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        color: #1d4ed8;
      }
      .message {
        color: #1e40af;
      }
      .progress-bar {
        background: linear-gradient(to right, #3b82f6, #60a5fa);
      }
    }

    /* Warning style */
    .warning {
      background: rgba(255, 251, 235, 0.95);
      border-left: 4px solid #f59e0b;
      box-shadow: 0 8px 32px rgba(245, 158, 11, 0.12);
      .icon-container {
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        color: #b45309;
      }
      .message {
        color: #92400e;
      }
      .progress-bar {
        background: linear-gradient(to right, #f59e0b, #fbbf24);
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
      transition('void => enter', [
        animate('300ms ease-out', keyframes([
          style({ transform: 'translateX(100%)', opacity: 0, offset: 0 }),
          style({ transform: 'translateX(-5%)', opacity: 0.5, offset: 0.7 }),
          style({ transform: 'translateX(0)', opacity: 1, offset: 1.0 })
        ]))
      ]),
      transition('enter => leave', [
        animate('300ms ease-in', keyframes([
          style({ transform: 'translateX(0)', opacity: 1, offset: 0 }),
          style({ transform: 'translateX(-5%)', opacity: 1, offset: 0.3 }),
          style({ transform: 'translateX(100%)', opacity: 0, offset: 1.0 })
        ]))
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  state: 'void' | 'enter' | 'leave' = 'void';
  @Input() set data(value: NotificationData) {
    if (value.message) {
      this._data = value;
      this.show();
    }
  }
  get data(): NotificationData {
    return this._data;
  }

  private _data: NotificationData = {
    message: '',
    type: 'info',
    duration: 3000,
    dismissable: true
  };

  private hideTimeout?: number;

  ngOnInit() {}

  ngOnDestroy() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }

  show() {
    this.state = 'enter';
    this.hideTimeout = window.setTimeout(() => this.hide(), this._data.duration);
  }

  hide() {
    this.state = 'leave';
    setTimeout(() => this.state = 'void', 300);
  }

  dismiss() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    this.hide();
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