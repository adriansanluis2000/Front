import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private readonly apiUrl = 'http://localhost:3000/api/productos';

  constructor(private readonly http: HttpClient) { }

  crearProducto(producto: any) {
    return this.http.post(this.apiUrl, producto);
  }

  obtenerProductos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  actualizarProducto(id: number, producto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, producto);
  }

  verificarNombreProducto(nombre: string): Observable<boolean> {
    return this.http.get<boolean>(`http://localhost:3000/verificar-nombre?nombre=${nombre}`);
  }

}