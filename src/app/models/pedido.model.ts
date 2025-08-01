export interface Pedido {
    id: number;
    fecha: string;
    precioTotal: number;
    Productos: Array<{
        id: number;
        nombre: string;
        precio: number;
        stock: number;
        descripcion?: string;
        ProductoPedido: {
            cantidad: number;
        }
    }>;
    tipo: string;
}
