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

  constructor(private readonly productoService: ProductoService, private readonly pedidoService: PedidoService) { }

  ngOnInit(): void {
    this.cargarProductos();
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

  quitarProducto(item: { producto: any, cantidad: number }): void {
    this.productosPedido = this.productosPedido.filter(orderItem => orderItem !== item);
  }

  actualizarProducto(item: { producto: any, cantidad: number }): void {
    if (item.cantidad < 1) {
      this.quitarProducto(item);
    }
  }

  registrarPedido(): void {
    const datosPedido = this.productosPedido.map(item => ({
      id: item.producto.id,
      cantidad: item.cantidad
    }));

    this.pedidoService.registrarPedido(datosPedido).subscribe(
      response => {
        console.log('Pedido registrado:', response);
        this.productosPedido = [];
      },
      error => {
        console.error('Error al registrar el pedido:', error);
        alert(error.error.mensaje || 'No se pudo registrar el pedido debido a un problema de stock.');
      }
    );
  }

  calcularTotalPedido(): number {
    return this.productosPedido.reduce((total, item) => {
      return total + (item.producto.precio * item.cantidad);
    }, 0);
  }

}
