import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopologyControlbarComponent } from './topology/topology-controlbar/topology-controlbar.component';
import { LoadingIndicatorComponent } from './topology/topology-path-loading/topology-path-loading-indicator/topology-path-loading-indicator.component';
import { TopologyControlbarHighlightComponent } from './topology/topology-controlbar/topology-controlbar-highlight/topology-controlbar-highlight.component';
import { TopologyControlbarGroupComponent } from './topology/topology-controlbar/topology-controlbar-group/topology-controlbar-group.component';

@NgModule({
  declarations: [
    AppComponent,
    TopologyControlbarComponent,
    LoadingIndicatorComponent,
    TopologyControlbarHighlightComponent,
    TopologyControlbarGroupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
