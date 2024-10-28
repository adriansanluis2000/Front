import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registrar-pedido',
  standalone: true,
  imports: [NgFor, FormsModule],
  templateUrl: './registrar-pedido.component.html',
  styleUrl: './registrar-pedido.component.scss'
})
export class RegistrarPedidoComponent implements OnInit {
  productos: any[] = [];
  productosPedido: { producto: any, cantidad: number }[] = [];

  constructor(private readonly productoService: ProductoService, private readonly pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe(productos => {
      this.productos = productos;
    });
  }

  agregarProducto(producto: any) {
    const productoExistente = this.productosPedido.find(item => item.producto.id === producto.id);
    if (productoExistente) {
      productoExistente.cantidad++;
    } else {
      this.productosPedido.push({ producto, cantidad: 1});
    }
  }

  quitarProducto(item: { producto: any, cantidad: number }) {
    this.productosPedido = this.productosPedido.filter(orderItem => orderItem !== item);
  }

  actualizarProducto(item: { producto: any, cantidad: number }) {
    if (item.cantidad < 1) {
      this.quitarProducto(item);
    }
  }

  registrarPedido() {
    const datosPedido = this.productosPedido.map(item => ({
      id: item.producto.id,
      cantidad: item.cantidad
    }));
    this.pedidoService.registrarPedido(datosPedido).subscribe(response => {
      console.log('Pedido registrado:', response);
      this.productosPedido = [];
    })
  }

}
