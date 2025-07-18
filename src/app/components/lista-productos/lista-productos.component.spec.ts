import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaProductosComponent } from './lista-productos.component';
import { ProductoService } from '../../services/producto.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { SolicitudService } from '../../services/solicitud.service';

describe('ListaProductosComponent', () => {
  let component: ListaProductosComponent;
  let fixture: ComponentFixture<ListaProductosComponent>;
  let productoServiceMock: jasmine.SpyObj<ProductoService>;
  let solicitudServiceMock: jasmine.SpyObj<SolicitudService>;

  beforeEach(async () => {
    productoServiceMock = jasmine.createSpyObj('ProductoService', [
      'obtenerProductos',
      'eliminarProducto',
      'actualizarProducto',
    ]);

    solicitudServiceMock = jasmine.createSpyObj('SolicitudService', ['crearSolicitud']);

    TestBed.configureTestingModule({
      imports: [ListaProductosComponent, ReactiveFormsModule, HttpClientModule],
      providers: [
        { provide: ProductoService, useValue: productoServiceMock },
        { provide: SolicitudService, useValue: solicitudServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaProductosComponent);
    component = fixture.componentInstance;
  });

  describe('Prueba de éxito', () => {
    it('Debería mostrar todos los productos registrados', () => {
      const productosMock = [
        {
          nombre: 'Producto 1',
          descripcion: 'Descripción 1',
          precio: 10,
          stock: 5,
        },
        {
          nombre: 'Producto 2',
          descripcion: 'Descripción 2',
          precio: 20,
          stock: 10,
        },
      ];

      productoServiceMock.obtenerProductos.and.returnValue(of(productosMock));
      fixture.detectChanges();

      expect(component.productos.length).toBe(2);
      expect(component.productos).toEqual(productosMock);
    });
  });

  describe('Prueba de lista vacía', () => {
    it('Debería mostrar un mensaje de que no hay productos registrados', () => {
      productoServiceMock.obtenerProductos.and.returnValue(of([]));
      fixture.detectChanges();

      const errorMessage = fixture.nativeElement.querySelector('.error-message p');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toContain('No se encontraron productos.');
    });
  });

  describe('Fallo en la base de datos', () => {
    it('Debería mostrar un mensaje de error en la consola', () => {
      spyOn(console, 'error');
      productoServiceMock.obtenerProductos.and.returnValue(
        throwError({
          status: 500,
        })
      );
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Error al obtener productos');
    });
  });

  describe('Pérdida de conexión a internet', () => {
    it('debería mostrar un mensaje de error de conexión', () => {
      spyOn(console, 'error');
      productoServiceMock.obtenerProductos.and.returnValue(
        throwError({
          status: 0,
        })
      );
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.');
    });
  });

  describe('Ordenar por nombre', () => {
    it('Debería ordenar los productos por nombre en orden ascendente y descendente', () => {
      component.productos = [
        {
          nombre: 'Producto B',
          stock: 10,
        },
        {
          nombre: 'Producto A',
          stock: 5,
        },
      ];

      component.ordenarPorNombre();
      expect(component.productos[0].nombre).toBe('Producto A');

      component.ordenarPorNombre();
      expect(component.productos[0].nombre).toBe('Producto B');
    });
  });

  describe('Ordenar por stock', () => {
    it('Debería ordenar los productos por stock en orden ascendente y descendente', () => {
      component.productos = [
        {
          nombre: 'Producto A',
          stock: 10,
        },
        {
          nombre: 'Producto B',
          stock: 5,
        },
      ];

      component.ordenarPorStock();
      expect(component.productos[0].stock).toBe(5);

      component.ordenarPorStock();
      expect(component.productos[0].stock).toBe(10);
    });
  });

  describe('Mostrar productos por debajo del umbral', () => {
    const productosMock = [
      {
        id: 1,
        nombre: 'Producto A',
        stock: 5,
        umbral: 10,
      },
      {
        id: 2,
        nombre: 'Producto B',
        stock: 12,
        umbral: 10,
      },
      {
        id: 3,
        nombre: 'Producto C',
        stock: 8,
        umbral: 15,
      },
    ];

    beforeEach(async () => {
      productoServiceMock.obtenerProductos.and.returnValue(of(productosMock));
      fixture.detectChanges();
    });

    it('Debería mostrar productos con stock por debajo del umbral', () => {
      component.setStockFilter('low');
      const filtered = component.productosFiltrados;

      expect(filtered.length).toBe(2);
      expect(filtered).toEqual([
        {
          id: 1,
          nombre: 'Producto A',
          stock: 5,
          umbral: 10,
        },
        {
          id: 3,
          nombre: 'Producto C',
          stock: 8,
          umbral: 15,
        },
      ]);
    });

    it('debería mostrar un mensaje cuando no hay productos por debajo del umbral', () => {
      component.productos = [
        {
          id: 1,
          nombre: 'Producto A',
          stock: 20,
          umbral: 10,
        },
        {
          id: 2,
          nombre: 'Producto B',
          stock: 30,
          umbral: 20,
        },
      ];
      component.setStockFilter('low');

      // Detectar cambios para reflejar las modificaciones en la plantilla
      fixture.detectChanges();

      // Obtener el elemento HTML que contiene el mensaje
      const messageElement = fixture.nativeElement.querySelector('.error-message');

      // Validar que el mensaje se muestra
      expect(messageElement).not.toBeNull();
      expect(messageElement.textContent.trim()).toBe('No se encontraron productos.');
    });
  });

  describe('Mostrar productos cercanos al umbral', () => {
    const productosMock = [
      {
        id: 1,
        nombre: 'Producto A',
        stock: 50,
        umbral: 45,
      },
      {
        id: 2,
        nombre: 'Producto B',
        stock: 15,
        umbral: 10,
      },
      {
        id: 3,
        nombre: 'Producto C',
        stock: 16,
        umbral: 15,
      },
    ];

    beforeEach(async () => {
      productoServiceMock.obtenerProductos.and.returnValue(of(productosMock));
      fixture.detectChanges();
    });

    it('Debería mostrar productos con stock cercano al umbral', () => {
      component.setStockFilter('near-threshold');
      const filtered = component.productosFiltrados;

      expect(filtered.length).toBe(2);
      expect(filtered).toEqual([
        {
          id: 1,
          nombre: 'Producto A',
          stock: 50,
          umbral: 45,
        },
        {
          id: 3,
          nombre: 'Producto C',
          stock: 16,
          umbral: 15,
        },
      ]);
    });

    it('debería mostrar un mensaje cuando no hay productos cercanos al umbral', () => {
      component.productos = [
        {
          id: 1,
          nombre: 'Producto A',
          stock: 20,
          umbral: 10,
        },
        {
          id: 2,
          nombre: 'Producto B',
          stock: 30,
          umbral: 20,
        },
      ];
      component.setStockFilter('near-threshold');

      // Detectar cambios para reflejar las modificaciones en la plantilla
      fixture.detectChanges();

      // Obtener el elemento HTML que contiene el mensaje
      const messageElement = fixture.nativeElement.querySelector('.error-message');

      // Validar que el mensaje se muestra
      expect(messageElement).not.toBeNull();
      expect(messageElement.textContent.trim()).toBe('No se encontraron productos.');
    });
  });

  describe('Eliminar producto', () => {
    const productId = 1;

    it('Debería eliminar el producto seleccionado', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      productoServiceMock.eliminarProducto.and.returnValue(of({}));
      component.eliminarProducto(productId);

      expect(productoServiceMock.eliminarProducto).toHaveBeenCalledWith(productId);
    });

    it('No elimina el producto si el usuario cancela la acción', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.eliminarProducto(productId);

      expect(productoServiceMock.eliminarProducto).not.toHaveBeenCalled();
    });

    it('Debería mostrar un fallo en la base de datos', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      productoServiceMock.eliminarProducto.and.returnValue(throwError('Database error'));
      spyOn(console, 'error');
      component.eliminarProducto(productId);

      expect(productoServiceMock.eliminarProducto).toHaveBeenCalledWith(productId);
      expect(console.error).toHaveBeenCalledWith('Error al eliminar producto', 'Database error');
    });

    it('Debería mostrar un fallo por pérdida de conexión a internet', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      productoServiceMock.eliminarProducto.and.returnValue(throwError('No internet connection'));
      spyOn(console, 'error');
      component.eliminarProducto(productId);

      expect(productoServiceMock.eliminarProducto).toHaveBeenCalledWith(productId);
      expect(console.error).toHaveBeenCalledWith('Error al eliminar producto', 'No internet connection');
    });
  });

  describe('Modificar producto registrado', () => {
    it('debería guardar los cambios correctamente al modificar un producto', () => {
      const productoOriginal = {
        id: 1,
        nombre: 'Producto A',
        descripcion: 'Desc A',
        precio: 100,
        stock: 10,
      };
      const productoModificado = {
        ...productoOriginal,
        nombre: 'Producto A Modificado',
        descripcion: 'Desc A Modificada',
        precio: 120,
        stock: 15,
      };

      productoServiceMock.actualizarProducto.and.returnValue(of(productoModificado));
      spyOn(component, 'cerrarModal');

      component.abrirModal(productoOriginal);

      // Simular cambios en el formulario
      component.productoForm.patchValue({
        nombre: 'Producto A Modificado',
        descripcion: 'Desc A Modificada',
        precio: 120,
        stock: 15,
      });
    });

    it('debería mantener los campos sin cambios si no se modifican', () => {
      const productoOriginal = {
        id: 1,
        nombre: 'Producto B',
        descripcion: 'Desc B',
        precio: 200,
        stock: 5,
      };

      productoServiceMock.actualizarProducto.and.returnValue(of(productoOriginal));

      component.abrirModal(productoOriginal);

      // No se cambia el campo 'descripcion' y 'precio'
      component.productoForm.patchValue({
        stock: 10,
      });
    });

    it('debería mostrar un mensaje de error si los datos ingresados no son válidos', () => {
      const productoOriginal = {
        id: 1,
        nombre: 'Producto C',
        descripcion: 'Desc C',
        precio: 300,
        stock: 20,
      };

      productoServiceMock.actualizarProducto.and.returnValue(of(productoOriginal));
      spyOn(console, 'log');

      component.abrirModal(productoOriginal);

      // Simular datos no válidos
      component.productoForm.patchValue({
        precio: -50,
      });

      component.guardarProducto();

      expect(productoServiceMock.actualizarProducto).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Formulario no válido o producto no seleccionado');
    });

    it('debería descartar las modificaciones si se cancelan los cambios', () => {
      const productoOriginal = {
        id: 1,
        nombre: 'Producto D',
        descripcion: 'Desc D',
        precio: 400,
        stock: 25,
      };

      component.abrirModal(productoOriginal);

      // Simular cambios en el formulario
      component.productoForm.patchValue({
        nombre: 'Producto D Modificado',
        descripcion: 'Desc D Modificada',
      });

      // Cancelar los cambios
      component.cerrarModal();

      expect(component.productoSeleccionado).toBeNull(); // Asegura que el modal se cierra sin guardar
    });
  });

  describe('Buscar productos por nombre', () => {
    let productosMock: any[];

    beforeEach(() => {
      productosMock = [
        {
          id: 1,
          nombre: 'Gafas de Sol',
          descripcion: 'Descripción 1',
          precio: 10,
          stock: 5,
        },
        {
          id: 2,
          nombre: 'Gafas de Lectura',
          descripcion: 'Descripción 2',
          precio: 20,
          stock: 10,
        },
        {
          id: 3,
          nombre: 'Lentes de Contacto',
          descripcion: 'Lentes de contacto',
          precio: 40,
          stock: 5,
        },
      ];

      productoServiceMock.obtenerProductos.and.returnValue(of(productosMock));
      fixture.detectChanges();
    });

    it('Debería mostrar todos los productos al iniciar', () => {
      expect(component.productos.length).toBe(3);
      expect(component.productos).toEqual(productosMock);
    });

    it('debería mostrar productos que coinciden con el nombre buscado', () => {
      component.busqueda = 'Gafas';
      component.filtrarProductos();
      expect(component.productosFiltrados.length).toBe(2);
    });

    it('debería mostrar mensaje de búsqueda sin resultados', () => {
      component.busqueda = 'No Existe';
      component.filtrarProductos();
      expect(component.productosFiltrados.length).toBe(0);
      expect(component.errorMessage).toBe('No se encontraron productos.');
    });

    it('debería mostrar productos con búsqueda parcial', () => {
      component.busqueda = 'Sol';
      component.filtrarProductos();
      expect(component.productosFiltrados.length).toBe(1);
      expect(component.productos[0].nombre).toContain('Sol');
    });

    it('debería mostrar productos con búsqueda múltiple', () => {
      component.busqueda = 'Gafas Sol';
      component.filtrarProductos();
      expect(component.productosFiltrados.length).toBe(1);
      expect(component.productos[0].nombre).toContain('Gafas');
    });
  });

  describe('realizarPedido', () => {
    const productosMock = [{ id: 123, cantidad: 2, nombre: 'Gafas modelo A' }];

    it('debería realizar el pedido correctamente y mostrar mensaje en consola', () => {
      solicitudServiceMock.crearSolicitud.and.returnValue(
        of({
          id: 1,
          fecha: '2025-01-01',
          Productos: [], // o un array con productos mockeados si hace falta
        })
      );
      const consoleSpy = spyOn(console, 'log');

      component.realizarPedido(productosMock);

      expect(solicitudServiceMock.crearSolicitud).toHaveBeenCalledWith(productosMock);
      expect(consoleSpy).toHaveBeenCalledWith('Pedido realizado con éxito para el producto ID: 123, Cantidad: 2');
    });

    it('debería mostrar un error en consola si falla la creación del pedido', () => {
      const error = { status: 500, message: 'Internal Server Error' };
      solicitudServiceMock.crearSolicitud.and.returnValue(throwError(() => error));
      const consoleErrorSpy = spyOn(console, 'error');

      component.realizarPedido(productosMock);

      expect(solicitudServiceMock.crearSolicitud).toHaveBeenCalledWith(productosMock);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al realizar el pedido', error);
    });
  });

  describe('guardarProducto', () => {
    beforeEach(() => {
      component.productoSeleccionado = {
        id: 1,
        nombre: 'Gafas de sol',
        descripcion: 'Descripción',
        precio: 100,
        stock: 4,
        umbral: 5,
      };

      component.productoForm = new FormBuilder().group({
        nombre: ['Gafas de sol'],
        descripcion: ['Descripción'],
        precio: [100],
        stock: [4],
        umbral: [5],
      });

      spyOn(component, 'cerrarModal');
      spyOn(component, 'obtenerProductos');
    });

    it('debería actualizar el producto sin realizar pedido si el stock no está por debajo del umbral', () => {
      component.productoSeleccionado.stock = 10;
      component.productoSeleccionado.umbral = 5;
      component.productoForm.patchValue({ stock: 10, umbral: 5 });

      productoServiceMock.actualizarProducto.and.returnValue(of({}));

      component.guardarProducto();

      expect(productoServiceMock.actualizarProducto).toHaveBeenCalledWith(
        1,
        jasmine.objectContaining({ nombre: 'Gafas de sol', stock: 10 })
      );
      expect(component.cerrarModal).toHaveBeenCalled();
      expect(component.obtenerProductos).toHaveBeenCalled();
    });

    it('debería realizar un pedido si el stock está por debajo del umbral y se confirman ambos diálogos', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'prompt').and.returnValue('15');
      spyOn(component, 'realizarPedido');

      productoServiceMock.actualizarProducto.and.returnValue(of({}));

      component.guardarProducto();

      expect(window.confirm).toHaveBeenCalled();
      expect(window.prompt).toHaveBeenCalled();
      expect(component.realizarPedido).toHaveBeenCalledWith([{ id: 1, cantidad: 15 }]);
    });

    it('debería usar el valor predeterminado si no se introduce cantidad', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'prompt').and.returnValue('');
      spyOn(component, 'realizarPedido');

      productoServiceMock.actualizarProducto.and.returnValue(of({}));

      component.guardarProducto();

      expect(component.realizarPedido).toHaveBeenCalledWith([{ id: 1, cantidad: 10 }]);
    });

    it('no debería realizar el pedido si se introduce una cantidad inválida', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'prompt').and.returnValue('abc');
      spyOn(component, 'realizarPedido');
      spyOn(window, 'alert');

      productoServiceMock.actualizarProducto.and.returnValue(of({}));

      component.guardarProducto();

      expect(component.realizarPedido).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Cantidad inválida. No se realizará el pedido.');
    });

    it('no debería actualizar si no hay producto seleccionado', () => {
      component.productoSeleccionado = null;
      spyOn(console, 'log');

      component.guardarProducto();

      expect(console.log).toHaveBeenCalledWith('Formulario no válido o producto no seleccionado');
      expect(productoServiceMock.actualizarProducto).not.toHaveBeenCalled();
    });

    it('debería manejar error en la actualización del producto', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(console, 'error');

      productoServiceMock.actualizarProducto.and.returnValue(throwError(() => new Error('Error de red')));

      component.guardarProducto();

      expect(console.error).toHaveBeenCalledWith('Error al actualizar producto', jasmine.any(Error));
    });
  });
});
