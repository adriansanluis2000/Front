import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../services/pedido.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Pedido } from '../../models/pedido.model';

@Component({
  selector: 'app-historial-pedidos',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './historial-pedidos.component.html',
  styleUrl: './historial-pedidos.component.scss'
})
export class HistorialPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidoSeleccionado: Pedido | null = null; // Variable para almacenar el pedido seleccionado

  errorMessage: string = '';

  constructor(private readonly pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.obtenerHistorial();
  }

  obtenerHistorial(): void {
    this.pedidoService.obtenerHistorialPedidos().subscribe({
      next: (data: Pedido[]) => {
        this.pedidos = data;
      },
      error: (e) => {
        if (e.status === 0) {
          this.errorMessage = 'Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.';
        } else {
          this.errorMessage = 'Error al obtener el historial de pedidos'
        }
      }
    });
  }

  verDetallesPedido(id: number): void {
    this.pedidoSeleccionado = this.pedidos.find(pedido => pedido.id === id) || null;
  }

  cerrarDetalles(): void {
    this.pedidoSeleccionado = null;
  }
}
