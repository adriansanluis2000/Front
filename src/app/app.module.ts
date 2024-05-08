import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ProductoService } from './services/producto.service';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [],
    imports: [
        BrowserModule,  // Módulo necesario para aplicaciones que corren en un navegador
        HttpClientModule, // Módulo para realizar peticiones HTTP
        FormsModule      // Módulo para trabajar con formularios y validaciones de campos
    ],
    providers: [ProductoService], // Servicios que se proveen a toda la aplicación
    bootstrap: []
})
export class AppModule { }
