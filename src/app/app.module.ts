import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopologyControlbarComponent } from './topology/topology-controlbar/topology-controlbar.component';
import { LoadingIndicatorComponent } from './topology/topology-path-loading/topology-path-loading-indicator/topology-path-loading-indicator.component';

@NgModule({
  declarations: [
    AppComponent,
    TopologyControlbarComponent,
    LoadingIndicatorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
