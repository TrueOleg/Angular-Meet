import {BrowserModule} from '@angular/platform-browser';
import {Injectable, NgModule} from '@angular/core';
import {Socket, SocketIoConfig, SocketIoModule} from 'ngx-socket-io';

import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {MeetService} from './meet.service';

const config = {url: 'http://localhost:3000', options: {}};


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SocketIoModule.forRoot(config),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    MeetService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
