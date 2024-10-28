import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private readonly apiUrl = 'http://localhost:3000/api/pedidos';

  constructor(private readonly http: HttpClient) { }

  registrarPedido(datosPedido: { id: string, cantidad: number }[]) {
    return this.http.post(this.apiUrl, { productos: datosPedido });
  }
}
