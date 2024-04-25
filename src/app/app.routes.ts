import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () =>
            import('./components/home/home.component').then(m => m.HomeComponent)
    },
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
        redirectTo: 'home',
        pathMatch: 'full'
    }
];
