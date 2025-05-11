import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanApplicationPageComponent } from './loan-application-page.component';

describe('LoanApplicationPageComponent', () => {
  let component: LoanApplicationPageComponent;
  let fixture: ComponentFixture<LoanApplicationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanApplicationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanApplicationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
