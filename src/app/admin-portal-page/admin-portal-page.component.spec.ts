import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPortalPageComponent } from './admin-portal-page.component';

describe('AdminPortalPageComponent', () => {
  let component: AdminPortalPageComponent;
  let fixture: ComponentFixture<AdminPortalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPortalPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPortalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
