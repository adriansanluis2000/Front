import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../services/pedido.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Pedido } from '../../models/pedido.model';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historial-pedidos-entrantes',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule],
  templateUrl: './historial-pedidos-entrantes.component.html',
  styleUrl: './historial-pedidos-entrantes.component.scss'
})
export class HistorialPedidosEntrantesComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosOriginales: Pedido[] = [];
  pedidoSeleccionado: Pedido | null = null;
  busqueda: string = '';
  errorMessage: string = '';
  errorBusqueda: string = '';

  constructor(
    private readonly pedidoService: PedidoService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.obtenerHistorial();
  }

  obtenerHistorial(): void {
    this.pedidoService.obtenerHistorialPedidos('entrante').subscribe({
      next: (data: Pedido[]) => {
        if (data.length === 0) {
          this.errorMessage = 'No se encontraron pedidos.';
        } else {
          this.errorMessage = '';
          this.pedidosOriginales = data;
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
    const regex = /^\d*$/; // Expresión regular para validar solo números

    if (!regex.test(this.busqueda)) {
      this.errorBusqueda = 'Número de pedido inválido. Solo se permiten números.';
      this.pedidos = [...this.pedidosOriginales];
      return;
    }

    this.errorBusqueda = '';

    const terminos = this.busqueda.trim().toLowerCase();

    // Filtrar solo si hay términos de búsqueda
    this.pedidos = terminos ? this.pedidosOriginales.filter(pedido =>
      pedido.id.toString().includes(terminos)
    ) : [...this.pedidosOriginales];

    // Verificar si no hay resultados
    this.errorMessage = this.pedidos.length === 0 ? 'No se encontraron pedidos.' : '';
  }


  verDetallesPedido(id: number): void {
    this.pedidoSeleccionado = this.pedidos.find(pedido => pedido.id === id) || null;
  }

  editarPedido(pedidoId: number) {
    this.router.navigate(['/registrar-pedido-entrante', pedidoId]);
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
