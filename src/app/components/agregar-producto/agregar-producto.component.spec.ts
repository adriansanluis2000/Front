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
    productoServiceMock = jasmine.createSpyObj('ProductoService', ['crearProducto', 'verificarNombreProducto']);

    TestBed.configureTestingModule({
      providers: [{ provide: ProductoService, useValue: productoServiceMock }],
      imports: [
        AgregarProductoComponent,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule
      ]
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
        stock: 10,
        umbral: 10
      };

      productoServiceMock.verificarNombreProducto.and.returnValue(of(false));
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

  describe('Prueba de error por campos requeridos', () => {
    it('Debería resaltar los campos vacíos y mostrar mensajes de error', () => {
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
    it('Debería mostrar un mensaje de error si el nombre del producto ya existe', () => {
      component.producto = {
        nombre: 'Producto Duplicado',
        descripcion: 'Descripción Duplicado',
        precio: 100,
        stock: 10,
        umbral: 10
      };

      productoServiceMock.verificarNombreProducto.and.returnValue(of(true));

      const form: NgForm = {
        valid: true,
        value: component.producto,
        controls: {},
        resetForm: () => { }
      } as unknown as NgForm;

      component.agregarProducto(form);
      expect(component.errorMessage).toBe('El nombre del producto ya existe. Por favor, elige otro nombre.');
    });

    it('Debería agregar el producto correctamente con un nombre único', () => {
      component.producto = {
        nombre: 'Producto Único',
        descripcion: 'Descripción Única',
        precio: 100,
        stock: 10,
        umbral: 10
      };

      productoServiceMock.verificarNombreProducto.and.returnValue(of(false));
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
      expect(component.errorMessage).toBe(''); // Asegurarse de que no hay mensajes de error
    });

  });

  describe('Prueba de precio negativo o 0', () => {
    it('Debería mostrar un mensaje de error si el precio es menor o igual a 0', () => {
      component.producto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción Test',
        precio: -50,
        stock: 10,
        umbral: 10
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
    it('Debería mostrar un mensaje de error si la cantidad es menor o igual a 0', () => {
      component.producto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción Test',
        precio: 100,
        stock: 0,
        umbral: 0
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

  describe('Prueba de umbral negativo o 0', () => {
    it('Debería mostrar un mensaje de error si el umbral es menor o igual a 0', () => {
      component.producto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción Test',
        precio: 100,
        stock: 10,
        umbral: 0
      };

      const form: NgForm = {
        valid: false,
        controls: {},
        resetForm: () => { }
      } as unknown as NgForm;

      component.agregarProducto(form);
      expect(component.errorMessage).toBe('El umbral mínimo debe ser mayor que 0.');
    });
  });

  describe('Prueba de umbral mayor que stock', () => {
    it('Debería mostrar un mensaje de error si el umbral es mayor que el stock', () => {
      component.producto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción Test',
        precio: 100,
        stock: 10,
        umbral: 20
      };

      const form: NgForm = {
        valid: false,
        controls: {},
        resetForm: () => { }
      } as unknown as NgForm;

      component.agregarProducto(form);
      expect(component.errorMessage).toBe('El umbral mínimo no puede superar la cantidad en stock.');
    });
  });

  describe('Fallo en la base de datos', () => {
    it('Debería mostrar un mensaje de error en caso de fallo de base de datos', () => {
      component.producto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción Test',
        precio: 100,
        stock: 10,
        umbral: 10
      };

      productoServiceMock.verificarNombreProducto.and.returnValue(of(false));
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
      component.producto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción Test',
        precio: 100,
        stock: 10,
        umbral: 10
      };

      productoServiceMock.verificarNombreProducto.and.returnValue(of(false));

      // Mock del servicio que simula una pérdida de conexión (status: 0)
      productoServiceMock.crearProducto.and.returnValue(throwError({ status: 0 }));

      const form: NgForm = {
        valid: true,
        value: component.producto,
        controls: {},
        resetForm: () => { }
      } as unknown as NgForm;

      component.agregarProducto(form);

      expect(component.errorMessage).toBe('Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.');
    });
  });
});
