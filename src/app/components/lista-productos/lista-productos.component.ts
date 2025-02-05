import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.scss',
})
export class ListaProductosComponent implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  productoSeleccionado: any;
  productoForm: FormGroup;
  ordenAscendente: boolean = true;
  
  errorMessage: string = '';
  busqueda: string = '';

  constructor(private readonly productoService: ProductoService, private readonly fb: FormBuilder) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.obtenerProductos();
  }

  filtrarProductos(): void {
    const terminos = this.busqueda
      .split(' ')
      .map((termino) => termino.trim().toLowerCase())
      .filter((termino) => termino !== '');

    this.productosFiltrados = this.productos.filter((producto) =>
      terminos.every((termino) => producto.nombre.toLowerCase().includes(termino))
    );

    // Mostramos el mensaje de error si no hay productos encontrados
    if (this.productosFiltrados.length === 0) {
      this.errorMessage = 'No se encontraron productos.';
    } else {
      this.errorMessage = '';
    }
  }

  obtenerProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (data: any[]) => {
        this.productos = data;
        this.productosFiltrados = [...this.productos];
      },
      error: (e) => {
        if (e.status === 0) {
          this.errorMessage = 'Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.';
        } else {
          this.errorMessage = 'Error al obtener productos';
        }
      },
    });
  }

  eliminarProducto(id: number): void {
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (confirmacion) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          this.productos = this.productos.filter((producto) => producto.id !== id);
        },
        error: (e) => {
          console.error('Error al eliminar producto', e);
        },
      });
    }
  }

  abrirModal(producto: any): void {
    this.productoSeleccionado = producto;

    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
    });
  }

  cerrarModal(): void {
    this.productoSeleccionado = null;
  }

  guardarProducto(): void {
    if (this.productoForm.valid && this.productoSeleccionado) {
      const productoActualizado: any = {
        ...this.productoSeleccionado,
        ...this.productoForm.value,
      };

      this.productoService.actualizarProducto(productoActualizado.id, productoActualizado).subscribe({
        next: () => {
          console.log('any actualizado con éxito');
          this.cerrarModal();
          this.obtenerProductos();
        },
        error: (e) => {
          console.error('Error al actualizar producto', e);
        },
      });
    } else {
      console.log('Formulario no válido o producto no seleccionado');
    }
  }

  ordenarPorNombre(): void {
    this.productos.sort((a, b) => {
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();
      return this.ordenAscendente ? nombreA.localeCompare(nombreB) : nombreB.localeCompare(nombreA);
    });
    this.ordenAscendente = !this.ordenAscendente;
  }

  ordenarPorStock(): void {
    this.productos.sort((a, b) => {
      return this.ordenAscendente ? a.stock - b.stock : b.stock - a.stock;
    });
    this.ordenAscendente = !this.ordenAscendente;
  }

  // Método para comprobar si el stock es menor que el umbral
  verificarStockPorUmbral(stock: number, umbral: number): boolean {
    return stock < umbral;
  }

  filters = {
    stock: '', // Puede ser 'low', 'near-threshold' o vacío
  };

  filtrarPorStock() {
    const porcentajeCercania = 20; // Porcentaje de cercanía al umbral

    this.productosFiltrados = this.productos.filter((producto) => {
      if (this.filters.stock === 'low') {
        return producto.stock < producto.umbral; // Stock bajo
      } else if (this.filters.stock === 'near-threshold') {
        const rangoCercania = producto.umbral * (porcentajeCercania / 100);
        return (
          producto.stock >= producto.umbral && producto.stock <= producto.umbral + rangoCercania // Cercano al umbral
        );
      }
      return true; // Sin filtros, mostrar todos los productos
    });
  }

  setStockFilter(filter: string): void {
    this.filters.stock = this.filters.stock === filter ? '' : filter;
    this.filtrarPorStock();
  }
}
