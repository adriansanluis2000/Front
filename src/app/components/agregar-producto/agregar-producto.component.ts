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
    precio: null,
    stock: null
  };

  errorMessage: string = '';

  constructor(private productoService: ProductoService) { }

  agregarProducto(form: NgForm) {
    if (form.valid) {
      this.productoService.crearProducto(this.producto).subscribe({
        next: (data) => {
          console.log('Producto añadido:', data);
          this.resetForm(form);
        },
        error: (e) => {
          this.errorMessage = 'Error al agregar el producto, inténtalo de nuevo.';
          console.error('Error al agregar el producto:', e);
        }
      });
    } else {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true }); // Cambiar a markAsTouched
      });
    }
  }

  resetForm(form : NgForm) {
    form.resetForm();
    this.producto = {
      nombre: '',
      descripcion: '',
      precio: null,
      stock: null
    };
  }
}
