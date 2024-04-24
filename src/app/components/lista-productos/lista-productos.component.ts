import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/productos.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [NgFor],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.scss'
})
export class ListaProductosComponent {
  productos: any[] = [];

  /* constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: (e) => console.error(e)
    });
  } */
}
