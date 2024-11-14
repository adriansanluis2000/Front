import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarPedidoComponent } from './registrar-pedido.component';
import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { of, throwError } from 'rxjs';

describe('RegistrarPedidoComponent', () => {
  let component: RegistrarPedidoComponent;
  let fixture: ComponentFixture<RegistrarPedidoComponent>;
  let pedidoServiceMock: jasmine.SpyObj<PedidoService>;
  let productoServiceMock: jasmine.SpyObj<ProductoService>;

  beforeEach(async () => {
    pedidoServiceMock = jasmine.createSpyObj('PedidoService', ['registrarPedido']);
    productoServiceMock = jasmine.createSpyObj('ProductoService', ['obtenerProductos']);

    await TestBed.configureTestingModule({
      imports: [RegistrarPedidoComponent],
      providers: [
        { provide: PedidoService, useValue: pedidoServiceMock },
        { provide: ProductoService, useValue: productoServiceMock }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarPedidoComponent);
    component = fixture.componentInstance;

    // Mockea el servicio para recibir algunos productos
    productoServiceMock.obtenerProductos.and.returnValue(of([
      { id: 1, nombre: 'Producto 1', precio: 10 },
      { id: 2, nombre: 'Producto 2', precio: 15 }
    ]));

    component.cargarProductos();
  });

  describe('Prueba de Éxito: Registrar Recepción de Pedido', () => {
    it('debería abrir el formulario de nuevo pedido y añadir productos', () => {
      expect(component.productos.length).toBeGreaterThan(0);

      const productoMock = { id: 1, nombre: 'Producto 1', precio: 10 };
      component.agregarProducto(productoMock);

      expect(component.productosPedido.length).toBe(1);
      expect(component.productosPedido[0]).toEqual({ producto: productoMock, cantidad: 1 });

      // Finalizar pedido
      component.registrarPedido();

      expect(pedidoServiceMock.registrarPedido).toHaveBeenCalledWith([{ id: 1, cantidad: 1 }]);
      expect(component.productosPedido.length).toBe(0); // Debería limpiarse el pedido después de enviado
    });
  });

  describe('Prueba de Error por Fallo de Conexión a Internet', () => {
    it('debería notificar la falta de conexión y no registrar el pedido', () => {
      // Simulamos que no hay conexión
      spyOnProperty(navigator, 'onLine').and.returnValue(false);
      component.registrarPedido();

      expect(pedidoServiceMock.registrarPedido).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.');
    });

    it('debería reintentar guardar el pedido una vez se restablece la conexión', () => {
      // Simulamos que no hay conexión
      const onlineSpy = spyOnProperty(navigator, 'onLine', 'get').and.returnValue(false);
      component.productosPedido.push({ producto: { id: 1 }, cantidad: 1 });

      component.registrarPedido();

      // Simulamos que se restablece la conexión
      onlineSpy.and.returnValue(true); // Reconfigura el espía
      pedidoServiceMock.registrarPedido.and.returnValue(of({ success: true }));

      component.registrarPedido(); // Llama nuevamente para registrar el pedido

      expect(pedidoServiceMock.registrarPedido).toHaveBeenCalledWith([{ id: 1, cantidad: 1 }]);
    });
  });

  describe('Prueba de Error por Fallo en la Base de Datos', () => {
    it('debería mostrar un mensaje de error si falla al guardar el pedido en la base de datos', () => {
      pedidoServiceMock.registrarPedido.and.returnValue(throwError({ error: { mensaje: 'Error en la base de datos' } }));

      // Espiar la consola para comprobar errores
      const consoleErrorSpy = spyOn(console, 'error').and.callThrough();

      component.agregarProducto({ id: 1, nombre: 'Producto 1', precio: 10 });
      component.registrarPedido();

      // Verificamos que el producto sigue en el pedido
      expect(component.productosPedido.length).toBe(1);
      expect(component.productosPedido[0].producto.nombre).toBe('Producto 1');

      // Comprobar que se ha registrado un error en la consola con el objeto de error
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al registrar el pedido:', jasmine.any(Object));

      // Verificar que el mensaje de error específico está en el objeto
      const errorArg = consoleErrorSpy.calls.mostRecent().args[1];
      expect(errorArg.error.mensaje).toBe('Error en la base de datos');
    });

    it('debería permitir reintentar guardar el pedido después de un fallo en la base de datos', () => {
      pedidoServiceMock.registrarPedido.and.returnValue(throwError({ error: { mensaje: 'Error en la base de datos' } }));
      component.agregarProducto({ id: 1, nombre: 'Producto 1', precio: 10 });
      component.registrarPedido();

      pedidoServiceMock.registrarPedido.and.returnValue(of({ success: true }));
      component.registrarPedido();

      expect(component.productosPedido.length).toBe(0);
      expect(pedidoServiceMock.registrarPedido).toHaveBeenCalledWith([{ id: 1, cantidad: 1 }]);
    });
  });


  describe('Pruebas de eliminación de productos del pedido', () => {
    describe('Prueba de Éxito: Eliminar Producto de Pedido en Recepción', () => {
      it('debería eliminar un producto del pedido y actualizar el listado de productos', () => {
        const productoMock = { id: 1, nombre: 'Producto 1', precio: 10 };
        component.productosPedido.push({ producto: productoMock, cantidad: 1 });

        component.quitarProducto({ producto: productoMock, cantidad: 1 });
        spyOn(window, 'confirm').and.returnValue(true);

        expect(component.productosPedido.length).toBe(0); // Debería estar vacío después de la eliminación
      });
    });

    describe('Prueba de Error por Cancelación de la Confirmación de Eliminación', () => {
      it('debería mantener el producto en el pedido si el usuario cancela la eliminación', () => {
        const productoMock = { id: 1, nombre: 'Producto 1', precio: 10 };
        component.productosPedido.push({ producto: productoMock, cantidad: 1 });

        component.quitarProducto({ producto: productoMock, cantidad: 1 });

        expect(component.productosPedido.length).toBe(1); // El producto debe permanecer en el pedido
      });
    });
  });


  describe('Pruebas de Editar Cantidad de Producto en Recepción', () => {
    describe('Prueba de Éxito: Editar Cantidad de Producto en el Pedido', () => {
      it('debería actualizar la cantidad del producto en el pedido con éxito y actualizar el precioTotal', () => {
        const productoMock = { id: 1, nombre: 'Producto 1', precio: 10 };
        const item = { producto: productoMock, cantidad: 1 };
        component.productosPedido.push(item);

        component.actualizarProducto({ ...item, cantidad: 3 });

        expect(component.productosPedido[0].cantidad).toBe(3);
        expect(component.calcularTotalPedido()).toBe(30);
      });
    });

    describe('Prueba de Error por Cantidad Negativa', () => {
      it('debería no permitir agregar un producto con cantidad negativa', () => {
        const productoMock = { id: 1, nombre: 'Producto 1' };
        component.agregarProducto(productoMock);
        component.productosPedido[0].cantidad = -3;

        spyOn(window, 'confirm').and.returnValue(false);
        component.actualizarProducto(component.productosPedido[0]);

        expect(component.productosPedido[0].cantidad).toBe(1);
      });
    });

    describe('Prueba de Error por Cantidad No Numérica', () => {
      it('debería mostrar un mensaje de error y restablecer la cantidad a 1 si se introduce un valor no numérico', () => {
        const producto = { id: 1, nombre: 'Producto Test', precio: 10 };
        const item = { producto, cantidad: NaN };

        spyOn(window, 'alert');

        component.actualizarProducto(item);

        expect(window.alert).toHaveBeenCalledWith('La cantidad debe ser un número.');
        expect(item.cantidad).toBe(1);
      });
    });

    describe('Prueba de Error por Cantidad con Decimales', () => {
      it('debería redondear la cantidad a un entero o mostrar un mensaje de error', () => {
        const producto = { id: 1, nombre: 'Producto Test', precio: 10 };
        const item = { producto, cantidad: 1 };
        component.productosPedido.push(item);

        spyOn(window, 'alert');

        component.actualizarProducto({ ...item, cantidad: 1.5 });

        expect(window.alert).toHaveBeenCalledWith('La cantidad debe ser un número entero.');
        expect(item.cantidad).toBe(1);
        expect(component.calcularTotalPedido()).toBe(10);
      });
    });
  });
});
