export interface Producto {
    id: number;
    nombre: string;
    precio: number;
    stock: number;
    umbral: number;
    descripcion?: string;
};