import { TestBed } from '@angular/core/testing';

import { EmailSelection } from './email-selection';

describe('EmailSelection', () => {
  let service: EmailSelection;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailSelection);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
