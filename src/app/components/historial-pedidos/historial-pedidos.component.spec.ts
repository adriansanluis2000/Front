import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialPedidosComponent } from './historial-pedidos.component';
import { PedidoService } from '../../services/pedido.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HistorialPedidosComponent', () => {
  let component: HistorialPedidosComponent;
  let fixture: ComponentFixture<HistorialPedidosComponent>;
  let pedidoServiceMock: jasmine.SpyObj<PedidoService>;

  beforeEach(async () => {
    pedidoServiceMock = jasmine.createSpyObj('PedidoService', ['obtenerHistorialPedidos']);

    await TestBed.configureTestingModule({
      imports: [HistorialPedidosComponent],
      providers: [
        { provide: PedidoService, useValue: pedidoServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Para evitar errores con elementos HTML no reconocidos
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialPedidosComponent);
    component = fixture.componentInstance;
  });

  describe('Prueba de éxito', () => {
    it('debe mostrar los pedidos ordenados de más reciente a más antiguo', () => {
      const pedidosMock = [
        { id: 1, fecha: '2024-11-12T10:00:00', precioTotal: 100, estado: 'Enviado' },
        { id: 2, fecha: '2024-11-11T15:00:00', precioTotal: 50, estado: 'Enviado' },
        { id: 3, fecha: '2024-11-10T09:00:00', precioTotal: 200, estado: 'Enviado' }
      ];

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
  })

  describe('Pruebas de error', () => {
    it('debe mostrar un mensaje indicando que no se encontraron pedidos si la lista está vacía', () => {
      // Mock de un historial vacío
      pedidoServiceMock.obtenerHistorialPedidos.and.returnValue(of([]));
      component.obtenerHistorial();
      fixture.detectChanges();

      // Verificar que se muestra el mensaje de error
      const errorMessage = fixture.nativeElement.querySelector('.error-message p');
      expect(errorMessage.textContent).toContain('No se encontraron pedidos.');
    });

    it('debe mostrar un mensaje de error si no se puede cargar el historial de pedidos por un problema de red', () => {
      // Simular un error de conexión
      spyOnProperty(navigator, 'onLine').and.returnValue(false);
      component.obtenerHistorial();

      expect(pedidoServiceMock.obtenerHistorialPedidos).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.');      
    });
  })


  describe('Ver detalles', () => {
    describe('Prueba de éxito', () => {
      it('debe mostrar los detalles del pedido cuando el usuario selecciona un pedido', () => {
        pedidoServiceMock.obtenerHistorialPedidos.and.returnValue(of([
          {
            id: 1,
            fecha: new Date(),
            precioTotal: 100,
            Productos: [
              { nombre: 'Gafas', precio: 50, PedidoProducto: { cantidad: 2 } }
            ]
          }
        ]));

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
    })

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
    })
  })
});
