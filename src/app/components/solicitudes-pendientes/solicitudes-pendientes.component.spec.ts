import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SolicitudesPendientesComponent } from './solicitudes-pendientes.component';
import { SolicitudService } from '../../services/solicitud.service';
import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

// Mocks para los servicios
const mockSolicitudes = [
  {
    id: 1,
    fecha: '2025-06-01T00:00:00Z',
    Productos: [
      {
        id: 101,
        nombre: 'Producto A',
        precio: 10,
        stock: 5,
        ProductoSolicitud: { cantidad: 3 },
      },
    ],
  },
];

describe('SolicitudesPendientesComponent', () => {
  let component: SolicitudesPendientesComponent;
  let fixture: ComponentFixture<SolicitudesPendientesComponent>;
  let solicitudServiceSpy: jasmine.SpyObj<SolicitudService>;
  let pedidoServiceSpy: jasmine.SpyObj<PedidoService>;

  beforeEach(async () => {
    const solicitudSpy = jasmine.createSpyObj('SolicitudService', [
      'obtenerSolicitudes',
      'eliminarSolicitud',
      'actualizarSolicitud',
    ]);
    const productoSpy = jasmine.createSpyObj('ProductoService', ['']);
    const pedidoSpy = jasmine.createSpyObj('PedidoService', ['registrarPedido']);

    await TestBed.configureTestingModule({
      imports: [SolicitudesPendientesComponent],
      providers: [
        { provide: SolicitudService, useValue: solicitudSpy },
        { provide: ProductoService, useValue: productoSpy },
        { provide: PedidoService, useValue: pedidoSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudesPendientesComponent);
    component = fixture.componentInstance;

    solicitudServiceSpy = TestBed.inject(SolicitudService) as jasmine.SpyObj<SolicitudService>;
    pedidoServiceSpy = TestBed.inject(PedidoService) as jasmine.SpyObj<PedidoService>;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('cargarSolicitudes', () => {
    it('debería cargar solicitudes correctamente', () => {
      solicitudServiceSpy.obtenerSolicitudes.and.returnValue(of(mockSolicitudes));
      component.cargarSolicitudes();
      expect(solicitudServiceSpy.obtenerSolicitudes).toHaveBeenCalled();
      expect(component.solicitudes).toEqual(mockSolicitudes);
      expect(component.errorMessage).toBe('');
    });

    it('debería mostrar mensaje si no hay solicitudes', () => {
      solicitudServiceSpy.obtenerSolicitudes.and.returnValue(of([]));
      component.cargarSolicitudes();
      expect(component.solicitudes.length).toBe(0);
      expect(component.errorMessage).toBe('No se encontraron solicitudes pendientes.');
    });

    it('debería manejar error de conexión', () => {
      const error = new HttpErrorResponse({ status: 0 });
      solicitudServiceSpy.obtenerSolicitudes.and.returnValue(throwError(() => error));
      component.cargarSolicitudes();
      expect(component.errorMessage).toBe('Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.');
    });

    it('debería manejar error general', () => {
      const error = new HttpErrorResponse({ status: 500 });
      solicitudServiceSpy.obtenerSolicitudes.and.returnValue(throwError(() => error));
      component.cargarSolicitudes();
      expect(component.errorMessage).toBe('Error al obtener las solicitudes. Por favor, inténtalo de nuevo más tarde.');
    });
  });

  describe('eliminarSolicitud', () => {
    it('debería eliminar solicitud y actualizar la lista', () => {
      component.solicitudes = [...mockSolicitudes];
      solicitudServiceSpy.eliminarSolicitud.and.returnValue(of({ message: 'Eliminado' }));

      component.eliminarSolicitud(mockSolicitudes[0].id);

      expect(solicitudServiceSpy.eliminarSolicitud).toHaveBeenCalledWith(mockSolicitudes[0].id);
      expect(component.solicitudes.length).toBe(0);
    });
  });

  describe('verDetallesSolicitud y cerrarDetalles', () => {
    it('debería seleccionar la solicitud por id', () => {
      component.solicitudes = [...mockSolicitudes];
      component.verDetallesSolicitud(1);
      expect(component.solicitudSeleccionada).toEqual(mockSolicitudes[0]);
    });

    it('debería cerrar detalles', () => {
      component.solicitudSeleccionada = mockSolicitudes[0];
      component.cerrarDetalles();
      expect(component.solicitudSeleccionada).toBeNull();
    });
  });

  describe('abrirModalRecepcion', () => {
    beforeEach(() => {
      spyOn(window, 'prompt').and.returnValue('2');
      spyOn(window, 'alert');
      component.solicitudSeleccionada = mockSolicitudes[0];
    });

    it('debería asignar producto seleccionado y unidades recibidas y confirmar recepción', () => {
      const producto = mockSolicitudes[0].Productos[0];
      spyOn(component, 'confirmarRecepcion').and.callFake(() => {});

      component.abrirModalRecepcion(producto);

      expect(component.productoSeleccionado).toEqual(producto);
      expect(component.unidadesRecibidas).toBe(2);
      expect(component.confirmarRecepcion).toHaveBeenCalled();
    });

    it('debería no hacer nada si se cancela el prompt', () => {
      (window.prompt as jasmine.Spy).and.returnValue(null);

      const producto = mockSolicitudes[0].Productos[0];
      component.abrirModalRecepcion(producto);

      expect(component.productoSeleccionado).toEqual(producto);
      expect(component.unidadesRecibidas).toBe(0);
    });
  });

  describe('cerrarModalRecepcion', () => {
    it('debería limpiar producto seleccionado y unidades recibidas', () => {
      component.productoSeleccionado = mockSolicitudes[0].Productos[0];
      component.unidadesRecibidas = 5;

      component.cerrarModalRecepcion();

      expect(component.productoSeleccionado).toBeNull();
      expect(component.unidadesRecibidas).toBe(0);
    });
  });

  describe('confirmarRecepcion', () => {
    beforeEach(() => {
      component.solicitudSeleccionada = mockSolicitudes[0];
      component.productoSeleccionado = mockSolicitudes[0].Productos[0];
    });

    it('debería mostrar alerta si cantidad inválida', () => {
      component.unidadesRecibidas = 0;
      spyOn(window, 'alert');

      component.confirmarRecepcion();

      expect(window.alert).toHaveBeenCalledWith('Cantidad inválida.');
    });

    it('debería mostrar alerta si no hay solicitud seleccionada', () => {
      component.unidadesRecibidas = 1;
      component.solicitudSeleccionada = null;
      spyOn(window, 'alert');

      component.confirmarRecepcion();

      expect(window.alert).toHaveBeenCalledWith('Error: No se encontró la solicitud.');
    });

    it('debería mostrar alerta si forkJoin falla', fakeAsync(() => {
      component.unidadesRecibidas = 2;
      component.productoSeleccionado.ProductoSolicitud.cantidad = 3;

      pedidoServiceSpy.registrarPedido.and.returnValue(throwError(() => new Error('error')));
      solicitudServiceSpy.actualizarSolicitud.and.returnValue(
        of({
          id: 1,
          fecha: '2025-01-01',
          Productos: [], // o un array con productos mockeados si hace falta
        })
      );

      spyOn(window, 'alert');
      spyOn(console, 'error');

      component.confirmarRecepcion();

      tick();

      expect(window.alert).toHaveBeenCalledWith('Ocurrió un error al procesar la solicitud. Inténtalo de nuevo.');
      expect(console.error).toHaveBeenCalled();
    }));
  });
});
