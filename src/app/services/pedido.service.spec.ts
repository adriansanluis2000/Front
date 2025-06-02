import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PedidoService } from './pedido.service';

describe('PedidoService', () => {
  let service: PedidoService;
  let httpMock: HttpTestingController;

  const mockPedido = { id: 1, producto: 'Gafas', cantidad: 2 };
  const apiUrl = 'http://localhost:3000/api/pedidos';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PedidoService],
    });

    service = TestBed.inject(PedidoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería registrar un pedido', () => {
    service.registrarPedido(mockPedido).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPedido);

    req.flush({ success: true });
  });

  it('debería obtener historial de pedidos con parámetro', () => {
    const tipo = 'online';

    service.obtenerHistorialPedidos(tipo).subscribe((response) => {
      expect(response).toEqual([{ id: 1, tipo: 'online' }]);
    });

    const req = httpMock.expectOne(`${apiUrl}?tipo=online`);
    expect(req.request.method).toBe('GET');

    req.flush([{ id: 1, tipo: 'online' }]);
  });

  it('debería obtener historial de pedidos sin parámetro', () => {
    service.obtenerHistorialPedidos('').subscribe((response) => {
      expect(response).toEqual([]);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('debería eliminar un pedido por ID', () => {
    const id = 1;

    service.eliminarPedido(id).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');

    req.flush({ success: true });
  });

  it('debería obtener un pedido por ID', () => {
    const id = 1;

    service.obtenerPedidoPorId(id).subscribe((response) => {
      expect(response).toEqual(mockPedido);
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('GET');

    req.flush(mockPedido);
  });

  it('debería actualizar un pedido por ID', () => {
    const id = 1;
    const updatedPedido = { ...mockPedido, cantidad: 3 };

    service.actualizarPedido(id, updatedPedido).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedPedido);

    req.flush({ success: true });
  });

  it('debería devolver el stock de un pedido', () => {
    const id = 1;

    service.devolverStock(id).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/devolver-stock/${id}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});

    req.flush({ success: true });
  });
});
