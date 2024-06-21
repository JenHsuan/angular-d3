import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Observable, Subject, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs';
import * as _ from 'lodash';

import { TopologyCommand, TopologyCommandInvoker } from '../../service/topology.command';
import { TopologyAssistantType, TopologyContollerType, TopologyController, TopologyStatusType } from '../service/topology-controller.domain';
import { TopologyControlbarAssistantService } from './service/topology-controlbar-assistant.service';
import { TOPOLOGY_ASSISTANT_DELAY } from './service/topology-controlbar-assistant.domain';

type ValueType = TopologyController;

@Component({
  selector: 'app-topology-controlbar-assistant',
  templateUrl: './topology-controlbar-assistant.component.html',
  styleUrls: ['./topology-controlbar-assistant.component.scss']
})
export class TopologyControlbarAssistantComponent implements OnInit, OnDestroy, TopologyCommandInvoker {
  /**
   * Options displayed in ng-select
   */
  options: TopologyController[];

  selection: ValueType;

  /**
   * Subject for search input changes
   */
  searchInput = new Subject<string>();
  
  /**
   * Subject for selection finalization (when the ng-select is closed or cleared)
   */
  selectionFinalizedSubject = new Subject<void>();

  configurationType = TopologyContollerType.ASSISTANT

  @Input() undoConfiguration$?: Observable<TopologyCommand | null>;
  @Input() resetConfiguration$?: Observable<boolean | null>;

  @Input()
  emptySearchReturnsData: boolean = true;
  
  @Output() configurationEventChanged = new EventEmitter<TopologyController>();

  makeCommand: (statusType: TopologyStatusType) => TopologyCommand;

  commandStack: TopologyCommand[];

  loading: boolean = false;

  protected destroyed = new Subject<void>();
  
  constructor(
    protected service: TopologyControlbarAssistantService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.initSelectOptions();

    this.registerSelectionFinalized();
    this.registerUndo();
    this.registerReset();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
  }

  protected initSelectOptions() {
    this.loadOptions();
  }
  
  private loadOptions() {
    this.searchInput.pipe(
        filter(query => !_.isNil(query) || !_.isEmpty(query) || this.emptySearchReturnsData),
        distinctUntilChanged(),
        debounceTime(TOPOLOGY_ASSISTANT_DELAY),
        switchMap(query => this.service.list()
      ),
      tap(() => {
        this.loading = false;
        this.changeDetector.detectChanges();
      }),
      takeUntil(this.destroyed),
    ).subscribe(
      (options: TopologyController[]) => {
        this.options = options;
        this.changeDetector.detectChanges();
      }
    );
  }
  
  private registerSelectionFinalized() {
    this.selectionFinalizedSubject.pipe(
      takeUntil(this.destroyed),
      map(() => this.selection),
      filter(selection => !!selection)
    ).subscribe(
      (selection: ValueType) => {
        if (!_.isNil(this.makeCommand)) {
          let statusType = !_.isNil(selection) ? selection.statusType as TopologyAssistantType : TopologyAssistantType.NONE;

          const command = this.makeCommand(statusType)
          command.execute();

          this.registerCommand(command);
        }
      }
    );
  }

  private registerUndo() {
    this.undoConfiguration$?.pipe(
      filter(command => !!command),
      takeUntil(this.destroyed)
    ).subscribe((command: TopologyCommand | null) => {
      command = command as TopologyCommand;

      if (_.isNil(this.commandStack) || this.commandStack.length === 0 || _.isNil(this.options)) {
        return;
      }

      if (command.type === this.configurationType) {
        //recover the grouping
        this.removeLatestCommand();
        const lastGroupConfig = this.commandStack.find(command => command.type === TopologyContollerType.GROUP);
        if (!_.isNil(lastGroupConfig)) {
          this.selection = this.options.find(item => item.statusType === lastGroupConfig.statusType)!;
        } else {
          this.selection = this.options.find(item => item.statusType === TopologyAssistantType.NONE)!;
        }

        this.changeDetector.detectChanges();

        if (!_.isNil(this.makeCommand)) {
          const command = this.makeCommand(this.selection.statusType);
          command.execute();
        }
      }
    });
  }

  private registerReset() {
    this.resetConfiguration$?.pipe(
      filter(shouldReset => !!shouldReset),
      takeUntil(this.destroyed)
    ).subscribe((shouldReset: boolean | null) => {
      shouldReset = shouldReset as boolean;
      if (!_.isNil(this.options)) {
        //recover the grouping
        this.selection = this.options.find(item => item.statusType === TopologyAssistantType.NONE)!;
          
        this.changeDetector.detectChanges();

        if (!_.isNil(this.makeCommand)) {
          const command = this.makeCommand(this.selection.statusType);
          command.execute();
        }
      }
    });
  }
  onOpen() {
    this.searchInput.next('');
  }

  finalizeSelection() {
    this.selectionFinalizedSubject.next();
  }

  selectPlaceholderText(): string {
    return "No Assistant Items Displaying";
  }

  setCommandStack(commandStack: TopologyCommand[]) {
    this.commandStack = commandStack;
  }

  setMakeCommand(makeCommand: (statusType: TopologyStatusType) => TopologyCommand) {
    this.makeCommand = makeCommand;
  }

  registerCommand(command: TopologyCommand) {
    if (!_.isNil(this.commandStack)) {
      this.commandStack.unshift(command);
    }
  }

  removeLatestCommand() {
    if (!_.isNil(this.commandStack)) {
      this.commandStack.shift();
    }
  }

}
