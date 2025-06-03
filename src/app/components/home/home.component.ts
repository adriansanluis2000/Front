import { Component, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';
import Chart from 'chart.js/auto';
import { Pedido } from '../../models/pedido.model';
import { PedidoService } from '../../services/pedido.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('stackedBarChart') stackedBarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('scatterChart') scatterChartRef!: ElementRef<HTMLCanvasElement>;

  chartPie: Chart | null = null;
  chartStackedBar: Chart | null = null;
  scatterChart: Chart | null = null;

  productosVendidos: Array<{ id: number; nombre: string; totalVendidos: number }> = [];
  productosBeneficio: Array<{ id: number; nombre: string; beneficio: number }> = [];
  pedidosEntrantes: Pedido[] = [];
  pedidosSalientes: Pedido[] = [];

  // KPIs
  totalPedidosEntrantes = 0;
  totalPedidosSalientes = 0;
  totalUnidadesVendidas = 0;
  productoMasVendido: { nombre: string; totalVendidos: number } | null = null;

  constructor(
    private readonly pedidoService: PedidoService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    forkJoin({
      entrantes: this.pedidoService.obtenerHistorialPedidos('entrante'),
      salientes: this.pedidoService.obtenerHistorialPedidos('saliente'),
    }).subscribe(({ entrantes, salientes }) => {
      this.pedidosEntrantes = entrantes;
      this.pedidosSalientes = salientes;

      this.productosVendidos = this.sumarUnidadesVendidas(entrantes);
      this.productosBeneficio = this.calcularBeneficioPorProducto(entrantes);

      this.calcularKPIs();

      this.crearGraficoPie();
      this.crearGraficoBarrasApiladas();
      this.crearGraficoDispersion();
    });
  }

  calcularKPIs() {
    this.totalPedidosEntrantes = this.pedidosEntrantes.length;
    this.totalPedidosSalientes = this.pedidosSalientes.length;

    this.totalUnidadesVendidas = this.productosVendidos.reduce((acc, prod) => acc + prod.totalVendidos, 0);

    // Encontrar el producto más vendido
    this.productoMasVendido =
      this.productosVendidos.length > 0
        ? this.productosVendidos.reduce(
            (max, prod) => (prod.totalVendidos > max.totalVendidos ? prod : max),
            this.productosVendidos[0] // valor inicial
          )
        : null;
  }

  sumarUnidadesVendidas(pedidos: Pedido[]) {
    const resumenProductos: { [productoId: number]: { nombre: string; totalVendidos: number } } = {};

    pedidos.forEach((pedido) => {
      pedido.Productos.forEach((producto) => {
        if (!resumenProductos[producto.id]) {
          resumenProductos[producto.id] = {
            nombre: producto.nombre,
            totalVendidos: 0,
          };
        }
        resumenProductos[producto.id].totalVendidos += producto.ProductoPedido.cantidad;
      });
    });

    return Object.entries(resumenProductos).map(([id, data]) => ({
      id: +id,
      nombre: data.nombre,
      totalVendidos: data.totalVendidos,
    }));
  }

  calcularBeneficioPorProducto(pedidos: Pedido[]) {
    const beneficioProductos: { [productoId: number]: { nombre: string; beneficio: number } } = {};

    pedidos.forEach((pedido) => {
      pedido.Productos.forEach((producto) => {
        if (!beneficioProductos[producto.id]) {
          beneficioProductos[producto.id] = {
            nombre: producto.nombre,
            beneficio: 0,
          };
        }
        beneficioProductos[producto.id].beneficio += producto.ProductoPedido.cantidad * producto.precio;
      });
    });

    return Object.entries(beneficioProductos).map(([id, data]) => ({
      id: +id,
      nombre: data.nombre,
      beneficio: data.beneficio,
    }));
  }

  crearGraficoPie() {
    if (this.chartPie) {
      this.chartPie.destroy();
    }

    const ctx = this.pieChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartPie = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.productosBeneficio.map((p) => p.nombre),
        datasets: [
          {
            label: 'Beneficio',
            data: this.productosBeneficio.map((p) => p.beneficio),
            backgroundColor: this.generarColores(this.productosBeneficio.length),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Beneficio por Producto',
            font: { size: 18 },
            padding: { bottom: 10 },
          },
          legend: { position: 'right' },
          tooltip: { enabled: true },
        },
      },
    });
  }

  crearGraficoBarrasApiladas() {
    if (this.chartStackedBar) {
      this.chartStackedBar.destroy();
    }

    const ctx = this.stackedBarChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const nombresProductos = Array.from(
      new Set([
        ...this.pedidosEntrantes.flatMap((p) => p.Productos.map((pr) => pr.nombre)),
        ...this.pedidosSalientes.flatMap((p) => p.Productos.map((pr) => pr.nombre)),
      ])
    );

    const resumen: { [nombre: string]: { ventas: number; reposicion: number } } = {};
    nombresProductos.forEach((nombre) => {
      resumen[nombre] = { ventas: 0, reposicion: 0 };
    });

    this.pedidosEntrantes.forEach((pedido) => {
      pedido.Productos.forEach((producto) => {
        resumen[producto.nombre].ventas += producto.ProductoPedido.cantidad;
      });
    });

    this.pedidosSalientes.forEach((pedido) => {
      pedido.Productos.forEach((producto) => {
        resumen[producto.nombre].reposicion += producto.ProductoPedido.cantidad;
      });
    });

    this.chartStackedBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: nombresProductos,
        datasets: [
          {
            label: 'Unidades Vendidas',
            data: nombresProductos.map((nombre) => resumen[nombre].ventas),
            backgroundColor: '#5dade2',
            stack: 'stack1',
          },
          {
            label: 'Unidades Reposición',
            data: nombresProductos.map((nombre) => resumen[nombre].reposicion),
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            stack: 'stack1',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Ventas vs Reposición por Producto',
            font: { size: 18 },
            padding: { bottom: 10 },
          },
          legend: { position: 'top' },
          tooltip: { enabled: true },
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true },
        },
      },
    });
  }

  crearGraficoDispersion() {
    if (this.scatterChart) {
      this.scatterChart.destroy();
    }

    const ctx = this.scatterChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const resumen = new Map<string, { precio: number; unidadesVendidas: number }>();

    this.pedidosEntrantes.forEach((pedido) => {
      pedido.Productos.forEach((producto) => {
        const nombre = producto.nombre;
        const cantidad = producto.ProductoPedido.cantidad;
        const precio = producto.precio;

        if (!resumen.has(nombre)) {
          resumen.set(nombre, { precio, unidadesVendidas: cantidad });
        } else {
          const acumulado = resumen.get(nombre)!;
          acumulado.unidadesVendidas += cantidad;
        }
      });
    });

    const datosScatter = Array.from(resumen.values()).map((item) => ({
      x: item.precio,
      y: item.unidadesVendidas,
    }));

    this.scatterChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Precio vs Unidades Vendidas',
            data: datosScatter,
            backgroundColor: '#5dade2',
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Relación Precio - Unidades Vendidas',
            font: { size: 18 },
            padding: { bottom: 10 },
          },
          tooltip: {
            callbacks: {
              label: (context) => `Precio: ${context.parsed.x}, Unidades: ${context.parsed.y}`,
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Precio (€)' },
          },
          y: {
            title: { display: true, text: 'Unidades Vendidas' },
            beginAtZero: true,
          },
        },
      },
    });
  }

  generarColores(cantidad: number) {
    const colores = [
      '#FF6384',
      '#5DADE2',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#C9CBCF',
      '#8B0000',
      '#228B22',
      '#00008B',
    ];
    return Array.from({ length: cantidad }, (_, i) => colores[i % colores.length]);
  }

  getColor(index: number, alpha: number) {
    const baseColors = [
      '255, 99, 132', // rojo
      '54, 162, 235', // azul
      '255, 206, 86', // amarillo
      '75, 192, 192', // verde azulado
      '153, 102, 255', // morado
      '255, 159, 64', // naranja
    ];
    const color = baseColors[index % baseColors.length];
    return `rgba(${color}, ${alpha})`;
  }
}
