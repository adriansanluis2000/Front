import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./components/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'productos',
        loadComponent: () =>
            import('./components/lista-productos/lista-productos.component').then(m => m.ListaProductosComponent)
    },
    {
        path: 'agregarProducto',
        loadComponent: () =>
            import('./components/agregar-producto/agregar-producto.component').then(m => m.AgregarProductoComponent)
    },
    {
        path: 'registrarPedido',
        loadComponent: () =>
            import('./components/registrar-pedido/registrar-pedido.component').then(m => m.RegistrarPedidoComponent)
    },
    {
        path: 'pedidos',
        loadComponent: () =>
            import('./components/historial-pedidos/historial-pedidos.component').then(m => m.HistorialPedidosComponent)
    }
];
