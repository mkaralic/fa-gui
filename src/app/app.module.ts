// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
// importujemo SocketIoModule i SocketIoConfig iz ngx-socket-io biblioteke
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { FaApiService } from './services/fa-api.service';

// konfiguracija za SocketIoModule koja sadrzi URL servera koji emituje dogadjaje
const config: SocketIoConfig = { url: 'http://localhost:5000', options: {} };

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    // dodajemo SocketIoModule u imports niz i prosledjujemo mu konfiguraciju sa URL/om servera koji emituje dogadjaje
    SocketIoModule.forRoot(config)
  ],
  providers: [FaApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
