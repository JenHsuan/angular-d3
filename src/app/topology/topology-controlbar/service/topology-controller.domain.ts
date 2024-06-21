import { TopologyNodeType } from "../../service/topology.domain";

export class TopologyController {
  type: TopologyContollerType;
  statusType: TopologyStatusType;
  name?: string;
}

export type TopologyStatusType = TopologyNodeType | TopologyAssistantType;

export enum TopologyContollerType {
  GROUP = 'GROUP',
  ASSISTANT = 'ASSISTANT'
}

export enum TopologyAssistantType {
  CONTROL_POINT = 'control point',
  NONE = 'none'
}

export const topologyControllerGroupingItemsTemplate: TopologyController[] = [
  {
    type: TopologyContollerType.GROUP,
    statusType: TopologyNodeType.Agggregated,
    name: "Group by ISP"
  }, {
    type: TopologyContollerType.GROUP,
    statusType: TopologyNodeType.Individual,
    name: "No Grouping"
  }
];

export const topologyControllerAssistantItemsTemplate: TopologyController[] = [
  {
    type: TopologyContollerType.ASSISTANT,
    statusType: TopologyAssistantType.CONTROL_POINT,
    name: "Display Control Points"
  }, {
    type: TopologyContollerType.ASSISTANT,
    statusType: TopologyAssistantType.NONE,
    name: "No Assistant Items Displaying"
  }
];