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

  constructor(private readonly pedidoService: PedidoService) { }

  ngOnInit(): void {
    this.obtenerHistorial();
  }

  obtenerHistorial(): void {
    // Verificar si hay conexión a internet
    if (!navigator.onLine) {
      this.errorMessage = 'Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.';
      return; // No continuamos con la llamada al servicio si no hay conexión
    }

    this.pedidoService.obtenerHistorialPedidos().subscribe({
      next: (data: Pedido[]) => {
        if (data.length === 0) {
          this.errorMessage = 'No se encontraron pedidos.';
        } else {
          this.errorMessage = '';
          // Ordenar los pedidos de más reciente a más antiguo
          this.pedidos = data.sort((a, b) => {
            return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
          });
        }
      },
      error: (e) => {
        this.errorMessage = 'Error al obtener el historial de pedidos. Por favor, inténtalo de nuevo más tarde.'
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
