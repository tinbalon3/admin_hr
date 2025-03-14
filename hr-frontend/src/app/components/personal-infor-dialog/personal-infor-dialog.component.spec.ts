import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalInforDialogComponent } from './personal-infor-dialog.component';

describe('PersonalInforDialogComponent', () => {
  let component: PersonalInforDialogComponent;
  let fixture: ComponentFixture<PersonalInforDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalInforDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonalInforDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
