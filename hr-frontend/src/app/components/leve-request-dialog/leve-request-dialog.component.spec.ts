import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeveRequestDialogComponent } from './leve-request-dialog.component';

describe('LeveRequestDialogComponent', () => {
  let component: LeveRequestDialogComponent;
  let fixture: ComponentFixture<LeveRequestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeveRequestDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeveRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
