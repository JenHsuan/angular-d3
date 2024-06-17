import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { BehaviorSubject, Subject, delay, filter, switchMap, takeUntil, tap } from 'rxjs';
import { TopologyService } from '../service/topology.service';
import { LoadingService } from '../topology-path-loading/loading.service';
import { EDGE_BORDER_COLOR_DEFAULT, EDGE_BORDER_WIDTH_DEFAULT, LABEL_FONT_FAMILY_DEFAULT, LABEL_FONT_SIZE_DEFAULT, LABEL_FONT_SIZE_GROUP, LOADING_DELAY, NODE_BORDER_WIDTH_DEFAULT, NODE_RADIUS, PATH_ROOT_MARGIN_BOTTOM, PATH_ROOT_MARGIN_LEFT, PATH_ROOT_MARGIN_RIGHT, PATH_ROOT_MARGIN_TOP, TopoEdge, TopoNode, TopologyControlType, TopologyNodeType, groupColorMap } from '../service/topology.domain';

const D3_ROOT_ELEMENT_ID = "root";
@Component({
  selector: 'app-topology',
  templateUrl: './topology.component.html',
  styleUrls: ['./topology.component.scss']
})
export class TopologyComponent {
  title = 'angular-d3';
  width: number;
  height: number;
  edges: TopoEdge[];
  nodes: TopoNode[];

  @Input() nodeTypeChangedSubject: BehaviorSubject<TopologyControlType | undefined>;

  @ViewChild(`${D3_ROOT_ELEMENT_ID}`, {read: ElementRef}) root: ElementRef | undefined; 
  fetchEventSubject = new BehaviorSubject<TopologyNodeType | null>(null);
  fetchEvent$ = this.fetchEventSubject.asObservable();
  
  private renderGraphEventSubject = new BehaviorSubject<boolean>(false);
  private destroyedSubject = new Subject<void>();

  private currentFetchType = TopologyNodeType.Individual;
  private shouldDisplayControlPoints = false;
  displayControlPointsSubject = new BehaviorSubject<boolean>(this.shouldDisplayControlPoints);
  displayControlPoints$ = this.displayControlPointsSubject.asObservable();

  typeCastMap = new Map<TopologyNodeType, (node: TopoNode) => string>([
    [TopologyNodeType.Individual, (node) => {
      return ""
    }],
    [TopologyNodeType.Agggregated, (node) => {
      return node.type === TopologyNodeType.Agggregated ? node.aggregatedNodesCount!.toString() : "";
    }]
  ])

  controlMap = new Map<TopologyControlType, () => void>([
    [
      TopologyControlType.agregration,
      () => {
        this.currentFetchType = this.currentFetchType === TopologyNodeType.Individual ? TopologyNodeType.Agggregated : TopologyNodeType.Individual;
        this.fetchEventSubject.next(this.currentFetchType);
      }
    ],
    [
      TopologyControlType.contolPoint,
      () => {
        this.displayControlPointsSubject.next(true);
      }
    ]
  ]);

  constructor(
    private topologyService: TopologyService,
    private loadingService: LoadingService,
    private cd: ChangeDetectorRef
  ) {
    this.fetchEvent$.pipe(
      filter(type => !!type),
      takeUntil(this.destroyedSubject),
      tap(() => this.loadingService.loadingOn()),
      switchMap(type => this.topologyService.list(type!)),
      delay(LOADING_DELAY),
      tap(() => this.loadingService.loadingOff()),
    ).subscribe(data =>{
      // Clean items on svg
      this.cleanItemsOnSvg();
      this.edges = data;
      this.renderGraphEventSubject.next(this.shouldDisplayControlPoints);
    })

    this.displayControlPoints$.subscribe((val) => {
      if (val) {
        this.shouldDisplayControlPoints = !this.shouldDisplayControlPoints;
        this.fetchEventSubject.next(this.currentFetchType);
      }
    });
  }

  ngOnInit() {

    this.registerNodeTypeChanged();
  }
  
  ngAfterViewInit(): void {
    this.width = this.root?.nativeElement.offsetWidth;
    this.height = this.root?.nativeElement.offsetHeight;

    this.fetchEventSubject.next(this.currentFetchType);

    // Initialize the SVG
    let svg = this.initSvg();

    // Subscribe events for graph
    this.handleGraphEvents(svg);

    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.destroyedSubject.next();
  }

  private initSvg() {
    return d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .append("svg")
      .attr("width", this.width + PATH_ROOT_MARGIN_LEFT + PATH_ROOT_MARGIN_RIGHT)
      .attr("height", this.height + PATH_ROOT_MARGIN_TOP + PATH_ROOT_MARGIN_BOTTOM)
      .append("g")
      .attr("transform", `translate(${PATH_ROOT_MARGIN_LEFT}, ${PATH_ROOT_MARGIN_TOP})`);
  }

  private renderNodes(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    nodes: TopoNode[],
    edges: TopoEdge[],
  ) {
    //nodes
    let eleEnter = svg.selectAll("g")
      .data(nodes)
      .enter();
    
    //nodes
    eleEnter
      .append("circle")
      .attr("cx", (node: TopoNode) => node.x ?? 0)
      .attr("cy", (node: TopoNode) => node.y ?? 0)
      .attr("r", (node: TopoNode) =>  {
        if (node.type === TopologyNodeType.Individual) {
          return NODE_RADIUS;
        }
        return NODE_RADIUS * 1.8;
      })
      .attr("fill",  (node: TopoNode) => {
        if (node.type === TopologyNodeType.Agggregated) {
          return "#deebf3";
        }
        return groupColorMap.get(node.group!) ?? "#000";
      })
      .attr("stroke", (node: TopoNode) => {
        if (node.type === TopologyNodeType.Agggregated) {
          return "#deebf3";
        }
        return groupColorMap.get(node.group!) ?? "#000";
      })
      .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)

    //label
    eleEnter
      .append("text")
      .attr("dx", (node: TopoNode) => node.x ?? 0)
      .attr("dy", (node: TopoNode) => node.y ? node.y + NODE_RADIUS * 2.7 : NODE_RADIUS * 2)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
      .attr("text-anchor", "middle")
      .text((node: TopoNode) => {
        if (node.type === TopologyNodeType.Individual) {
          return node.label;  
        }
        return node.group ? `Group ${node.group}` : "";
      })

     //label
     eleEnter
     .append("text")
     .attr("dx", (node: TopoNode) => node.x ?? 0)
     .attr("dy", (node: TopoNode) => node.y ? node.y + 8 : 0)
     .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
     .attr("font-size", LABEL_FONT_SIZE_GROUP)
     .attr("text-anchor", "middle")
     .text((node) => {
      return this.typeCastMap.get(node.type!)!(node);
     })
  }

  private getNodes(edges: TopoEdge[]): TopoNode[] {
    let nodes: TopoNode[] = [];
    if (edges) {
      edges.forEach((edge: TopoEdge) => {
        if (!nodes.find(node => node.id === edge.source.id)) {
          nodes.push(edge.source);
        } 
        if (!nodes.find(node => node.id === edge.target.id)) {
          nodes.push(edge.target);
        }
      })
    }
    return nodes;
  }

  private renderEdges(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    arrangedNodes: TopoNode[],
    edges: TopoEdge[],
    shouldDisplayControlPoints: boolean
  ) {
    svg.selectAll("g")
      .data(edges)
      .enter()
      .append("path")
      .attr("d",  (edge: TopoEdge) => {
        let source = arrangedNodes.find((data: TopoNode) => data.id === edge.source.id);
        let target = arrangedNodes.find((data: TopoNode) => data.id === edge.target.id);

        let x0 = source?.x ?? 0;
        let y0 = source?.y ?? 0;
        let x1 = target?.x ?? 0;
        let y1 = target?.y ?? 0;

        const CONSTANT_CONTROL_POINT = 50;
        const HORIZONTAL_THRESHOLD = 3;

        let isHorizontal = Math.abs(y0 - y1) < HORIZONTAL_THRESHOLD;
        let controlPointX = isHorizontal ? x1 : x1 + CONSTANT_CONTROL_POINT * ((x1 - x0) / (y1 - y0));
        let controlPointY = isHorizontal ? y1 : y1 - CONSTANT_CONTROL_POINT * ((y1 - y0) / (x1 - x0));
    
        if (shouldDisplayControlPoints) {
          this.renderControlpoints(svg, x0, y0, x1, y1, controlPointX, controlPointY, isHorizontal);
        }
        
        return this.createEdge(x0, y0, x1, y1, controlPointX, controlPointY, isHorizontal);
      })
      .attr("fill", "none")
      .attr("stroke", EDGE_BORDER_COLOR_DEFAULT)
      .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT)
      .attr("cursor", "pointer")
      .lower()
  }

  private renderControlpoints(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    x0: number, y0: number, x1: number, y1: number, controlPointX: number, controlPointY: number, isHorizontal: boolean
  ) {
    svg.append("circle")
          .attr("cx", x0)
          .attr("cy", controlPointY)
          .attr("r", 2)
          .attr("fill", "red")
          .attr("stroke", "red")
          .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)
    
    svg.append("text")
      .attr("dx", x0)
      .attr("dy", controlPointY + 15)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .text("cp1")

    svg.append("circle")
          .attr("cx", controlPointX)
          .attr("cy", controlPointY)
          .attr("r", 2)
          .attr("fill", "red")
          .attr("stroke", "red")
          .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)
   
    svg.append("text")
      .attr("dx", controlPointX)
      .attr("dy", controlPointY + 15)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .text("cp2")

    svg.append("line")
          .attr("x1", x0)
          .attr("y1", y0)
          .attr("x2", x0)
          .attr("y2", controlPointY)
          .attr("stroke",  "red")
          .attr("stroke-dasharray",  "1,1")
          .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)

    svg.append("line")
          .attr("x1", x0)
          .attr("y1", controlPointY)
          .attr("x2", controlPointX)
          .attr("y2", controlPointY)
          .attr("stroke",  "red")
          .attr("stroke-dasharray",  "1,1")
          .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)

    svg.append("line")
          .attr("x1", controlPointX)
          .attr("y1", controlPointY)
          .attr("x2", x1)
          .attr("y2", y1)
          .attr("stroke",  "red")
          .attr("stroke-dasharray",  "1,1")
          .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)
  }

  private createEdge(x0: number, y0: number, x1: number, y1: number, controlPointX: number, controlPointY: number, isHorizontal: boolean) {
    
    let path = d3.path();
    
    path.moveTo(
      isHorizontal ? x0 : x0,
      isHorizontal ? y0 : y0
    );

    path.bezierCurveTo(
      x0,
      controlPointY,
      controlPointX,
      controlPointY,
      x1,
      y1
    );
    
    return path.toString();
  }

  private initZoom() {
    let zoom = d3.zoom().on('zoom', this.handleRootZoomEvent.bind(this));
    d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .call(zoom as any);
  }

  private handleRootZoomEvent(e: any) {
    d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .select('svg g')
		  .attr('transform', e.transform);
  }

  private cleanItemsOnSvg() {
    d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .selectAll("g > *").remove(); 
  }

  private handleGraphEvents(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
    // Render graph events
    this.renderGraphEventSubject.pipe(
      takeUntil(this.destroyedSubject)
    ).subscribe((shouldRender: boolean) => {
      //nodes
      this.nodes = this.getNodes(this.edges);
      if (this.nodes.length !== 0) {
        this.renderNodes(svg, this.nodes, this.edges);
    
        //edges
        this.renderEdges(svg, this.nodes, this.edges, shouldRender);
    
      }
  
      this.initZoom(); 
    });
  }

  registerNodeTypeChanged() {
    this.nodeTypeChangedSubject.pipe(
      filter(value => !!value),
      takeUntil(this.destroyedSubject)
    ).subscribe((value) => {
      this.controlMap.get(value as TopologyControlType)?.call(this);
    });
  }
}
