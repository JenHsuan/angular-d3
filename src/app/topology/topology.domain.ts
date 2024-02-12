export class TopoNode {
  label: string;
  x?: number;
  y?: number;
  id?: string;
  rowIndex?: number;
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