import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleInternComponent } from './schedule-intern.component';

describe('ScheduleInternComponent', () => {
  let component: ScheduleInternComponent;
  let fixture: ComponentFixture<ScheduleInternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleInternComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScheduleInternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
