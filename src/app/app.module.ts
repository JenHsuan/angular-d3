import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopologyControlbarComponent } from './topology/topology-controlbar/topology-controlbar.component';
import { LoadingIndicatorComponent } from './topology/topology-path-loading/topology-path-loading-indicator/topology-path-loading-indicator.component';
import { TopologyDisplayControllerComponent } from './topology/topology-display-controller/topology-display-controller.component';

@NgModule({
  declarations: [
    AppComponent,
    TopologyControlbarComponent,
    LoadingIndicatorComponent,
    TopologyDisplayControllerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
