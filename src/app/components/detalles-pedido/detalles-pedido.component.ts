import { Component, Input } from '@angular/core';
import { Pedido } from '../../models/pedido.model';
import { DatePipe, NgFor } from '@angular/common';

@Component({
  selector: 'app-detalles-pedido',
  standalone: true,
  imports: [NgFor, DatePipe],
  templateUrl: './detalles-pedido.component.html',
  styleUrl: './detalles-pedido.component.scss'
})
export class DetallesPedidoComponent {
  @Input() pedido!: Pedido;
}
