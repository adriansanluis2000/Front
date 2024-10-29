import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registrar-pedido',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './registrar-pedido.component.html',
  styleUrl: './registrar-pedido.component.scss'
})
export class RegistrarPedidoComponent implements OnInit {
  productos: any[] = [];
  productosPedido: { producto: any, cantidad: number }[] = [];
  pedidoPendiente: any[] = [];

  errorMessage: string = '';

  constructor(private readonly productoService: ProductoService, private readonly pedidoService: PedidoService) { }

  ngOnInit(): void {
    this.cargarProductos();

    // Escuchar el evento de reconexión
    window.addEventListener('online', () => {
      this.checkAndRetryOrder();
    });
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe(productos => {
      this.productos = productos;
      this.ordenarProductos();
    });
  }

  ordenarProductos(): void {
    this.productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  agregarProducto(producto: any): void {
    const productoExistente = this.productosPedido.find(item => item.producto.id === producto.id);
    if (productoExistente) {
      productoExistente.cantidad++;
    } else {
      this.productosPedido.push({ producto, cantidad: 1 });
    }
  }

  quitarProducto(item: { producto: any, cantidad: number }): boolean {
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (confirmacion) {
      this.productosPedido = this.productosPedido.filter(orderItem => orderItem !== item);
      return true;
    }
    return false;
  }

  actualizarProducto(item: { producto: any, cantidad: number }): void {
    // Comprobar si la cantidad es un número
    if (isNaN(item.cantidad) || typeof item.cantidad !== 'number') {
      alert('La cantidad debe ser un número.');
      item.cantidad = 1;
      return;
    }

    // Comprobar si la cantidad es un número decimal
    if (item.cantidad % 1 !== 0) {
      alert('La cantidad debe ser un número entero.'); // Mensaje de error para decimales
      item.cantidad = Math.floor(item.cantidad); // Redondear hacia abajo o puedes usar Math.round(item.cantidad)
      return;
    }

    if (item.cantidad < 1) {
      const borrado = this.quitarProducto(item);
      if (!borrado) {
        item.cantidad = 1;
      }
    }
  }

  registrarPedido(): void {
    // Verificar si hay conexión a internet
    if (!navigator.onLine) {
      this.errorMessage = 'Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.';
      this.pedidoPendiente = this.productosPedido.map(item => ({ id: item.producto.id, cantidad: item.cantidad }));
      return;
    }

    const datosPedido = this.productosPedido.map(item => ({
      id: item.producto.id,
      cantidad: item.cantidad
    }));

    this.pedidoService.registrarPedido(datosPedido).subscribe(
      response => {
        console.log('Pedido registrado:', response);
        this.productosPedido = [];
        this.errorMessage = '';
      },
      error => {
        console.error('Error al registrar el pedido:', error);
        alert(error.error.mensaje || 'No se pudo registrar el pedido debido a un problema de stock.');
      }
    );
  }

  checkAndRetryOrder(): void {
    if (navigator.onLine && this.pedidoPendiente.length > 0) {
      this.pedidoService.registrarPedido(this.pedidoPendiente).subscribe(
        response => {
          console.log('Pedido registrado tras reconexión:', response);
          this.pedidoPendiente = [];
        },
        error => {
          console.error('Error al reintentar registrar el pedido:', error);
          this.errorMessage = error.error.mensaje || 'No se pudo registrar el pedido debido a un problema de stock.';
        }
      );
    }
  }

  calcularTotalPedido(): number {
    return this.productosPedido.reduce((total, item) => {
      return total + (item.producto.precio * item.cantidad);
    }, 0);
  }

}
