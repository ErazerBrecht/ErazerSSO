import { TestBed, inject } from '@angular/core/testing';
import { AppLoadService } from './app-load.service';

describe('AppLoadServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppLoadService]
    });
  });

  it('should be created', inject([AppLoadService], (service: AppLoadService) => {
    expect(service).toBeTruthy();
  }));
});
