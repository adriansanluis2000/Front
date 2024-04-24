import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'listaProductos',
        loadComponent: () => 
            import('./components/lista-productos/lista-productos.component').then((m) => m.ListaProductosComponent),    
    },
    {
        path: '',
        redirectTo: 'listaProductos',
        pathMatch: 'full'
    }
];
