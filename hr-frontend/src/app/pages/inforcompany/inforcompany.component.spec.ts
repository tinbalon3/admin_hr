import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InforcompanyComponent } from './inforcompany.component';

describe('InforcompanyComponent', () => {
  let component: InforcompanyComponent;
  let fixture: ComponentFixture<InforcompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InforcompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InforcompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
