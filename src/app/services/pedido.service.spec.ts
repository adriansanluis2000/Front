import { TestBed } from '@angular/core/testing';
import { PedidoService } from './pedido.service';
import { HttpClientModule } from '@angular/common/http';

describe('PedidoService', () => {
  let service: PedidoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ]
    }).compileComponents();
    service = TestBed.inject(PedidoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
