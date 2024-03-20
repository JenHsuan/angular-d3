import { Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { TopologyService } from './topology/service/topology.service';
import { TopoEdge, TopoLegend, TopoNode, TopologyGeometryType, TopologyNodeType } from './topology/service/topology.domain';
import { BehaviorSubject, filter, switchMap } from 'rxjs';

const D3_ROOT_ELEMENT_ID = "root";
const PATH_ROOT_MARGIN_TOP = 50;
const PATH_ROOT_MARGIN_LEFT = 150;
const PATH_ROOT_MARGIN_RIGHT = 10;
const PATH_ROOT_MARGIN_BOTTOM = 10;

//legend
export const LEGEND_LEFT = -50;
export const LEGEND_TOP = -30;
export const LEGEND_TITLE_LENGTH = 130;
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

//edge
export const EDGE_BORDER_WIDTH_DEFAULT = 3;
export const EDGE_BORDER_COLOR_DEFAULT = "#999";
export const LABEL_FONT_SIZE_DEFAULT = "18px";

//label
export const LABEL_FONT_FAMILY_DEFAULT = "Arial ";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-d3';
  width: number;
  height: number;
  edges: TopoEdge[];
  nodes: TopoNode[];

  legendItems: TopoLegend[] = [
    {
      geometryType: TopologyGeometryType.EDGE,
      legendTitle: "Edge",
      legendIconBorderColor: "#000",
    }, {
      geometryType: TopologyGeometryType.NODE,
      legendTitle: "Node",
      legendIconBorderColor: "#000",
    },
    {
      geometryType: TopologyGeometryType.NODE,
      legendTitle: "Control Points",
      legendIconBorderColor: "red",
    },
  ];

  @ViewChild(`${D3_ROOT_ELEMENT_ID}`, {read: ElementRef}) root: ElementRef | undefined; 
  fetchEventSubject = new BehaviorSubject<TopologyNodeType | null>(null);
  fetchEvent$ = this.fetchEventSubject.asObservable();

  constructor(private topologyService: TopologyService) {
    this.fetchEvent$.pipe(
      filter(type => !!type),
      switchMap(type => this.topologyService.list(type!))
    ).subscribe(data =>{
      this.edges = data;
    })
  }

  ngAfterViewInit(): void {
    this.width = this.root?.nativeElement.offsetWidth;
    this.height = this.root?.nativeElement.offsetHeight;

    this.fetchEventSubject.next(TopologyNodeType.Agggregated);

    // Initialize the SVG
    let svg = this.initSvg();

    //legends
    this.renderLegends(
      svg,
      this.legendItems,
    );

    //nodes
    this.nodes = this.getNodes(this.edges);
    this.renderNodes(svg, this.nodes, this.edges);

    //edges
    this.renderEdges(svg, this.nodes, this.edges);


    this.initZoom(); 
  }

  private initSvg() {
    return d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .append("svg")
      .attr("width", this.width + PATH_ROOT_MARGIN_LEFT + PATH_ROOT_MARGIN_RIGHT)
      .attr("height", this.height + PATH_ROOT_MARGIN_TOP + PATH_ROOT_MARGIN_BOTTOM)
      .append("g")
      .attr("transform", `translate(${PATH_ROOT_MARGIN_LEFT}, ${PATH_ROOT_MARGIN_TOP})`);
  }

  private renderLegends(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    legendItems: TopoLegend[]
  ) {
    legendItems.forEach((item: TopoLegend, index) => {
      if (item.geometryType === TopologyGeometryType.NODE) {
        svg.append("circle")
          .attr("cx", LEGEND_LEFT + index * LEGEND_TITLE_LENGTH)
          .attr("cy", LEGEND_TOP)
          .attr("r", LEGEND_ICON_RADIUS)
          .attr("fill", NODE_BACKGROUND_DEFAULT)
          .attr("stroke", item.legendIconBorderColor)
          .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)
          .attr("cursor", "pointer")
      } else if (item.geometryType === TopologyGeometryType.EDGE) {
        svg.append("line")
          .attr("x1", LEGEND_LEFT + index * LEGEND_TITLE_LENGTH)
          .attr("y1", LEGEND_TOP)
          .attr("x2", LEGEND_LEFT + index * LEGEND_TITLE_LENGTH + LEGEND_LINE_LENGTH)
          .attr("y2", LEGEND_TOP)
          .attr("stroke", item.legendIconBorderColor)
          .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)
          .attr("cursor", "pointer")
      }

      //label
      svg.append("text")
        .attr("dx", LEGEND_LEFT + index * LEGEND_TITLE_LENGTH + LEGEND_ICON_RADIUS * 3)
        .attr("dy", LEGEND_TOP + 5)
        .text(item.legendTitle)
        .attr("font-size", LEGEND_FONT_SIZE)
        .attr("font-weight", LEGEND_TITLE_FONT_WEIGHT_DEFAULT)
        .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
        .attr("cursor", "pointer")
        .on("click", (e) => console.log(e))
        .on("mouseover", (e) => console.log(e))
    }); 
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
      .attr("r", NODE_RADIUS)
      .attr("fill",  (node: TopoNode) => {
        return node.type === TopologyNodeType.Individual ? NODE_BORDER_COLOR_DEFAULT : "blue";
      })
      .attr("stroke", (node: TopoNode) => {
        return node.type === TopologyNodeType.Individual ? NODE_BORDER_COLOR_DEFAULT : "blue";
      })
      .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)

    //label
    eleEnter
      .append("text")
      .attr("dx", (node: TopoNode) => node.x ?? 0)
      .attr("dy", (node: TopoNode) => node.y ? node.y + NODE_RADIUS * 2 : NODE_RADIUS * 2)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
      .attr("text-anchor", "middle")
      .text((node: TopoNode) => {
        return node.label;
      })
  }

  private getNodes(edges: TopoEdge[]): TopoNode[] {
    let nodes: TopoNode[] = [];
    edges.forEach((edge: TopoEdge) => {
      if (!nodes.find(node => node.id === edge.source.id)) {
        nodes.push(edge.source);
      } 
      if (!nodes.find(node => node.id === edge.target.id)) {
        nodes.push(edge.target);
      }
    })
    return nodes;
  }

  private renderEdges(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    arrangedNodes: TopoNode[],
    edges: TopoEdge[]
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
    
        this.renderControlpoints(svg, x0, y0, x1, y1, controlPointX, controlPointY, isHorizontal);
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
}
