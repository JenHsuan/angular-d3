import * as _ from 'lodash';

import { TopologyAssistantType, TopologyContollerType, TopologyController, TopologyStatusType, topologyControllerAssistantItemsTemplate, topologyControllerGroupingItemsTemplate } from "../topology-controlbar/service/topology-controller.domain";
import { TopologyNodeType } from './topology.domain';

export class TopologyCommand implements TopologyICommand {
  receiver: TopologyCommandReceiver;
  statusType: TopologyStatusType;
  
  configurationItems = _.cloneDeep(
    [
      ...topologyControllerGroupingItemsTemplate,
      ...topologyControllerAssistantItemsTemplate
    ]);
  
  constructor(receiver: TopologyCommandReceiver, statusType: TopologyStatusType) {
    this.receiver = receiver;
    this.statusType = statusType;
  }

  get currentConfigurationItem(): TopologyController | undefined {
    return this.configurationItems.find(item => item.statusType === this.statusType);
  }

  get type(): TopologyContollerType | undefined {
    return this.currentConfigurationItem?.type;
  }

  execute() {
    if (!_.isNil(this.currentConfigurationItem)) {
      const func = commandMap.get(this.currentConfigurationItem.statusType!);
      if (!_.isNil(func)) {
        func(this.currentConfigurationItem, this.receiver);
      }
    }
  }
}

export interface TopologyCommandReceiver {
  groupNodes(topologyLegendItem: TopologyController);
  renderAssistantItems(topologyLegendItem: TopologyController);
}
    
export interface TopologyCommandInvoker {
  setCommandStack(commandStack: TopologyCommand[]);
  setMakeCommand(makeCommand: (statusType: TopologyStatusType) => TopologyCommand);
  registerCommand(command: TopologyCommand);
  removeLatestCommand();
}
    
export interface TopologyICommand {
  execute();
}

export const commandMap = new Map<TopologyStatusType, (topologyLegendItem: TopologyController, receiver: TopologyCommandReceiver) => void>([
  [TopologyNodeType.Agggregated, (topologyLegendItem, receiver) => receiver.groupNodes(topologyLegendItem)],
  [TopologyNodeType.Individual, (topologyLegendItem, receiver) => receiver.groupNodes(topologyLegendItem)],
  [TopologyAssistantType.CONTROL_POINT, (topologyLegendItem, receiver) => receiver.renderAssistantItems(topologyLegendItem)],
  [TopologyAssistantType.NONE, (topologyLegendItem, receiver) => receiver.renderAssistantItems(topologyLegendItem)]
]);
  
    