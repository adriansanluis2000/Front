import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../services/pedido.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-historial-pedidos',
  standalone: true,
  imports: [NgFor],
  templateUrl: './historial-pedidos.component.html',
  styleUrl: './historial-pedidos.component.scss'
})
export class HistorialPedidosComponent implements OnInit {
  pedidos: any[] = [];

  errorMessage: string = '';

  constructor(private readonly pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.obtenerHistorial();
  }

  obtenerHistorial(): void {
    this.pedidoService.obtenerHistorialPedidos().subscribe({
      next: (data: any[]) => {
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

  verDetallesPedido(id: string) {
    console.log('Ver detalles pedido');
  }
}
