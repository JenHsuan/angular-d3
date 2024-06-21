import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { TopologyService } from './topology/service/topology.service';
import { EDGE_BORDER_COLOR_DEFAULT, EDGE_BORDER_WIDTH_DEFAULT, LABEL_FONT_FAMILY_DEFAULT, LABEL_FONT_SIZE_DEFAULT, LABEL_FONT_SIZE_GROUP, LOADING_DELAY, NODE_BORDER_WIDTH_DEFAULT, NODE_RADIUS, PATH_ROOT_MARGIN_BOTTOM, PATH_ROOT_MARGIN_LEFT, PATH_ROOT_MARGIN_RIGHT, PATH_ROOT_MARGIN_TOP, TopoAddregatedNode, TopoEdge, TopoLegend, TopoNode, TopologyControlType, TopologyGeometryType, TopologyNodeType, groupColorMap } from './topology/service/topology.domain';
import { BehaviorSubject, Subject, delay, filter, switchMap, takeUntil, tap } from 'rxjs';
import { LoadingService } from './topology/topology-path-loading/loading.service';
import { TopologyComponent } from './topology/topology.component';
import { TopologyControlbarGroupComponent } from './topology/topology-controlbar/topology-controlbar-group/topology-controlbar-group.component';
import { TopologyCommand, TopologyCommandInvoker } from './topology/service/topology.command';
import { TopologyStatusType } from './topology/topology-controlbar/service/topology-controller.domain';
import { TopologyControlbarAssistantComponent } from './topology/topology-controlbar/topology-controlbar-assistant/topology-controlbar-assistant.component';

const D3_ROOT_ELEMENT_ID = "root";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit{
  nodeTypeChangedSubject = new BehaviorSubject<TopologyControlType | undefined>(undefined);

  @ViewChild(TopologyComponent) commandReceiver: TopologyComponent;
  @ViewChild(TopologyControlbarGroupComponent) groupCommandInvoker: TopologyControlbarGroupComponent;
  @ViewChild(TopologyControlbarAssistantComponent) assistantCommandInvoker: TopologyControlbarAssistantComponent;
  
  protected destroyed = new Subject<void>();
  
  commandStack: TopologyCommand[] = [];

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroyed.next();
  }

  ngAfterViewInit() {
    this.setCommandStack(this.groupCommandInvoker, this.commandStack);
    this.setMakeCommand(this.groupCommandInvoker);


    this.setCommandStack(this.assistantCommandInvoker, this.commandStack);
    this.setMakeCommand(this.assistantCommandInvoker);
  }

  setCommandStack(invoker: TopologyCommandInvoker, commandStack: TopologyCommand[]) {
    invoker.setCommandStack(commandStack);
   }
 
   setMakeCommand(invoker: TopologyCommandInvoker) {
     invoker.setMakeCommand(this.makeCommand.bind(this));
   }

   private makeCommand(statusType: TopologyStatusType): TopologyCommand {
    return new TopologyCommand(this.commandReceiver, statusType);
  }
}