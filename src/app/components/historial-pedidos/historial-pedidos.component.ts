import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../services/pedido.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Pedido } from '../../models/pedido.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historial-pedidos',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule],
  templateUrl: './historial-pedidos.component.html',
  styleUrl: './historial-pedidos.component.scss'
})
export class HistorialPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosOriginales: Pedido[] = [];
  pedidoSeleccionado: Pedido | null = null;
  busqueda: string = '';
  errorMessage: string = '';

  constructor(private readonly pedidoService: PedidoService) { }

  ngOnInit(): void {
    this.obtenerHistorial();
    this.pedidosOriginales = [...this.pedidos];
  }

  obtenerHistorial(): void {
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
        if (e.status === 0) {
          this.errorMessage = 'Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.';
        } else {
          this.errorMessage = 'Error al obtener el historial de pedidos. Por favor, inténtalo de nuevo más tarde.'
        }
      }
    });
  }

  filtrarPedidos(): void {
    const terminos = this.busqueda
      .split(' ')
      .map(termino => termino.trim().toLowerCase())
      .filter(termino => termino !== '');

    // Restauramos la lista de pedidos a la lista original antes de filtrar
    this.pedidos = [...this.pedidosOriginales];

    // Filtramos solo si hay términos de búsqueda
    if (terminos.length > 0) {
      this.pedidos = this.pedidos.filter(pedido =>
        terminos.every(termino => pedido.id.toString().toLowerCase().includes(termino))
      );
    }

    // Mostrar mensaje de error si no hay pedidos encontrados
    if (this.pedidos.length === 0) {
      this.errorMessage = 'No se encontraron pedidos.';
    } else {
      this.errorMessage = '';
    }
  }


  verDetallesPedido(id: number): void {
    this.pedidoSeleccionado = this.pedidos.find(pedido => pedido.id === id) || null;
  }

  cerrarDetalles(): void {
    this.pedidoSeleccionado = null;
  }

  eliminarPedido(id: number): void {
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar este pedido?');
    if (confirmacion) {
      if (!navigator.onLine) {
        this.errorMessage = 'No se pudo eliminar el pedido debido a una pérdida de conexión. Verifica tu conexión e inténtalo de nuevo.';
        return;
      }
      this.pedidoService.eliminarPedido(id).subscribe({
        next: () => {
          this.pedidos = this.pedidos.filter(pedido => pedido.id !== id);
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Error al eliminar pedido', error);
          this.errorMessage = 'Error al eliminar pedido: ' + (error.error || 'Error desconocido');
        }
      });
    }
  }
}
