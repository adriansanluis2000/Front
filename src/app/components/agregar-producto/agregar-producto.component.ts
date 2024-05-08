import { Component, ViewChild } from '@angular/core';
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
  [x: string]: any;

  producto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 1
  };

  errorMessage: string = '';

  constructor(private productoService: ProductoService) { }

  agregarProducto(form: NgForm) {
    if (form.valid) {
      this.productoService.crearProducto(form.value).subscribe({
        next: (data) => {
          console.log('Producto añadido', data);
          this.resetForm();
        },
        error: (e) => {
          this.errorMessage = 'Error al agregar el producto, inténtalo de nuevo.';
          console.error('Error al agregar el producto:', e)
        }
      });
    }
  }

  resetForm() {
    this.producto = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 1
    };
  }
}
