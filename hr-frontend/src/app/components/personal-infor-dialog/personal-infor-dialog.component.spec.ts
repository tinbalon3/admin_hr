import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalInfoDialogComponent } from './personal-infor-dialog.component';

describe('PersonalInfoDialogComponent', () => {
  let component: PersonalInfoDialogComponent;
  let fixture: ComponentFixture<PersonalInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalInfoDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonalInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
