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
    productoServiceMock = jasmine.createSpyObj('ProductoService', ['obtenerProductos']);

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
      expect(noProductsMessage.textContent).toContain('No hay productos registrados actualmente.');
    });
  });

  describe('Fallo en la base de datos', () => {
    it('Debería mostrar un mensaje de error en la consola', () => {
      spyOn(console, 'error');
      productoServiceMock.obtenerProductos.and.returnValue(throwError({ status: 500 }));
      component.ngOnInit();

      expect(component.errorMessage).toBe('Error al obtener productos');
    });
  });

  describe('Pérdida de conexión a internet', () => {
    it('debería mostrar un mensaje de error de conexión', () => {
      spyOn(console, 'error');
      productoServiceMock.obtenerProductos.and.returnValue(throwError({ status: 0 }));
      component.ngOnInit();

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
});