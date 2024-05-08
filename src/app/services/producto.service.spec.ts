import { TestBed } from '@angular/core/testing';
import { ProductoService } from './producto.service';
import { HttpClientModule } from '@angular/common/http';

describe('ProductosService', () => {
  let service: ProductoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ]
    })
    .compileComponents();
    service = TestBed.inject(ProductoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
