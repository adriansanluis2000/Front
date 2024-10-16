import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { AgregarProductoComponent } from './agregar-producto.component';
import { ProductoService } from '../../services/producto.service';
import { of, throwError } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

describe('AgregarProductoComponent', () => {
  let component: AgregarProductoComponent;
  let fixture: ComponentFixture<AgregarProductoComponent>;
  let productoServiceMock: jasmine.SpyObj<ProductoService>;

  beforeEach(() => {
    productoServiceMock = jasmine.createSpyObj('ProductoService', ['crearProducto']);

    TestBed.configureTestingModule({
      providers: [{ provide: ProductoService, useValue: productoServiceMock }],
      imports: [AgregarProductoComponent,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule]
    }).compileComponents();

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

  describe('Prueba de cantidad negativa', () => {
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
});
