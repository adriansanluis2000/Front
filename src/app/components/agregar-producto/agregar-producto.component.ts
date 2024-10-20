import { Component } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { FormsModule, FormControl, Validators, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agregar-producto',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [FormControl, Validators],
  templateUrl: './agregar-producto.component.html',
  styleUrl: './agregar-producto.component.scss'
})
export class AgregarProductoComponent {

  producto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 1
  };

  errorMessage: string = '';

  constructor(private readonly productoService: ProductoService) { }

  agregarProducto(form: NgForm) {
    // Primero, marca los campos como tocados si el formulario no es válido
    if (!form.valid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
    }

    // Validación específica de valores antes de continuar
    if (this.producto.precio <= 0) {
      this.errorMessage = 'El precio debe ser mayor que 0.';
      return;
    }

    if (this.producto.stock <= 0) {
      this.errorMessage = 'La cantidad mínima es 1.';
      return;
    }

    // Si el formulario es válido, continúa con el proceso normal
    if (form.valid) {
      this.productoService.crearProducto(this.producto).subscribe({
        next: (data) => {
          console.log('Producto añadido:', data);
          this.resetForm(form);
        },
        error: (e) => {
          if (e.status === 0) {
            this.errorMessage = 'Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.';
          } else {
            this.errorMessage = 'Error al agregar el producto, inténtalo de nuevo.';
          }
        }
      });
    }
  }



  resetForm(form: NgForm) {
    form.resetForm();
    this.producto = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 1
    };
  }
}
