import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private baseUrl = 'http://localhost:3000/api/productos';

  constructor(private http: HttpClient) { }

  crearProducto(producto: any) {
    return this.http.post(this.baseUrl, producto);
  }

  obtenerProductos(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

}