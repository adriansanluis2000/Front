import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { PedidoService } from '../../services/pedido.service';
import { ElementRef, PLATFORM_ID } from '@angular/core';
import { Pedido } from '../../models/pedido.model';
import { of } from 'rxjs';
import { Chart } from 'chart.js';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let pedidoServiceSpy: jasmine.SpyObj<PedidoService>;

  const mockPedidosEntrantes: Pedido[] = [
    {
      id: 1,
      fecha: '2024-11-12T10:00:00',
      precioTotal: 100,
      tipo: 'entrante',
      Productos: [{ id: 1, nombre: 'Gafas', precio: 50, stock: 30, ProductoPedido: { cantidad: 2 } }],
    },
    {
      id: 2,
      fecha: '2024-11-11T15:00:00',
      precioTotal: 50,
      tipo: 'entrante',
      Productos: [{ id: 1, nombre: 'Gafas', precio: 50, stock: 30, ProductoPedido: { cantidad: 2 } }],
    },
    {
      id: 3,
      fecha: '2024-11-10T09:00:00',
      precioTotal: 200,
      tipo: 'entrante',
      Productos: [{ id: 1, nombre: 'Gafas', precio: 50, stock: 30, ProductoPedido: { cantidad: 2 } }],
    },
  ];

  const mockPedidosSalientes: Pedido[] = [
    {
      id: 4,
      fecha: '2024-11-09T12:00:00',
      precioTotal: 120,
      tipo: 'saliente',
      Productos: [
        { id: 2, nombre: 'Lentes de Sol', precio: 60, stock: 20, ProductoPedido: { cantidad: 1 } },
        { id: 3, nombre: 'Estuche', precio: 30, stock: 50, ProductoPedido: { cantidad: 2 } },
      ],
    },
    {
      id: 5,
      fecha: '2024-11-08T14:30:00',
      precioTotal: 80,
      tipo: 'saliente',
      Productos: [{ id: 4, nombre: 'Gafas Redondas', precio: 40, stock: 15, ProductoPedido: { cantidad: 2 } }],
    },
    {
      id: 6,
      fecha: '2024-11-07T10:15:00',
      precioTotal: 150,
      tipo: 'saliente',
      Productos: [{ id: 5, nombre: 'Gafas Cuadradas', precio: 75, stock: 10, ProductoPedido: { cantidad: 2 } }],
    },
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PedidoService', ['obtenerHistorialPedidos']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: PedidoService, useValue: spy },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    pedidoServiceSpy = TestBed.inject(PedidoService) as jasmine.SpyObj<PedidoService>;
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('ngOnInit debe obtener los pedidos y ejecutar cálculos y gráficos', fakeAsync(() => {
    pedidoServiceSpy.obtenerHistorialPedidos.withArgs('entrante').and.returnValue(of(mockPedidosEntrantes));
    pedidoServiceSpy.obtenerHistorialPedidos.withArgs('saliente').and.returnValue(of(mockPedidosSalientes));

    spyOn(component, 'sumarUnidadesVendidas').and.callThrough();
    spyOn(component, 'calcularBeneficioPorProducto').and.callThrough();
    spyOn(component, 'calcularKPIs').and.callThrough();
    spyOn(component, 'crearGraficoPie').and.callThrough();
    spyOn(component, 'crearGraficoBarrasApiladas').and.callThrough();
    spyOn(component, 'crearGraficoDispersion').and.callThrough();

    component.ngOnInit();

    tick();

    expect(pedidoServiceSpy.obtenerHistorialPedidos).toHaveBeenCalledWith('entrante');
    expect(pedidoServiceSpy.obtenerHistorialPedidos).toHaveBeenCalledWith('saliente');

    expect(component.pedidosEntrantes).toEqual(mockPedidosEntrantes);
    expect(component.pedidosSalientes).toEqual(mockPedidosSalientes);

    expect(component.sumarUnidadesVendidas).toHaveBeenCalledWith(mockPedidosEntrantes);
    expect(component.calcularBeneficioPorProducto).toHaveBeenCalledWith(mockPedidosEntrantes);

    expect(component.calcularKPIs).toHaveBeenCalled();
    expect(component.crearGraficoPie).toHaveBeenCalled();
    expect(component.crearGraficoBarrasApiladas).toHaveBeenCalled();
    expect(component.crearGraficoDispersion).toHaveBeenCalled();
  }));

  it('crearGraficoPie debe destruir el gráfico anterior si pieChart existe', () => {
    const destroySpy = jasmine.createSpy('destroy');
    component.pieChart = { destroy: destroySpy } as unknown as Chart;

    component.crearGraficoPie();

    expect(destroySpy).toHaveBeenCalled();
    expect(component.pieChart).toBeTruthy();
  });

  it('crearGraficoPie no debe continuar si getContext devuelve null', () => {
    // Preparamos un pieChartRef con getContext null
    component.pieChartRef = {
      nativeElement: {
        getContext: () => null,
      },
    } as any;

    // Predefinimos pieChart para ver si se destruye o no
    component.pieChart = {
      destroy: jasmine.createSpy('destroy'),
    } as any;

    // Ejecutamos
    component.crearGraficoPie();

    expect(component.pieChart).not.toBeNull(); // Se mantiene igual
  });

  it('crearGraficoBarrasApiladas debe destruir el gráfico anterior si stackedBarChart existe', () => {
    const destroySpy = jasmine.createSpy('destroy');
    component.stackedBarChart = { destroy: destroySpy } as unknown as Chart;

    component.crearGraficoBarrasApiladas();

    expect(destroySpy).toHaveBeenCalled();
    expect(component.stackedBarChart).toBeTruthy();
  });

  it('crearGraficoBarrasApiladas no debe continuar si getContext devuelve null', () => {
    // Preparamos un scatterChartRef con getContext null
    component.stackedBarChartRef = {
      nativeElement: {
        getContext: () => null,
      },
    } as any;

    // Predefinimos scatterChart para ver si se destruye o no
    component.stackedBarChart = {
      destroy: jasmine.createSpy('destroy'),
    } as any;

    // Ejecutamos
    component.crearGraficoBarrasApiladas();

    expect(component.stackedBarChart).not.toBeNull(); // Se mantiene igual
  });

  it('crearGraficoDispersion debe destruir el gráfico anterior si scatterChart existe', () => {
    const destroySpy = jasmine.createSpy('destroy');
    component.scatterChart = { destroy: destroySpy } as unknown as Chart;

    component.crearGraficoDispersion();

    expect(destroySpy).toHaveBeenCalled();
    expect(component.scatterChart).toBeTruthy();
  });

  it('crearGraficoDispersion no debe continuar si getContext devuelve null', () => {
    // Preparamos un scatterChartRef con getContext null
    component.scatterChartRef = {
      nativeElement: {
        getContext: () => null,
      },
    } as any;

    // Predefinimos scatterChart para ver si se destruye o no
    component.scatterChart = {
      destroy: jasmine.createSpy('destroy'),
    } as any;

    // Ejecutamos
    component.crearGraficoDispersion();

    expect(component.scatterChart).not.toBeNull(); // Se mantiene igual
  });
});
