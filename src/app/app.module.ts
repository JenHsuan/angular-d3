import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgSelectModule } from '@ng-select/ng-select';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopologyControlbarComponent } from './topology/topology-controlbar/topology-controlbar.component';
import { LoadingIndicatorComponent } from './topology/topology-path-loading/topology-path-loading-indicator/topology-path-loading-indicator.component';
import { TopologyControlbarGroupComponent } from './topology/topology-controlbar/topology-controlbar-group/topology-controlbar-group.component';
import { TopologyComponent } from './topology/topology.component';
import { TopologyControlbarAssistantComponent } from './topology/topology-controlbar/topology-controlbar-assistant/topology-controlbar-assistant.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    TopologyControlbarComponent,
    LoadingIndicatorComponent,
    TopologyControlbarGroupComponent,
    TopologyComponent,
    TopologyControlbarAssistantComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    
    NgSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
