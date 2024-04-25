import { Component } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agregar-producto',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './agregar-producto.component.html',
  styleUrl: './agregar-producto.component.scss'
})
export class AgregarProductoComponent {
  producto = {
    nombre: '',
    descripcion: '',
    precio: null
  };

  constructor(private productoService: ProductoService) { }

  onSubmit() {
    this.productoService.crearProducto(this.producto).subscribe({
      next: (data) => {
        console.log('Producto añadido', data);
        this.resetForm();
      },
      error: (e) => console.error('Hubo un error:', e)
    });
  }

  resetForm() {
    this.producto = {
      nombre: '',
      descripcion: '',
      precio: null
    };
  }
}
