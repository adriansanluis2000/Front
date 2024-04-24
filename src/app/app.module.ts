import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { ProductoService } from './services/productos.service';

@NgModule({
    declarations: [
        AppComponent  // Declarar AppComponent
    ],
    imports: [
        BrowserModule,  // Módulo necesario para aplicaciones que corren en un navegador
        HttpClientModule // Módulo para realizar peticiones HTTP
    ],
    providers: [ProductoService], // Servicios que se proveen a toda la aplicación
    bootstrap: [AppComponent] // Componente raíz que Angular crea e inserta en el índice.html
})
export class AppModule { }
