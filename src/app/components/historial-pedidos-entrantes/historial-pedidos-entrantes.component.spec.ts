import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialPedidosEntrantesComponent } from './historial-pedidos-entrantes.component';
import { PedidoService } from '../../services/pedido.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HistorialPedidosEntrantesComponent', () => {
  let component: HistorialPedidosEntrantesComponent;
  let fixture: ComponentFixture<HistorialPedidosEntrantesComponent>;
  let pedidoServiceMock: jasmine.SpyObj<PedidoService>;

  const pedidosMock = [
    {
      id: 1,
      fecha: '2024-11-12T10:00:00',
      precioTotal: 100,
      estado: 'Enviado',
      tipo: 'entrante',
      Productos: [{ id: 1, nombre: 'Gafas', precio: 50, stock: 30, ProductoPedido: { cantidad: 2 } }],
    },
    {
      id: 2,
      fecha: '2024-11-11T15:00:00',
      precioTotal: 50,
      estado: 'Enviado',
      tipo: 'entrante',
      Productos: [{ id: 1, nombre: 'Gafas', precio: 50, stock: 30, ProductoPedido: { cantidad: 2 } }],
    },
    {
      id: 3,
      fecha: '2024-11-10T09:00:00',
      precioTotal: 200,
      estado: 'Enviado',
      tipo: 'entrante',
      Productos: [{ id: 1, nombre: 'Gafas', precio: 50, stock: 30, ProductoPedido: { cantidad: 2 } }],
    },
  ];

  beforeEach(async () => {
    pedidoServiceMock = jasmine.createSpyObj('PedidoService', [
      'obtenerHistorialPedidos',
      'eliminarPedido',
      'devolverStock',
    ]);

    await TestBed.configureTestingModule({
      imports: [HistorialPedidosEntrantesComponent],
      providers: [{ provide: PedidoService, useValue: pedidoServiceMock }],
      schemas: [NO_ERRORS_SCHEMA], // Para evitar errores con elementos HTML no reconocidos
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialPedidosEntrantesComponent);
    component = fixture.componentInstance;
  });

  describe('Prueba de éxito', () => {
    it('debe mostrar los pedidos ordenados de más reciente a más antiguo', () => {
      // Mock de los pedidos devueltos por el servicio
      pedidoServiceMock.obtenerHistorialPedidos.and.returnValue(of(pedidosMock));
      component.obtenerHistorial();
      fixture.detectChanges();

      // Verificar que los pedidos están ordenados de más reciente a más antiguo
      const dateCells = fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(2)');
      expect(dateCells[0].textContent).toContain('12/11/2024 10:00');
      expect(dateCells[1].textContent).toContain('11/11/2024 15:00');
      expect(dateCells[2].textContent).toContain('10/11/2024 09:00');
    });
  });

  describe('Pruebas de error', () => {
    it('debe mostrar un mensaje indicando que no se encontraron pedidos si la lista está vacía', () => {
      // Mock de un historial vacío
      pedidoServiceMock.obtenerHistorialPedidos.and.returnValue(of([]));
      component.obtenerHistorial();
      fixture.detectChanges();

      // Verificar que se muestra el mensaje de error
      const errorMessage = fixture.nativeElement.querySelector('.error-message p');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toContain('No se encontraron pedidos.');
    });

    it('debe mostrar un mensaje de error si no se puede cargar el historial de pedidos por un problema de red', () => {
      spyOn(console, 'error');
      pedidoServiceMock.obtenerHistorialPedidos.and.returnValue(throwError({ status: 0 }));
      fixture.detectChanges();

      expect(pedidoServiceMock.obtenerHistorialPedidos).toHaveBeenCalled();
      expect(component.errorMessage).toBe('Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.');
    });
  });

  describe('Ver detalles', () => {
    describe('Prueba de éxito', () => {
      it('debe mostrar los detalles del pedido cuando el usuario selecciona un pedido', () => {
        pedidoServiceMock.obtenerHistorialPedidos.and.returnValue(
          of([
            {
              id: 1,
              fecha: new Date(),
              precioTotal: 100,
              Productos: [{ nombre: 'Gafas', precio: 50, ProductoPedido: { cantidad: 2 } }],
            },
          ])
        );

        component.obtenerHistorial();
        fixture.detectChanges();

        const pedidoId = fixture.nativeElement.querySelector('td');
        expect(pedidoId.textContent).toContain('1');

        const verDetallesButton = fixture.nativeElement.querySelector('button');
        verDetallesButton.click();
        fixture.detectChanges();

        const modalTitle = fixture.nativeElement.querySelector('.detalles-pedido h3');
        expect(modalTitle.textContent).toContain('Detalles del Pedido #1');

        const productoNombre = fixture.nativeElement.querySelector('.producto-nombre');
        expect(productoNombre.textContent).toContain('Gafas');

        const productoCantidad = fixture.nativeElement.querySelector('.producto-cantidad');
        expect(productoCantidad.textContent).toContain('Cantidad: 2');

        const precioTotal = fixture.nativeElement.querySelector('.detalles-pedido p:nth-of-type(2)');
        expect(precioTotal.textContent).toContain('100€');
      });
    });

    describe('Prueba de error', () => {
      it('debe mostrar un mensaje de error cuando no se puede obtener el historial de pedidos', () => {
        // Simulamos que ocurre un error al obtener los pedidos
        pedidoServiceMock.obtenerHistorialPedidos.and.returnValue(of([]));
        fixture.detectChanges();

        // Esperar que el mensaje de error se muestre
        const errorMessage = fixture.nativeElement.querySelector('.error-message');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.textContent).toContain('No se encontraron pedidos');
      });
    });
  });

  describe('Eliminar pedido', () => {
    const pedidoId = 1;
    beforeEach(() => {
      fixture = TestBed.createComponent(HistorialPedidosEntrantesComponent);
      component = fixture.componentInstance;

      component.pedidos = [pedidosMock[0]];
    });

    describe('Prueba de éxito', () => {
      it('debe eliminar el pedido correctamente y actualizar la lista cuando se devuelve stock', () => {
        spyOn(window, 'confirm').and.returnValues(true, true); // Confirmaciones para eliminar y devolver stock
        pedidoServiceMock.devolverStock.and.returnValue(of({}));
        pedidoServiceMock.eliminarPedido.and.returnValue(of({}));

        component.eliminarPedido(pedidoId);

        expect(pedidoServiceMock.devolverStock).toHaveBeenCalledWith(pedidoId);
        expect(pedidoServiceMock.eliminarPedido).toHaveBeenCalledWith(pedidoId);
        expect(component.pedidos.length).toBe(0);
      });

      it('debe eliminar el pedido correctamente sin devolver stock', () => {
        spyOn(window, 'confirm').and.returnValues(true, false); // Confirmaciones para eliminar y no devolver stock
        pedidoServiceMock.eliminarPedido.and.returnValue(of({}));

        component.eliminarPedido(pedidoId);

        expect(pedidoServiceMock.devolverStock).not.toHaveBeenCalled();
        expect(pedidoServiceMock.eliminarPedido).toHaveBeenCalledWith(pedidoId);
        expect(component.pedidos.length).toBe(0);
      });
    });

    describe('Prueba de cancelación', () => {
      it('no debe eliminar el pedido si el usuario cancela la eliminación', () => {
        spyOn(window, 'confirm').and.returnValue(false);

        component.eliminarPedido(pedidoId);

        expect(pedidoServiceMock.eliminarPedido).not.toHaveBeenCalled();
        expect(component.pedidos.length).toBe(1);
      });
    });

    describe('Fallo en la base de datos', () => {
      it('debe mostrar un mensaje de error cuando ocurre un fallo en la base de datos', () => {
        spyOn(window, 'confirm').and.returnValues(true, false);
        pedidoServiceMock.eliminarPedido.and.returnValue(throwError({ error: 'Error de base de datos' }));
        component.eliminarPedido(pedidoId);

        expect(pedidoServiceMock.eliminarPedido).toHaveBeenCalledWith(pedidoId);
        expect(component.errorMessage).toBe('Error al eliminar pedido: Error de base de datos');
      });
    });

    describe('Pérdida de conexión a internet', () => {
      it('debe mostrar un mensaje de error cuando no hay conexión a internet', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        spyOnProperty(navigator, 'onLine').and.returnValue(false);

        component.eliminarPedido(pedidoId);

        expect(pedidoServiceMock.eliminarPedido).not.toHaveBeenCalled();
        expect(component.errorMessage).toBe(
          'No se pudo eliminar el pedido debido a una pérdida de conexión. Verifica tu conexión e inténtalo de nuevo.'
        );
      });
    });
  });

  describe('Búsqueda por ID', () => {
    beforeEach(() => {
      component.pedidosOriginales = pedidosMock;
      component.pedidos = [...pedidosMock];
    });
    describe('Prueba de éxito', () => {
      it('debería filtrar los pedidos por ID', () => {
        component.busqueda = '1';
        component.filtrarPedidos();
        expect(component.pedidos.length).toBe(1);
        expect(component.pedidos[0].id).toBe(1);
        expect(component.errorMessage).toBe('');
      });
    });

    describe('Prueba de búsqueda sin resultados', () => {
      it('debería manejar el caso cuando no se encuentran resultados', () => {
        component.busqueda = '999';
        component.filtrarPedidos();
        expect(component.pedidos.length).toBe(0);
        expect(component.errorMessage).toBe('No se encontraron pedidos.');
      });
    });

    describe('Prueba de error por caracteres no válidos', () => {
      it('debería mostrar un mensaje de error para entradas no válidas', () => {
        component.busqueda = '#@!';
        component.filtrarPedidos();
        expect(component.pedidos.length).toBe(3);
        expect(component.errorBusqueda).toBe('Número de pedido inválido. Solo se permiten números.');
      });
    });
  });

  describe('editarPedido', () => {
    it('debería navegar a la ruta correcta con el pedidoId', () => {
      const routerSpy = spyOn(component['router'], 'navigate');
      const pedidoId = 123;

      component.editarPedido(pedidoId);

      expect(routerSpy).toHaveBeenCalledWith(['/registrar-pedido-entrante', pedidoId]);
    });
  });

  describe('cerrarDetalles', () => {
    it('debería establecer pedidoSeleccionado a null', () => {
      component.pedidoSeleccionado = pedidosMock[0];

      component.cerrarDetalles();

      expect(component.pedidoSeleccionado).toBeNull();
    });
  });
});
