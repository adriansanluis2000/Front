import { Component } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { FormsModule, FormControl, Validators, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-agregar-producto',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [FormControl, Validators],
  templateUrl: './agregar-producto.component.html',
  styleUrl: './agregar-producto.component.scss',
})
export class AgregarProductoComponent {
  producto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 1,
    umbral: 1,
  };

  errorMessage: string = '';

  constructor(private readonly productoService: ProductoService, private readonly snackBar: MatSnackBar) {}

  agregarProducto(form: NgForm) {
    // Restablece el mensaje de error al iniciar la adición de un nuevo producto
    this.errorMessage = '';

    // Primero, marca los campos como tocados si el formulario no es válido
    if (!form.valid) {
      Object.keys(form.controls).forEach((field) => {
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

    if (this.producto.umbral <= 0) {
      this.errorMessage = 'El umbral mínimo debe ser mayor que 0.';
      return;
    }

    if (this.producto.umbral > this.producto.stock) {
      this.errorMessage = 'El umbral mínimo no puede superar la cantidad en stock.';
      return;
    }

    // Verificar si el nombre del producto ya existe
    this.productoService.verificarNombreProducto(this.producto.nombre).subscribe({
      next: (exists) => {
        if (exists) {
          this.errorMessage = 'El nombre del producto ya existe. Por favor, elige otro nombre.';
          return;
        }

        // Si el formulario es válido y el nombre no existe, continúa con el proceso normal
        if (form.valid) {
          this.productoService.crearProducto(this.producto).subscribe({
            next: (data) => {
              console.log('Producto añadido:', data);
              this.resetForm(form);

              this.snackBar.open('Producto almacenado con éxito', '', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['snackbar-success'],
              });
            },
            error: (e) => {
              if (e.status === 0) {
                this.errorMessage = 'Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.';
              } else {
                this.errorMessage = 'Error al agregar el producto, inténtalo de nuevo.';
              }

              this.snackBar.open('Error al agregar el producto', '', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['snackbar-error'],
              });
            },
          });
        }
      },
      error: (e) => {
        this.errorMessage = 'Error al verificar el nombre del producto. Inténtalo de nuevo.';
        console.error(e);
      },
    });
  }

  resetForm(form: NgForm) {
    form.resetForm();
    this.producto = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 1,
      umbral: 1,
    };
  }
}
