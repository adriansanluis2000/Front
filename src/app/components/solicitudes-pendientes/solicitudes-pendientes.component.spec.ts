import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitudesPendientesComponent } from './solicitudes-pendientes.component';
import { HttpClientModule } from '@angular/common/http';

describe('SolicitudesPendientesComponent', () => {
  let component: SolicitudesPendientesComponent;
  let fixture: ComponentFixture<SolicitudesPendientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesPendientesComponent, HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudesPendientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
