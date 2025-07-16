import { Component, OnInit } from '@angular/core';
import { Solicitud } from '../../models/solicitud.model';
import { SolicitudService } from '../../services/solicitud.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-solicitudes-pendientes',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule],
  templateUrl: './solicitudes-pendientes.component.html',
  styleUrls: ['./solicitudes-pendientes.component.scss'],
})
export class SolicitudesPendientesComponent implements OnInit {
  solicitudes: Solicitud[] = [];
  solicitudSeleccionada: Solicitud | null = null;
  productoSeleccionado: any | null = null;
  unidadesRecibidas: number = 0;
  errorMessage: string = '';

  constructor(
    private readonly solicitudService: SolicitudService,
    private readonly productoService: ProductoService,
    private readonly pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.solicitudService.obtenerSolicitudes().subscribe({
      next: (data) => {
        if (data.length === 0) {
          this.errorMessage = 'No se encontraron solicitudes pendientes.';
        } else {
          this.errorMessage = '';
          this.solicitudes = data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        }
      },
      error: (e) => {
        if (e.status === 0) {
          this.errorMessage = 'Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.';
        } else {
          this.errorMessage = 'Error al obtener las solicitudes. Por favor, inténtalo de nuevo más tarde.';
        }
      },
    });
  }

  eliminarSolicitud(id: number): void {
    this.solicitudService.eliminarSolicitud(id).subscribe(() => {
      this.solicitudes = this.solicitudes.filter((s) => s.id !== id);
    });
  }

  verDetallesSolicitud(id: number): void {
    this.solicitudSeleccionada = this.solicitudes.find((solicitud) => solicitud.id === id) || null;
  }

  cerrarDetalles(): void {
    this.solicitudSeleccionada = null;
  }

  abrirModalRecepcion(producto: any): void {
    const cantidadPendiente = producto.ProductoSolicitud.cantidad;

    this.productoSeleccionado = producto;

    const unidades = prompt(`¿Cuántas unidades recibirás para ${producto.nombre}?`, '1');

    if (unidades !== null) {
      this.unidadesRecibidas = Number(unidades);

      if (cantidadPendiente - this.unidadesRecibidas == 0) {
        this.confirmarRecepcion();
        alert(`El producto ` + producto.nombre + ` ya no tiene unidades pendientes por recibir.`);

        const quedanPendientes = this.solicitudSeleccionada?.Productos.some((p) => p.ProductoSolicitud.cantidad > 0);

        if (!quedanPendientes) {
          this.cerrarDetalles();
        }
      } else if (this.unidadesRecibidas > 0 && this.unidadesRecibidas <= cantidadPendiente) {
        this.confirmarRecepcion();
      } else {
        alert('Cantidad inválida. Por favor, ingresa un número válido.');
      }
    }
  }

  cerrarModalRecepcion(): void {
    this.productoSeleccionado = null;
    this.unidadesRecibidas = 0;
  }

  confirmarRecepcion(): void {
    if (this.unidadesRecibidas > 0 && this.unidadesRecibidas <= this.productoSeleccionado.ProductoSolicitud.cantidad) {
      // Descontar las unidades de la solicitud
      const cantidadRestante = this.productoSeleccionado.ProductoSolicitud.cantidad - this.unidadesRecibidas;
      this.productoSeleccionado.ProductoSolicitud.cantidad = cantidadRestante;

      const idSolicitud = this.solicitudSeleccionada?.id;

      if (!idSolicitud) {
        alert('Error: No se encontró la solicitud.');
        return;
      }
      // Preparar los datos del pedido
      const datosPedido = {
        productos: [
          {
            id: this.productoSeleccionado.id,
            cantidad: this.unidadesRecibidas,
          },
        ],
        tipo: 'saliente',
      };

      // Agrupar todas las solicitudes en una sola operación atómica
      forkJoin({
        registrarPedido: this.pedidoService.registrarPedido(datosPedido),
        actualizarSolicitud: this.solicitudService.actualizarSolicitud(idSolicitud, datosPedido.productos),
      }).subscribe({
        next: () => {
          // Cerrar modal y actualizar la lista si todo salió bien
          this.cerrarModalRecepcion();
          this.cargarSolicitudes();
        },
        error: (err) => {
          console.error('Error en la operación atómica', err);
          alert('Ocurrió un error al procesar la solicitud. Inténtalo de nuevo.');
        },
      });
    } else {
      alert('Cantidad inválida.');
    }
  }
}
