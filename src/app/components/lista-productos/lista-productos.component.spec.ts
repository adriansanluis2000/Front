import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaProductosComponent } from './lista-productos.component';
import { ProductoService } from '../../services/producto.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';


describe('ListaProductosComponent', () => {
  let component: ListaProductosComponent;
  let fixture: ComponentFixture<ListaProductosComponent>;
  let productoServiceMock: jasmine.SpyObj<ProductoService>;

  beforeEach(async () => {
    productoServiceMock = jasmine.createSpyObj('ProductoService', ['obtenerProductos', 'eliminarProducto', 'actualizarProducto']);

    TestBed.configureTestingModule({
      imports: [
        ListaProductosComponent,
        ReactiveFormsModule
      ],
      providers: [{ provide: ProductoService, useValue: productoServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaProductosComponent);
    component = fixture.componentInstance;
  });

  describe('Prueba de éxito', () => {
    it('Debería mostrar todos los productos registrados', () => {
      const productosMock = [
        { nombre: 'Producto 1', descripcion: 'Descripción 1', precio: 10, stock: 5 },
        { nombre: 'Producto 2', descripcion: 'Descripción 2', precio: 20, stock: 10 }
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

      const noProductsMessage = fixture.nativeElement.querySelector('.no-products-message');
      expect(noProductsMessage).toBeTruthy();
      expect(noProductsMessage.textContent).toContain('No se encontraron productos.');
    });
  });

  describe('Fallo en la base de datos', () => {
    it('Debería mostrar un mensaje de error en la consola', () => {
      spyOn(console, 'error');
      productoServiceMock.obtenerProductos.and.returnValue(throwError({ status: 500 }));
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Error al obtener productos');
    });
  });

  describe('Pérdida de conexión a internet', () => {
    it('debería mostrar un mensaje de error de conexión', () => {
      spyOn(console, 'error');
      productoServiceMock.obtenerProductos.and.returnValue(throwError({ status: 0 }));
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.');
    });
  });

  describe('Ordenar por nombre', () => {
    it('Debería ordenar los productos por nombre en orden ascendente y descendente', () => {
      component.productos = [
        { nombre: 'Producto B', stock: 10 },
        { nombre: 'Producto A', stock: 5 }
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
        { nombre: 'Producto A', stock: 10 },
        { nombre: 'Producto B', stock: 5 }
      ];

      component.ordenarPorStock();
      expect(component.productos[0].stock).toBe(5);

      component.ordenarPorStock();
      expect(component.productos[0].stock).toBe(10);
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
    })

    it('Debería mostrar un fallo en la base de datos', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      productoServiceMock.eliminarProducto.and.returnValue(throwError('Database error'));
      spyOn(console, 'error');
      component.eliminarProducto(productId);

      expect(productoServiceMock.eliminarProducto).toHaveBeenCalledWith(productId);
      expect(console.error).toHaveBeenCalledWith('Error al eliminar producto', 'Database error');
    })

    it('Debería mostrar un fallo por pérdida de conexión a internet', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      productoServiceMock.eliminarProducto.and.returnValue(throwError('No internet connection'));
      spyOn(console, 'error');
      component.eliminarProducto(productId);

      expect(productoServiceMock.eliminarProducto).toHaveBeenCalledWith(productId);
      expect(console.error).toHaveBeenCalledWith('Error al eliminar producto', 'No internet connection');
    })
  });

  describe('Modificar producto registrado', () => {
    let obtenerProductosSpy: jasmine.Spy;

    beforeEach(() => {
      obtenerProductosSpy = spyOn(component, 'obtenerProductos').and.callFake(() => {
        console.log('Productos obtenidos correctamente');
      });
    });
    it('debería guardar los cambios correctamente al modificar un producto', () => {
      const productoOriginal = { id: 1, nombre: 'Producto A', descripcion: 'Desc A', precio: 100, stock: 10 };
      const productoModificado = { id: 1, nombre: 'Producto A Modificado', descripcion: 'Desc A Modificada', precio: 120, stock: 15 };

      productoServiceMock.actualizarProducto.and.returnValue(of(productoModificado));
      spyOn(component, 'cerrarModal');

      component.abrirModal(productoOriginal);

      // Simular cambios en el formulario
      component.productoForm.patchValue({
        nombre: 'Producto A Modificado',
        descripcion: 'Desc A Modificada',
        precio: 120,
        stock: 15
      });

      component.guardarProducto();

      expect(productoServiceMock.actualizarProducto).toHaveBeenCalledWith(productoOriginal.id, productoModificado);
      expect(component.cerrarModal).toHaveBeenCalled();
      expect(obtenerProductosSpy).toHaveBeenCalled();
    });

    it('debería mantener los campos sin cambios si no se modifican', () => {
      const productoOriginal = { id: 1, nombre: 'Producto B', descripcion: 'Desc B', precio: 200, stock: 5 };

      productoServiceMock.actualizarProducto.and.returnValue(of(productoOriginal));

      component.abrirModal(productoOriginal);

      // No se cambia el campo 'descripcion' y 'precio'
      component.productoForm.patchValue({
        stock: 10
      });

      component.guardarProducto();

      expect(productoServiceMock.actualizarProducto).toHaveBeenCalledWith(productoOriginal.id, {
        ...productoOriginal,
        stock: 10
      });
      expect(obtenerProductosSpy).toHaveBeenCalled();
    });

    it('debería mostrar un mensaje de error si los datos ingresados no son válidos', () => {
      const productoOriginal = { id: 1, nombre: 'Producto C', descripcion: 'Desc C', precio: 300, stock: 20 };

      productoServiceMock.actualizarProducto.and.returnValue(of(productoOriginal));
      spyOn(console, 'log');

      component.abrirModal(productoOriginal);

      // Simular datos no válidos
      component.productoForm.patchValue({
        precio: -50
      });

      component.guardarProducto();

      expect(productoServiceMock.actualizarProducto).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Formulario no válido o producto no seleccionado');
    });

    it('debería descartar las modificaciones si se cancelan los cambios', () => {
      const productoOriginal = { id: 1, nombre: 'Producto D', descripcion: 'Desc D', precio: 400, stock: 25 };

      component.abrirModal(productoOriginal);

      // Simular cambios en el formulario
      component.productoForm.patchValue({
        nombre: 'Producto D Modificado',
        descripcion: 'Desc D Modificada'
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
        { id: 1, nombre: 'Gafas de Sol', descripcion: 'Descripción 1', precio: 10, stock: 5 },
        { id: 2, nombre: 'Gafas de Lectura', descripcion: 'Descripción 2', precio: 20, stock: 10 },
        { id: 3, nombre: 'Lentes de Contacto', descripcion: 'Lentes de contacto', precio: 40, stock: 5 },
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
      expect(component.productos.length).toBe(2);
    });

    it('debería mostrar mensaje de búsqueda sin resultados', () => {
      component.busqueda = 'No Existe';
      component.filtrarProductos();
      expect(component.productos.length).toBe(0);
      expect(component.errorMessage).toBe('No se encontraron productos.');
    });

    it('debería mostrar productos con búsqueda parcial', () => {
      component.busqueda = 'Sol';
      component.filtrarProductos();
      expect(component.productos.length).toBe(1);
      expect(component.productos[0].nombre).toContain('Sol');
    });

    it('debería mostrar productos con búsqueda múltiple', () => {
      component.busqueda = 'Gafas Sol';
      component.filtrarProductos();
      expect(component.productos.length).toBe(1);
      expect(component.productos[0].nombre).toContain('Gafas');
    });
  });
});