import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solicitud } from '../models/solicitud.model';

@Injectable({
  providedIn: 'root',
})
export class SolicitudService {
  private readonly apiUrl = 'http://localhost:3000/api/solicitudes';

  constructor(private readonly http: HttpClient) {}

  crearSolicitud(productos: any): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.apiUrl, productos);
  }

  obtenerSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.apiUrl);
  }

  eliminarSolicitud(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  actualizarSolicitud(id: number, productos: any): Observable<Solicitud> {
    return this.http.put<Solicitud>(`${this.apiUrl}/${id}`, productos);
  }
}
