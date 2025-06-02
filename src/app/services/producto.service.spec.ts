import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductoService } from './producto.service';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:3000/api/productos';
  const mockProducto = { id: 1, nombre: 'Gafa Negra', precio: 120 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductoService],
    });

    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería crear un producto', () => {
    service.crearProducto(mockProducto).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockProducto);

    req.flush({ success: true });
  });

  it('debería obtener productos', () => {
    service.obtenerProductos().subscribe((response) => {
      expect(response).toEqual([mockProducto]);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');

    req.flush([mockProducto]);
  });

  it('debería eliminar un producto por ID', () => {
    const id = 1;

    service.eliminarProducto(id).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');

    req.flush({ success: true });
  });

  it('debería actualizar un producto', () => {
    const updatedProducto = { ...mockProducto, precio: 130 };

    service.actualizarProducto(updatedProducto.id, updatedProducto).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/${updatedProducto.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProducto);

    req.flush({ success: true });
  });

  it('debería verificar si el nombre de producto ya existe', () => {
    const nombre = 'Gafa Negra';

    service.verificarNombreProducto(nombre).subscribe((response) => {
      expect(response).toBe(true);
    });

    const req = httpMock.expectOne(`http://localhost:3000/verificar-nombre?nombre=${nombre}`);
    expect(req.request.method).toBe('GET');

    req.flush(true);
  });
});
