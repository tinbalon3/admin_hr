import { NativeDateAdapter } from '@angular/material/core';

export class VietnameseDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: string): string {
    const format = 'dd/MM/yyyy'; // Vietnamese date format
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}