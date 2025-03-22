import { ApplicationRef, ComponentRef, Injectable, NgZone, createComponent } from '@angular/core';
import { NotificationComponent } from '../components/notification/notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private activeNotification?: ComponentRef<NotificationComponent>;

  constructor(
    private appRef: ApplicationRef,
    private zone: NgZone
  ) {}

  private show(message: string, type: 'success' | 'error' | 'info' | 'warning') {
    this.zone.run(() => {
      // Remove existing notification if any
      if (this.activeNotification) {
        this.activeNotification.destroy();
      }

      // Create notification component
      const notification = document.createElement('div');
      document.body.appendChild(notification);

      const componentRef = createComponent(NotificationComponent, {
        environmentInjector: this.appRef.injector,
        hostElement: notification
      });

      // Set notification data
      componentRef.instance.data = {
        message,
        type,
        duration: 4000,
        dismissable: true
      };

      // Handle animation end for cleanup
      const element = notification as HTMLElement;
      element.addEventListener('animationend', (event) => {
        if (componentRef.instance.state === 'leave') {
          componentRef.destroy();
          document.body.removeChild(notification);
        }
      });

      // Auto dismiss after duration
      setTimeout(() => {
        componentRef.instance.dismiss();
      }, 4000);

      // Attach to change detection
      this.appRef.attachView(componentRef.hostView);

      // Store reference
      this.activeNotification = componentRef;
    });
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }
}