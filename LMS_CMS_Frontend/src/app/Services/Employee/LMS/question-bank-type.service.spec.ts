import { TestBed } from '@angular/core/testing';

import { QuestionBankTypeService } from './question-bank-type.service';

describe('QuestionBankTypeService', () => {
  let service: QuestionBankTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionBankTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
