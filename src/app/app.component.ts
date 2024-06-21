import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';

import { BehaviorSubject, Subject, delay, filter, switchMap, takeUntil, tap } from 'rxjs';

import { TopologyComponent } from './topology/topology.component';
import { TopologyControlbarGroupComponent } from './topology/topology-controlbar/topology-controlbar-group/topology-controlbar-group.component';
import { TopologyCommand, TopologyCommandInvoker } from './topology/service/topology.command';
import { TopologyStatusType } from './topology/topology-controlbar/service/topology-controller.domain';
import { TopologyControlbarAssistantComponent } from './topology/topology-controlbar/topology-controlbar-assistant/topology-controlbar-assistant.component';
import { TopologyControlType } from './topology/service/topology.domain';

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
  
  protected undoConfigurationSubject = new BehaviorSubject<TopologyCommand | null>(null);
  undoConfiguration$ = this.undoConfigurationSubject.asObservable();

  protected resetConfigurationSubject = new BehaviorSubject<boolean | null>(null);
  resetConfiguration$ = this.resetConfigurationSubject.asObservable();

  protected destroyed = new Subject<void>();
  
  commandStack: TopologyCommand[] = [];

  get isUndoButtonDisplayed(): boolean {
    return this.commandStack.length > 0;
  }

  get undoButtonText() {
    return `Undo (${this.commandStack.length})`;
  }

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

  protected onUndoButtonClicked() {
    if (this.commandStack.length === 0) {
      return;
    }
    this.undoConfigurationSubject.next(this.commandStack[0]);
  }

  protected onResetButtonClicked() {
    const length = this.commandStack.length;
    for (let i = 0; i < length; i++) {
      this.commandStack.pop();
    }

    this.resetConfigurationSubject.next(true);
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