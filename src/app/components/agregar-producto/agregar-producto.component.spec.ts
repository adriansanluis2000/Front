import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AgregarProductoComponent } from './agregar-producto.component';
import { ProductoService } from '../../services/producto.service';
import { By } from '@angular/platform-browser';

describe('AgregarProductoComponent', () => {
  let component: AgregarProductoComponent;
  let fixture: ComponentFixture<AgregarProductoComponent>;
  let productoService: ProductoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AgregarProductoComponent,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [
        ProductoService
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AgregarProductoComponent);
    component = fixture.componentInstance;
    productoService = TestBed.inject(ProductoService);
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('Prueba de éxito', () => {
    const compiled = fixture.nativeElement;
    const nombreInput = compiled.querySelector('input[name="nombre"]');
    const precioInput = compiled.querySelector('input[name="precio"]');
    const cantidadInput = compiled.querySelector('input[name="stock"]');

    // Simulación de la entrada para el nombre del producto
    nombreInput.value = 'Nuevo Producto';
    nombreInput.dispatchEvent(new Event('input'));

    // Simulación de la entrada para el precio del producto
    precioInput.value = 50;
    precioInput.dispatchEvent(new Event('input'));

    // Simulación de la entrada para la cantidad del producto
    cantidadInput.value = 100;
    cantidadInput.dispatchEvent(new Event('input'));

    // Comprobación de los valores dentro del componente
    expect(component.producto.nombre).toEqual('Nuevo Producto');
    expect(component.producto.precio).toEqual(50);
    expect(component.producto.stock).toEqual(100);
  });


  it('Prueba de error por campo vacío', () => {
    component.producto.nombre = '';
    component.producto.precio = 50;
    component.producto.stock = 10;

    // Simula la acción de enviar el formulario
    let form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', null);

    fixture.detectChanges();

    // Verifica si se muestra el mensaje de error
    let errorMsg = fixture.debugElement.query(By.css('.error'));
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.nativeElement.textContent).toContain('El nombre del producto es obligatorio.' || 'El precio es obligatorio.' || 'La cantidad es obligatoria.');
  });


  it('Prueba de precio negativo', () => {
    const compiled = fixture.nativeElement;
    const nombreInput = compiled.querySelector('input[name="nombre"]');
    const precioInput = compiled.querySelector('input[name="precio"]');
    const cantidadInput = compiled.querySelector('input[name="stock"]');

    // Simulación de la entrada para el nombre del producto
    nombreInput.value = 'Nuevo Producto';
    nombreInput.dispatchEvent(new Event('input'));

    // Simulación de la entrada para el precio del producto
    precioInput.value = -50;
    precioInput.dispatchEvent(new Event('input'));

    // Simulación de la entrada para la cantidad del producto
    cantidadInput.value = 100;
    cantidadInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    // Busca el mensaje de error
    const error = fixture.debugElement.query(By.css('#error-precio'));
    expect(error.nativeElement.innerText).toContain('El precio debe ser mayor que 0');
  });


  it('Prueba de cantidad negativa', () => {
    const compiled = fixture.nativeElement;
    const nombreInput = compiled.querySelector('input[name="nombre"]');
    const precioInput = compiled.querySelector('input[name="precio"]');
    const cantidadInput = compiled.querySelector('input[name="stock"]');

    // Simulación de la entrada para el nombre del producto
    nombreInput.value = 'Nuevo Producto';
    nombreInput.dispatchEvent(new Event('input'));

    // Simulación de la entrada para el precio del producto
    precioInput.value = 50;
    precioInput.dispatchEvent(new Event('input'));

    // Simulación de la entrada para la cantidad del producto
    cantidadInput.value = -10;
    cantidadInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    // Busca el mensaje de error
    const error = fixture.debugElement.query(By.css('#error-cantidad'));
    expect(error.nativeElement.innerText).toContain('La cantidad mínima es 1');
  });

});
