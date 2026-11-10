import { TestBed } from '@angular/core/testing';
import { SQLiteServices } from './sqlite-services';

describe('SQLiteServices', () => {
  let service: SQLiteServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SQLiteServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
