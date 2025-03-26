import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittedLeaveRequestsComponent } from './submitted-leave-requests.component';

describe('SubmittedLeaveRequestsComponent', () => {
  let component: SubmittedLeaveRequestsComponent;
  let fixture: ComponentFixture<SubmittedLeaveRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmittedLeaveRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubmittedLeaveRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
