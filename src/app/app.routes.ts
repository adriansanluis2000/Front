import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'listaProductos',
        loadComponent: () => 
            import('./components/lista-productos/lista-productos.component').then(m => m.ListaProductosComponent),    
    },
    {
        path: 'agregarProducto',
        loadComponent: () =>
            import('./components/agregar-producto/agregar-producto.component').then(m =>  m.AgregarProductoComponent),
    },
    {
        path: '',
        redirectTo: 'listaProductos',
        pathMatch: 'full'
    }
];
