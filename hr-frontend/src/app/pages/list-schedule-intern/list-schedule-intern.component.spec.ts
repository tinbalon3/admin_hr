import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListScheduleInternComponent } from './list-schedule-intern.component';

describe('ListScheduleInternComponent', () => {
  let component: ListScheduleInternComponent;
  let fixture: ComponentFixture<ListScheduleInternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListScheduleInternComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListScheduleInternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
