export interface TopoNodeDragEvent {
  node: d3.HierarchyPointNode<TopoNode>;
  x: number;
  y: number;
}

export interface TopoNodeRemoveEvent {
  node: d3.HierarchyPointNode<TopoNode>;
}

export class PriorityQueueItem {
  weight: number;
  fromNode: string | null;
  toNode: string | null;
}

export class PriorityQueueMinQueue {
  private heap: PriorityQueueItem[] = [];
  private nodeToIndex: Map<string, number>;

  constructor() {
    this.nodeToIndex = new Map();
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  push(item: PriorityQueueItem) {
    const key = `${item.fromNode}-${item.toNode}`;
    if (this.nodeToIndex.has(key)) {
      this.decreaseKey(item);
    } else {
      const index = this.heap.length;
      this.heap.push(item);
      this.nodeToIndex.set(key, index);
      this.swim(this.heap.length - 1);
    }
  }

  pop(): PriorityQueueItem | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    //the first item is the min
    const min = this.heap[0];

    //pop the last item
    const last = this.heap.pop();

    if (last !== undefined) {
      this.nodeToIndex.delete(`${min.fromNode}-${min.toNode}`);

      if (this.heap.length > 0) {
        this.heap[0] = last;

        //sink from the first item
        this.sink(0);
      }
    }

    return min;
  }

  decreaseKey(item: PriorityQueueItem) {
    const key = `${item.fromNode}-${item.toNode}`;
    const index = this.nodeToIndex.get(key);
    if (index === undefined) {
      return;
    }

    if (this.heap[index].weight <= item.weight) {
      return;
    }

    this.heap[index].weight = item.weight;
    this.swim(index);
  }

  //swim from children to parent until arriving the top
  private swim(k: number) {
    while (k > 0) {
      const parent = Math.floor((k - 1) / 2);
      if (this.heap[k].weight >= this.heap[parent].weight) {
        break;
      }

      this.swap(k, parent);

      k = parent;
    }
  }

  //sink the top node
  private sink(k: number) {
    const length = this.heap.length;
    while (true) {
      //left child
      const left = 2 * k + 1;
      //right child
      const right = 2 * k + 2;

      //if the child is smaller, swap with the parent
      let smallest = k;

      if (left < length && this.heap[left].weight < this.heap[smallest].weight) {
        smallest = left;
      }

      if (right < length && this.heap[right].weight < this.heap[smallest].weight) {
        smallest = right;
      }

      if (smallest === k) {
        break;
      }

      this.swap(smallest, k);
      k = smallest;
    }
  }

  private swap(i: number, j: number) {
    let tmp: PriorityQueueItem = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = tmp;

    this.nodeToIndex.set(`${this.heap[i].fromNode}-${this.heap[i].toNode}`, i);
    this.nodeToIndex.set(`${this.heap[j].fromNode}-${this.heap[j].toNode}`, j);
  }
}

export class Topology {
  nodes: TopoNode[];
  edges: TopoEdge[];
}

export class TopoNode {
  label: string;
  id: string;
  group: number;

  descriptions?: string[];

  isRoot?: boolean;

  //virtual field
  children?: TopoNode[];

  //virtual field
  _children?: d3.HierarchyPointNode<TopoNode>[];

  //virtual field  
  isVisited?: boolean;
  
  //virtual field
  isExpanded?: boolean;

  //virtual field
  top?: number;

  //virtual field
  bottom?: number;
}


export class TopoEdge {
  source: TopoNode;
  target: TopoNode;
  id?: string;

  weight?: number;
  isFilteredByMst?: boolean;
}

export class TopologyVirtualEdge {
  id: string;
  sourceX?: number;
  sourceY?: number;
  destinationX?: number;
  destinationY?: number;
  isFilteredByMst?: boolean;
}


export enum TopologyGeometryType {
  NODE = 'NODE',
  EDGE = 'EDGE'
}

export class TopoLegend {
  geometryType: TopologyGeometryType;
  legendTitle: string;
  legendIconBorderColor: string;
  onClick: () => void;
  isHighlighted: boolean;
}

export enum TopologyNodeType {
  Individual = 'Individual',
  Agggregated = 'Agggregated'
}

export const groupColorMap = new Map<number, string>([
  [1, "#597b8b"],
  [3, "#534710"],
  [4, "#6e4b1c"],
  [5, "#d28b5f"],
  [6, "#8c4a03"],
  [7, "#cbb583"],
  [8, "#ad73c4"],
  [9, "#b8a1cc"],
  [2, "#603059"]
]);

export enum TopologyControlType {
  agregration = 'aggregation',
  contolPoint = 'contolPoint'
}

export const PATH_ROOT_MARGIN_TOP = 50;
export const PATH_ROOT_MARGIN_LEFT = 150;
export const PATH_ROOT_MARGIN_RIGHT = 10;
export const PATH_ROOT_MARGIN_BOTTOM = 10;
export const CHART_ANIMATION_DURATION = 500;

//legend
export const LEGEND_LEFT = -50;
export const LEGEND_TOP = -30;
export const LEGEND_TITLE_LENGTH = 220;
export const LEGEND_TITLE_FONT_WEIGHT_DEFAULT = 300;
export const LEGEND_TITLE_FONT_WEIGHT_HIGHLIGHTED = 800;
export const LEGEND_ICON_RADIUS = 7;
export const LEGEND_LINE_LENGTH = 15;
export const LEGEND_FONT_SIZE = "20px";

//node
export const NODE_RADIUS = 12;
export const NODE_ICON_LENGTH = 20;
export const NODE_BACKGROUND_DEFAULT = "#fff";
export const NODE_BORDER_COLOR_DEFAULT = "#000";
export const NODE_BORDER_WIDTH_DEFAULT = 1;
export const NODE_BORDER_WIDTH_HIGHLIGHTED = 2;

//edge
export const EDGE_BORDER_WIDTH_DEFAULT = 3;
export const EDGE_BORDER_COLOR_DEFAULT = "#999";
export const LABEL_FONT_SIZE_DEFAULT = "18px";
export const LABEL_FONT_SIZE_GROUP = "24px";

//label
export const LABEL_FONT_FAMILY_DEFAULT = "Arial ";
export const LABEL_X_SHIFT = -2;
export const LABEL_Y_SHIFT = 10;
export const LOADING_DELAY = 300;
export const CHART_LAYER_DISTANCE_LOWER_BOUND = 350;

//events
export enum TopologyMouseEventType {
  CLICK_EVENT = "click",
  DBCLICK_EVENT = "dblclick",
  MOUSEOVER_EVENT = "mouseover",
  MOUSEENTER_EVENT = "mouseenter",
  MOUSEOUT_EVENT = "mouseout",
  MOUSELEAVE_EVENT = "mouseleave",
  DRAG_EVENT = "drag",
  ZOOM_EVENT = "zoom",
  WHEEL_EVENT = "wheel",
  DRAG = "drag",
  START = "start",
  END = "end"
}

export const DRAG_DEBOUNCE_TIME = 5;

//port table
export const TABLE_COL_Y_SHIFT = 80;
export const TABLE_COL_HEIGHT = 30;
export const TABLE_COL_INDENT_LEVEL_HEIGHT = 20;
export const TABLE_COL_MARGIN_LEFT = 10;
export const TABLE_X = -90;
export const TABLE_Y = -15;
export const TABLE_WIDTH = 200;
export const TABLE_TEXT_X = 20;
export const TABLE_TEXT_Y = 5;
export const TABLE_ICON_Y = 8;
export const TABLE_BORDER = '#cecece';
export const TABLE_BACKGROUND = '#fff';

//defs
export const DEFS_FILTER_COLOR = "#FFBF00";
export const DEFS_FILTER_DEVIATION = 2;