import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { loanApplicationGuard } from './loan-application.guard';

describe('loanApplicationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => loanApplicationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
