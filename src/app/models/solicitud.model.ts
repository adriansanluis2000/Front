export interface Solicitud {
  id: number;
  fecha: string;
  Productos: Array<{
    id: number;
    nombre: string;
    precio: number;
    stock: number;
    descripcion?: string;
    ProductoSolicitud: {
        cantidad: number;
    }
}>;
}
