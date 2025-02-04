import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private readonly apiUrl = 'http://localhost:3000/api/pedidos';

  constructor(private readonly http: HttpClient) { }

  registrarPedido(datosPedido: any): Observable<any> {
    return this.http.post(this.apiUrl, datosPedido);
  }

  obtenerHistorialPedidos(tipo: string): Observable<any> {
    let params = new HttpParams();
    if (tipo) {
      params = params.append('tipo', tipo); // Añadimos el parámetro tipo
    }
  
    return this.http.get(this.apiUrl, { params });
  }
  
  eliminarPedido(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
 
  obtenerPedidoPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  actualizarPedido(id: number, datosPedido: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datosPedido);
  }

  devolverStock(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/devolver-stock/${id}`, {});
  }  
}
