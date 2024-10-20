import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { AgregarProductoComponent } from './agregar-producto.component';
import { ProductoService } from '../../services/producto.service';
import { of, throwError } from 'rxjs';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';


describe('AgregarProductoComponent', () => {
  let component: AgregarProductoComponent;
  let fixture: ComponentFixture<AgregarProductoComponent>;
  let productoServiceMock: jasmine.SpyObj<ProductoService>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    productoServiceMock = jasmine.createSpyObj('ProductoService', ['crearProducto']);

    TestBed.configureTestingModule({
      providers: [{ provide: ProductoService, useValue: productoServiceMock }],
      imports: [AgregarProductoComponent,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientTestingModule
      ]
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AgregarProductoComponent);
    component = fixture.componentInstance;
  });

  describe('Prueba de éxito', () => {
    it('Debería añadir un producto con éxito', () => {
      component.producto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción Test',
        precio: 100,
        stock: 10
      };

      productoServiceMock.crearProducto.and.returnValue(of({ success: true }));

      const form: NgForm = {
        valid: true,
        value: component.producto,
        controls: {},
        resetForm: () => { }
      } as unknown as NgForm;

      spyOn(component, 'resetForm');
      component.agregarProducto(form);

      expect(productoServiceMock.crearProducto).toHaveBeenCalledWith(component.producto);
      expect(component.resetForm).toHaveBeenCalled();
    });
  });

  describe('Prueba de error por campo vacío', () => {
    it('Debería resaltar los campos vacíos y mostrar mensaje de error', () => {
      const form: NgForm = {
        valid: false,
        controls: {
          nombre: jasmine.createSpyObj('Control', ['markAsTouched']),
          precio: jasmine.createSpyObj('Control', ['markAsTouched']),
          stock: jasmine.createSpyObj('Control', ['markAsTouched']),
        },
        resetForm: () => { }
      } as unknown as NgForm;

      component.agregarProducto(form);

      expect(form.controls['nombre'].markAsTouched).toHaveBeenCalled();
      expect(form.controls['precio'].markAsTouched).toHaveBeenCalled();
      expect(form.controls['stock'].markAsTouched).toHaveBeenCalled();
    });
  });

  describe('Prueba de error por duplicidad', () => {
    it('Debería mostrar un mensaje de error por producto duplicado', () => {
      component.producto = {
        nombre: 'Producto Duplicado',
        descripcion: 'Descripción Duplicado',
        precio: 100,
        stock: 10
      };

      productoServiceMock.crearProducto.and.returnValue(throwError({ status: 409 }));

      const form: NgForm = {
        valid: true,
        value: component.producto,
        controls: {},
        resetForm: () => { }
      } as unknown as NgForm;

      component.agregarProducto(form);
      expect(component.errorMessage).toBe('Error al agregar el producto, inténtalo de nuevo.');
    });
  });

  describe('Prueba de precio negativo', () => {
    it('Debería mostrar un mensaje de error por precio negativo', () => {
      component.producto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción Test',
        precio: -50,
        stock: 10
      };

      const form: NgForm = {
        valid: false,
        controls: {},
        resetForm: () => { }
      } as unknown as NgForm;

      component.agregarProducto(form);
      expect(component.errorMessage).toBe('El precio debe ser mayor que 0.');
    });
  });

  describe('Prueba de cantidad negativa o 0', () => {
    it('Debería mostrar un mensaje de error por stock no positivo', () => {
      component.producto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción Test',
        precio: 100,
        stock: 0,
      };

      const form: NgForm = {
        valid: false,
        controls: {},
        resetForm: () => { }
      } as unknown as NgForm;

      component.agregarProducto(form);
      expect(component.errorMessage).toBe('La cantidad mínima es 1.');
    });
  });

  describe('Fallo en la base de datos', () => {
    it('Debería mostrar un mensaje de error en caso de fallo de base de datos', () => {
      component.producto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción Test',
        precio: 100,
        stock: 10
      };

      productoServiceMock.crearProducto.and.returnValue(throwError({ status: 500 }));

      const form: NgForm = {
        valid: true,
        value: component.producto,
        controls: {},
        resetForm: () => { }
      } as unknown as NgForm;

      component.agregarProducto(form);
      expect(component.errorMessage).toBe('Error al agregar el producto, inténtalo de nuevo.');
    });
  });

  describe('Pérdida de conexión a internet', () => {
    it('Debería mostrar un mensaje de error en caso de pérdida de conexión a internet', () => {
      // Producto de ejemplo que se intenta agregar
      component.producto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción Test',
        precio: 100,
        stock: 10
      };

      // Mock del servicio que simula una pérdida de conexión (status: 0)
      productoServiceMock.crearProducto.and.returnValue(throwError({ status: 0 }));

      // Mock del formulario (NgForm) con el valor del producto
      const form: NgForm = {
        valid: true,
        value: component.producto,
        controls: {},
        resetForm: () => { }
      } as unknown as NgForm;

      // Llamar al método que intenta agregar el producto
      component.agregarProducto(form);

      // Verificar que se muestre el mensaje adecuado para un fallo de red
      expect(component.errorMessage).toBe('Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.');
    });
  });
});
