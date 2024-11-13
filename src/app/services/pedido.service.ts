import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private readonly apiUrl = 'http://localhost:3000/api/pedidos';

  constructor(private readonly http: HttpClient) { }

  registrarPedido(datosPedido: { id: number, cantidad: number }[]) {
    return this.http.post(this.apiUrl, { productos: datosPedido });
  }

  obtenerHistorialPedidos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  eliminarPedido(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
}
