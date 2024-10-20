import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.scss'
})
export class ListaProductosComponent implements OnInit {
  productos: any[] = [];
  productoSeleccionado: any;
  productoForm: FormGroup;
  ordenAscendente: boolean = true; // Controla el orden ascendente o descendente
  
  constructor(
    private readonly productoService: ProductoService,
    private readonly fb: FormBuilder,
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.productoService.obtenerProductos().subscribe(
      (data: any[]) => {
        this.productos = data;
      },
      (error) => {
        console.error('Error al obtener productos', error);
      }
    );
  }

  eliminarProducto(id: number): void {
    this.productoService.eliminarProducto(id).subscribe({
      next: () => {
        console.log('any eliminado con éxito');
        this.ngOnInit();
      },
      error: (e) => console.error('Error al eliminar producto', e)
    });
  }

  abrirModal(producto: any): void {
    this.productoSeleccionado = producto;

    // Rellena el formulario con los datos del producto seleccionado
    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock
    });
  }

  cerrarModal(): void {
    this.productoSeleccionado = null;
  }

  guardarProducto(): void {
    if (this.productoForm.valid && this.productoSeleccionado) {
      const productoActualizado: any = {
        ...this.productoSeleccionado,
        ...this.productoForm.value
      };

      this.productoService.actualizarProducto(productoActualizado.id, productoActualizado).subscribe({
        next: () => {
          console.log('any actualizado con éxito');
          this.cerrarModal();
          this.obtenerProductos();
        },
        error: (e) => {
          console.error('Error al actualizar producto', e);
        }
      });
    } else {
      console.log('Formulario no válido o producto no seleccionado');
    }
  }


  // Método para ordenar por nombre
  ordenarPorNombre(): void {
    this.productos.sort((a, b) => {
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();
      return this.ordenAscendente
        ? nombreA.localeCompare(nombreB)
        : nombreB.localeCompare(nombreA);
    });
    this.ordenAscendente = !this.ordenAscendente; // Cambia el estado para la próxima ordenación
  }

  // Método para ordenar por stock
  ordenarPorStock(): void {
    this.productos.sort((a, b) => {
      return this.ordenAscendente ? a.stock - b.stock : b.stock - a.stock;
    });
    this.ordenAscendente = !this.ordenAscendente; // Cambia el estado para la próxima ordenación
  }

}
