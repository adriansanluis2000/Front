import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarPedidoEntranteComponent } from './registrar-pedido-entrante.component';
import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SolicitudService } from '../../services/solicitud.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Solicitud } from '../../models/solicitud.model';
import { PLATFORM_ID } from '@angular/core';

describe('RegistrarPedidoEntranteComponent', () => {
  let component: RegistrarPedidoEntranteComponent;
  let fixture: ComponentFixture<RegistrarPedidoEntranteComponent>;
  let pedidoServiceMock: jasmine.SpyObj<PedidoService>;
  let productoServiceMock: jasmine.SpyObj<ProductoService>;
  let solicitudServiceMock: jasmine.SpyObj<SolicitudService>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;
  let activatedRouteMock: Partial<ActivatedRoute>;

  beforeEach(async () => {
    pedidoServiceMock = jasmine.createSpyObj('PedidoService', ['registrarPedido']);
    productoServiceMock = jasmine.createSpyObj('ProductoService', ['obtenerProductos']);
    solicitudServiceMock = jasmine.createSpyObj('SolicitudService', ['crearSolicitud']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    activatedRouteMock = {};

    await TestBed.configureTestingModule({
      imports: [RegistrarPedidoEntranteComponent, HttpClientModule, NoopAnimationsModule],
      providers: [
        { provide: PedidoService, useValue: pedidoServiceMock },
        { provide: ProductoService, useValue: productoServiceMock },
        { provide: SolicitudService, useValue: solicitudServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarPedidoEntranteComponent);
    component = fixture.componentInstance;

    // Mockea el servicio para recibir algunos productos
    productoServiceMock.obtenerProductos.and.returnValue(
      of([
        { id: 1, nombre: 'Producto 1', precio: 10 },
        { id: 2, nombre: 'Producto 2', precio: 15 },
      ])
    );

    component.cargarProductos();
  });

  describe('ngOnInit', () => {
    const pedidoMock = {
      Productos: [
        {
          id: 1,
          nombre: 'P1',
          precio: 100,
          stock: 10,
          umbral: 2,
          ProductoPedido: { cantidad: 5 },
        },
      ],
    };

    function setupPedidoMock() {
      activatedRouteMock.snapshot = {
        paramMap: {
          get: (key: string) => (key === 'pedidoId' ? '123' : null),
        },
      } as any;

      pedidoServiceMock.obtenerPedidoPorId = jasmine.createSpy().and.returnValue(of(pedidoMock));
    }

    it('debería llamar a cargarProductos y configurar evento online si es plataforma navegador', () => {
      spyOn(component, 'cargarProductos');
      spyOn(window, 'addEventListener');

      setupPedidoMock();

      component.ngOnInit();

      expect(component.cargarProductos).toHaveBeenCalled();
      expect(window.addEventListener).toHaveBeenCalledWith('online', jasmine.any(Function));
    });

    it('debería cargar un pedido existente si hay pedidoId en la ruta', () => {
      setupPedidoMock();

      component.ngOnInit();

      expect(component.actualizarPedido).toBeTrue();
      expect(component.textoBoton).toBe('Actualizar pedido');
      expect(component.productosPedido.length).toBe(1);
      expect(component.productosPedido[0].producto.nombre).toBe('P1');
      expect(component.productosPedido[0].cantidad).toBe(5);
    });
  });

  describe('Prueba de Éxito: Registrar Recepción de Pedido', () => {
    it('debería abrir el formulario de nuevo pedido y añadir productos', () => {
      expect(component.productos.length).toBeGreaterThan(0);

      const productoMock = { id: 1, nombre: 'Producto 1', precio: 10 };
      component.agregarProducto(productoMock);

      expect(component.productosPedido.length).toBe(1);
      expect(component.productosPedido[0]).toEqual({ producto: productoMock, cantidad: 1 });
    });
  });

  describe('Prueba de Error por Fallo de Conexión a Internet', () => {
    it('debería notificar la falta de conexión y no registrar el pedido', () => {
      // Simulamos que no hay conexión
      spyOnProperty(navigator, 'onLine').and.returnValue(false);
      component.registrarPedido(true);

      expect(pedidoServiceMock.registrarPedido).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.');
    });

    it('debería reintentar guardar el pedido una vez se restablece la conexión', () => {
      // Simulamos que no hay conexión
      const onlineSpy = spyOnProperty(navigator, 'onLine', 'get').and.returnValue(false);
      component.productosPedido.push({ producto: { id: 1 }, cantidad: 1 });

      component.registrarPedido(true);

      // Simulamos que se restablece la conexión
      onlineSpy.and.returnValue(true); // Reconfigura el espía
      pedidoServiceMock.registrarPedido.and.returnValue(of({ success: true }));

      component.registrarPedido(true); // Llama nuevamente para registrar el pedido

      expect(pedidoServiceMock.registrarPedido).toHaveBeenCalledWith({
        productos: [{ id: 1, cantidad: 1 }],
        tipo: 'entrante',
      });
    });
  });

  describe('Prueba de Error por Fallo en la Base de Datos', () => {
    it('debería mostrar un mensaje de error si falla al guardar el pedido en la base de datos', () => {
      pedidoServiceMock.registrarPedido.and.returnValue(
        throwError({ error: { mensaje: 'Error en la base de datos' } })
      );

      // Espiar la consola para comprobar errores
      const consoleErrorSpy = spyOn(console, 'error').and.callThrough();

      component.agregarProducto({ id: 1, nombre: 'Producto 1', precio: 10 });
      component.registrarPedido(true);

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
      pedidoServiceMock.registrarPedido.and.returnValue(
        throwError({ error: { mensaje: 'Error en la base de datos' } })
      );
      component.agregarProducto({ id: 1, nombre: 'Producto 1', precio: 10 });
      component.registrarPedido(true);

      pedidoServiceMock.registrarPedido.and.returnValue(of({ success: true }));
      component.registrarPedido(true);

      expect(component.productosPedido.length).toBe(0);
      expect(pedidoServiceMock.registrarPedido).toHaveBeenCalledWith({
        productos: [{ id: 1, cantidad: 1 }],
        tipo: 'entrante',
      });
    });
  });

  describe('Pruebas de eliminación de productos del pedido', () => {
    describe('Prueba de Éxito: Eliminar Producto de Pedido en Recepción', () => {
      it('debería eliminar un producto del pedido y actualizar el listado de productos', () => {
        const productoMock = { id: 1, nombre: 'Producto 1', precio: 10 };
        component.productosPedido.push({ producto: productoMock, cantidad: 1 });

        component.quitarProducto({ producto: productoMock, cantidad: 1 });

        expect(component.productosPedido.length).toBe(0); // Debería estar vacío después de la eliminación
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

    describe('Prueba de Error por Exceder Stock Disponible de un Producto', () => {
      it('debería mostrar un mensaje de error y ajustar la cantidad al máximo disponible si se introduce una cantidad mayor al stock', () => {
        const productoMock = { id: 1, nombre: 'Producto 1', precio: 10, stock: 5 };
        component.productos.push(productoMock);

        component.agregarProducto(productoMock);
        component.productosPedido[0].cantidad = 6; // Intento de agregar más que el stock

        // Simulando el comportamiento dentro de actualizarProducto
        spyOn(window, 'alert');

        component.actualizarProducto(component.productosPedido[0]);

        expect(window.alert).toHaveBeenCalledWith('La cantidad solicitada supera el stock disponible.');
        expect(component.productosPedido[0].cantidad).toBe(5); // La cantidad se ajusta al máximo disponible
        expect(component.calcularTotalPedido()).toBe(50); // Total ajustado
      });
    });
  });

  describe('verificarStockBajo', () => {
    it('debería devolver productos cuyo stock es igual o menor al umbral + cantidad', () => {
      const productos = [
        { producto: { id: 1, nombre: 'P1', stock: 5, umbral: 3 }, cantidad: 2 }, // 5 <= 3+2
        { producto: { id: 2, nombre: 'P2', stock: 10, umbral: 5 }, cantidad: 2 }, // 10 > 5+2
      ];

      const resultado = component.verificarStockBajo(productos);

      expect(resultado.length).toBe(1);
      expect(resultado[0].producto.nombre).toBe('P1');
    });
  });

  describe('mostrarAlertaStockBajo', () => {
    beforeEach(() => {
      spyOn(window, 'alert');
      spyOn(component, 'crearSolicitud').and.stub();
      spyOn(component, 'registrarPedido').and.stub();
    });

    it('debería confirmar y crear una solicitud con cantidad predeterminada si se acepta y no se introduce valor', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'prompt').and.returnValue('');

      const productos = [{ producto: { id: 1, nombre: 'P1' }, cantidad: 2 }];

      component.mostrarAlertaStockBajo(productos);

      expect(component.crearSolicitud).toHaveBeenCalledWith([{ id: 1, cantidad: 10 }]);
      expect(component.registrarPedido).toHaveBeenCalledWith(true);
    });

    it('debería crear solicitud con cantidad introducida si es válida', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'prompt').and.returnValue('5');

      const productos = [{ producto: { id: 1, nombre: 'P1' }, cantidad: 2 }];

      component.mostrarAlertaStockBajo(productos);

      expect(component.crearSolicitud).toHaveBeenCalledWith([{ id: 1, cantidad: 5 }]);
    });

    it('debería mostrar alerta si la cantidad introducida es inválida', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'prompt').and.returnValue('abc');

      const productos = [{ producto: { id: 1, nombre: 'P1' }, cantidad: 2 }];

      component.mostrarAlertaStockBajo(productos);

      expect(window.alert).toHaveBeenCalledWith('Cantidad inválida. No se realizará el pedido.');
      expect(component.crearSolicitud).toHaveBeenCalledWith([]);
    });

    it('no debería hacer nada si el usuario cancela la confirmación', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.mostrarAlertaStockBajo([{ producto: { id: 1, nombre: 'P1' }, cantidad: 1 }]);

      expect(component.crearSolicitud).not.toHaveBeenCalled();
      expect(component.registrarPedido).toHaveBeenCalledWith(true);
    });
  });

  describe('crearSolicitud', () => {
    it('debería llamar al servicio y mostrar snackBar en éxito', () => {
      const solicitudMock = [{ id: 1, cantidad: 10 }];
      const solicitudFake: Solicitud = {
        id: 1,
        fecha: '2025-06-02',
        Productos: [],
      };

      solicitudServiceMock.crearSolicitud.and.returnValue(of(solicitudFake));

      spyOn(component, 'registrarPedido');

      component.crearSolicitud(solicitudMock);

      expect(solicitudServiceMock.crearSolicitud).toHaveBeenCalledWith(solicitudMock);
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Solicitud de reposición enviada correctamente',
        '',
        jasmine.any(Object)
      );
      expect(component.registrarPedido).toHaveBeenCalledWith(true);
    });

    it('debería mostrar error en snackbar si falla la solicitud', () => {
      solicitudServiceMock.crearSolicitud.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      component.crearSolicitud([{ id: 1, cantidad: 10 }]);

      expect(console.error).toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith('Error al solicitar reposición', '', jasmine.any(Object));
    });
  });

  describe('checkAndRetryOrder', () => {
    it('debería intentar registrar pedido pendiente si hay conexión', () => {
      spyOnProperty(navigator, 'onLine', 'get').and.returnValue(true);
      const pedido = [{ id: 1, cantidad: 2 }];
      component.pedidoPendiente = [...pedido]; // copia

      pedidoServiceMock.registrarPedido.and.returnValue(of({}));

      component.checkAndRetryOrder();

      expect(pedidoServiceMock.registrarPedido).toHaveBeenCalledWith(pedido);
      expect(component.pedidoPendiente.length).toBe(0);
    });

    it('debería mostrar error si el reintento falla', () => {
      spyOnProperty(navigator, 'onLine', 'get').and.returnValue(true);
      component.pedidoPendiente = [{ id: 1, cantidad: 2 }];
      pedidoServiceMock.registrarPedido.and.returnValue(throwError({ error: { mensaje: 'Sin stock disponible' } }));

      component.checkAndRetryOrder();

      expect(component.errorMessage).toBe('Sin stock disponible');
    });
  });

  describe('eliminarTodosLosProductos', () => {
    it('debería eliminar todos los productos si el usuario confirma', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.productosPedido = [
        { producto: { id: 1 }, cantidad: 2 },
        { producto: { id: 2 }, cantidad: 1 },
      ];

      component.eliminarTodosLosProductos();

      expect(component.productosPedido.length).toBe(0);
    });

    it('no debería eliminar productos si el usuario cancela', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.productosPedido = [{ producto: { id: 1 }, cantidad: 1 }];

      component.eliminarTodosLosProductos();

      expect(component.productosPedido.length).toBe(1);
    });
  });
});
