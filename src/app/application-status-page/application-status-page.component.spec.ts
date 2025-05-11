import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationStatusPageComponent } from './application-status-page.component';

describe('ApplicationStatusPageComponent', () => {
  let component: ApplicationStatusPageComponent;
  let fixture: ComponentFixture<ApplicationStatusPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationStatusPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationStatusPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
