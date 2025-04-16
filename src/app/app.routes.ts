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
        path: 'agregar-producto',
        loadComponent: () =>
            import('./components/agregar-producto/agregar-producto.component').then(m => m.AgregarProductoComponent)
    },
    {
        path: 'registrar-pedido-entrante',
        loadComponent: () =>
            import('./components/registrar-pedido-entrante/registrar-pedido-entrante.component').then(m => m.RegistrarPedidoEntranteComponent)
    },
    {
        path: 'registrar-pedido-entrante/:pedidoId',
        loadComponent: () =>
            import('./components/registrar-pedido-entrante/registrar-pedido-entrante.component').then(m => m.RegistrarPedidoEntranteComponent)
    },
    {
        path: 'historial-pedidos-entrantes',
        loadComponent: () =>
            import('./components/historial-pedidos-entrantes/historial-pedidos-entrantes.component').then(m => m.HistorialPedidosEntrantesComponent)
    },
    {
        path: 'registrar-pedido-saliente',
        loadComponent: () =>
            import('./components/registrar-pedido-saliente/registrar-pedido-saliente.component').then(m => m.RegistrarPedidoSalienteComponent)
    },
    {
        path: 'registrar-pedido-saliente/:pedidoId',
        loadComponent: () =>
            import('./components/registrar-pedido-saliente/registrar-pedido-saliente.component').then(m => m.RegistrarPedidoSalienteComponent)
    },
    {
        path: 'historial-pedidos-salientes',
        loadComponent: () =>
            import('./components/historial-pedidos-salientes/historial-pedidos-salientes.component').then(m => m.HistorialPedidosSalientesComponent)
    },
    {
        path: 'solicitudes-pendientes',
        loadComponent: () =>
            import('./components/solicitudes-pendientes/solicitudes-pendientes.component').then(m=> m.SolicitudesPendientesComponent)
    }
];
