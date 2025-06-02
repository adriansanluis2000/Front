import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SolicitudService } from './solicitud.service';
import { Solicitud } from '../models/solicitud.model';

describe('SolicitudService', () => {
  let service: SolicitudService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:3000/api/solicitudes';

  const mockSolicitud: Solicitud = {
    id: 1,
    fecha: new Date().toISOString(),
    Productos: [
      {
        id: 101,
        nombre: 'Producto A',
        precio: 25.5,
        stock: 100,
        descripcion: 'Descripción de prueba',
        ProductoSolicitud: {
          cantidad: 2,
        },
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SolicitudService],
    });

    service = TestBed.inject(SolicitudService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería crear una solicitud', () => {
    service.crearSolicitud(mockSolicitud.Productos).subscribe((response) => {
      expect(response).toEqual(mockSolicitud);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockSolicitud.Productos);

    req.flush(mockSolicitud);
  });

  it('debería obtener solicitudes', () => {
    service.obtenerSolicitudes().subscribe((response) => {
      expect(response).toEqual([mockSolicitud]);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');

    req.flush([mockSolicitud]);
  });

  it('debería eliminar una solicitud por ID', () => {
    const id = 1;

    service.eliminarSolicitud(id).subscribe((response) => {
      expect(response).toEqual({ message: 'Solicitud eliminada correctamente' });
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');

    req.flush({ message: 'Solicitud eliminada correctamente' });
  });

  it('debería actualizar una solicitud', () => {
    const id = mockSolicitud.id;

    // Nuevos productos con la estructura correcta según el modelo
    const nuevosProductos = [
      {
        id: 102,
        nombre: 'Producto B',
        precio: 30,
        stock: 50,
        descripcion: 'Producto nuevo',
        ProductoSolicitud: {
          cantidad: 3,
        },
      },
    ];

    service.actualizarSolicitud(id, nuevosProductos).subscribe((response) => {
      expect(response).toEqual({ ...mockSolicitud, Productos: nuevosProductos });
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(nuevosProductos);

    req.flush({ ...mockSolicitud, Productos: nuevosProductos });
  });
});
