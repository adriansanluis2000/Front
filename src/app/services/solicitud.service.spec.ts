import { TestBed } from '@angular/core/testing';

import { SolicitudService } from './solicitud.service';
import { HttpClientModule } from '@angular/common/http';

describe('SolicitudService', () => {
  let service: SolicitudService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(SolicitudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
