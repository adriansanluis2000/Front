import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaProductosComponent } from './lista-productos.component';
import { HttpClientModule } from '@angular/common/http';

describe('ListaProductosComponent', () => {
  let component: ListaProductosComponent;
  let fixture: ComponentFixture<ListaProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ListaProductosComponent,
        HttpClientModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ListaProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
