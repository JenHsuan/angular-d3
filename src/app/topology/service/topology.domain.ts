export type TopoNode = TopoIndividualNode | TopoAddregatedNode;

export type TopoIndividualNode = {
  label: string;
  x?: number;
  y?: number;
  id?: string;

  type: TopologyNodeType.Individual;
  rowIndex?: number;
}

export type TopoAddregatedNode = {
  label: string;
  x?: number;
  y?: number;
  id?: string;
  type: TopologyNodeType.Agggregated;

  aggregatedNodesCount: number;
}

export class TopoEdge {
  source: TopoNode;
  target: TopoNode;
  id?: string;
}

export enum TopologyGeometryType {
  NODE = 'NODE',
  EDGE = 'EDGE'
}

export class TopoLegend {
  geometryType: TopologyGeometryType;
  legendTitle: string;
  legendIconBorderColor: string;
}

export enum TopologyNodeType {
  Individual = 'Individual',
  Agggregated = 'Agggregated'
}