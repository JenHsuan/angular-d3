import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { TopologyService } from './topology/service/topology.service';
import { CHART_ANIMATION_DURATION, CHART_LAYER_DISTANCE_LOWER_BOUND, DEFS_FILTER_COLOR, DEFS_FILTER_DEVIATION, EDGE_BORDER_COLOR_DEFAULT, EDGE_BORDER_WIDTH_DEFAULT, LABEL_FONT_FAMILY_DEFAULT, LABEL_FONT_SIZE_DEFAULT, LABEL_FONT_SIZE_GROUP, LABEL_X_SHIFT, LABEL_Y_SHIFT, LOADING_DELAY, NODE_BORDER_WIDTH_DEFAULT, NODE_RADIUS, PATH_ROOT_MARGIN_BOTTOM, PATH_ROOT_MARGIN_LEFT, PATH_ROOT_MARGIN_RIGHT, PATH_ROOT_MARGIN_TOP, TABLE_BACKGROUND, TABLE_BORDER, TABLE_COL_HEIGHT, TABLE_COL_MARGIN_LEFT, TABLE_COL_Y_SHIFT, TABLE_TEXT_X, TABLE_TEXT_Y, TABLE_WIDTH, TABLE_X, TABLE_Y, TopoEdge, TopoLegend, TopoNode, Topology, TopologyControlType, TopologyGeometryType, TopologyMouseEventType, TopologyNodeType, groupColorMap } from './topology/service/topology.domain';
import { BehaviorSubject, Subject, delay, filter, switchMap, takeUntil, tap } from 'rxjs';
import { LoadingService } from './topology/topology-path-loading/loading.service';

const D3_ROOT_ELEMENT_ID = "root";
const D3_EDGE_ID = "edge";
const D3_NODE_ID = "node";
const D3_NODE_PORT_TABLE_ID = "node-port-table";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-d3';

  width: number;
  height: number;
  cnt = 0;

  node: TopoNode;
  rootNode: d3.HierarchyNode<TopoNode>;

  svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

  @ViewChild(`${D3_ROOT_ELEMENT_ID}`, {read: ElementRef}) root: ElementRef | undefined;

  fetchEventSubject = new BehaviorSubject<TopologyNodeType | null>(null);
  fetchEvent$ = this.fetchEventSubject.asObservable();
  
  private renderGraphEventSubject = new BehaviorSubject<TopoNode | null>(null);
  private destroyedSubject = new Subject<void>();
  
  constructor(
    private topologyService: TopologyService,
    private loadingService: LoadingService,
    private detectChanges: ChangeDetectorRef
  ) {
    this.fetchEvent$.pipe(
      filter(type => !!type),
      takeUntil(this.destroyedSubject),
      tap(() => this.loadingService.loadingOn()),
      switchMap(type => this.topologyService.getData()),
      delay(LOADING_DELAY),
      tap(() => this.loadingService.loadingOff()),
    ).subscribe(data =>{
      // Clean items on svg
      this.cleanItemsOnSvg();
      
      this.renderGraphEventSubject.next(data.nodes[0] as TopoNode);
    });
  }

  ngAfterViewInit(): void {
    this.width = this.root?.nativeElement.offsetWidth;
    this.height = this.root?.nativeElement.offsetHeight;

    // Initialize the SVG
    this.svg = this.initSvg();

    // Subscribe events for graph
    this.handleGraphEvents(this.svg);

    this.fetchEventSubject.next(TopologyNodeType.Individual)

    this.detectChanges.detectChanges();
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

  private updateDefs(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>
  ){
    svg.append("defs")
      .append("filter")
      .attr("id", "yellow-outline")
      .attr("filterUnits", "userSpaceOnUse")
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("stdDeviation", DEFS_FILTER_DEVIATION)
      .attr("flood-color", DEFS_FILTER_COLOR)
  }
  
  private renderNodes(
    rootNode: d3.HierarchyNode<TopoNode>,
    source: d3.HierarchyPointNode<TopoNode>,
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    nodeSelection: d3.Selection<d3.BaseType, d3.HierarchyPointNode<TopoNode>, SVGGElement, unknown>,
    nodeSelectionEnter: d3.Selection<SVGGElement, d3.HierarchyPointNode<TopoNode>, SVGGElement, unknown>
  ) {
    //nodes
    nodeSelectionEnter
      .append("circle")
      .attr("id", (d: d3.HierarchyPointNode<TopoNode>) => `${D3_NODE_ID}_${d.id}`)
      .attr("r", (node: d3.HierarchyPointNode<TopoNode>) =>  {
        return NODE_RADIUS * 1.8;
      })
      .attr("fill",  (node: d3.HierarchyPointNode<TopoNode>) => {
        return groupColorMap.get(node.data.group) ?? "#000";
      })
      .attr("stroke", (node: d3.HierarchyPointNode<TopoNode>) => {
        return groupColorMap.get(node.data.group) ?? "#000";
      })
      .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)
      .attr("cursor", "pointer")
      .on(TopologyMouseEventType.CLICK_EVENT, (event, d: d3.HierarchyPointNode<TopoNode>) => this.nodeClicked(d, rootNode, svg));

    //label
    nodeSelectionEnter
      .append("text")
      .attr("transform", `translate(${LABEL_X_SHIFT},${NODE_RADIUS * 2 + LABEL_Y_SHIFT})`)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
      .attr("text-anchor", "middle")
      .text((node: d3.HierarchyPointNode<TopoNode>) => {
        return node.data.label;
      })

     //append port table for nodes
     nodeSelectionEnter
     .filter((d: d3.HierarchyPointNode<TopoNode>) => !_.isNil(d.data.descriptions) && d.data.descriptions.length > 0)
     .append("g")
     .attr("id", (d: d3.HierarchyPointNode<TopoNode>) => `${D3_NODE_PORT_TABLE_ID}_${d.id}`)
     .each((d: d3.HierarchyPointNode<TopoNode>) => {
       let tableColShift = TABLE_COL_Y_SHIFT;
       d.data.descriptions!.forEach((content: string) => {
         let table = svg.selectAll(`#${D3_NODE_PORT_TABLE_ID}_${d.id}`);
         table
           .append("rect")
           .attr("transform", `translate(${TABLE_X},${TABLE_Y + tableColShift})`)
           .attr("width", TABLE_WIDTH)
           .attr("height", TABLE_COL_HEIGHT)
           .style("stroke", TABLE_BORDER)
           .style("fill", TABLE_BACKGROUND)
           .attr("cursor", "pointer");

         table
           .append("text")
           .attr("transform", `translate(${TABLE_X + TABLE_TEXT_X},${TABLE_TEXT_Y + tableColShift})`)
           .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
           .attr("cursor", "pointer")
           .text(content);

         tableColShift += TABLE_COL_HEIGHT;
       });
     })
    
    //merge the new items with the existing items
    let nodeUpdate = nodeSelectionEnter.merge(nodeSelection as any);

    //translate exited nodes (selected sub-tree) to the new calculated position
    nodeUpdate
      .transition()
      .duration(CHART_ANIMATION_DURATION)
      .attr("transform", (d: d3.HierarchyPointNode<TopoNode>) => `translate(${d.y},${d.x})`);
    
   //translate exited nodes (selected sub-tree) to the source node and remove them
   let nodeExit = nodeSelection
      .exit()
      .transition()
      .duration(CHART_ANIMATION_DURATION)
      .attr("transform", `translate(${source.y},${source.x})`)
      .remove();
  }

  private renderEdges(
    source: d3.HierarchyPointNode<TopoNode>,
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    links: d3.HierarchyPointNode<TopoNode>[]
  ) {
    let linkSelection = svg.selectAll("path.link")
      .data(links, (d: any) => d.id);

    //append new edges
    let linkSelectionEnter = linkSelection
      .enter()
      .insert("path", "g")
      .attr("id", (d: d3.HierarchyPointNode<TopoNode>) => `${D3_EDGE_ID}_${d.id}`)
      .attr("class", "link")
      .attr("fill", "none")
      .attr("filter", "none")
      .attr("stroke", (d: d3.HierarchyPointNode<TopoNode>) => EDGE_BORDER_COLOR_DEFAULT)
      .attr("stroke-width", (d: d3.HierarchyPointNode<TopoNode>) => EDGE_BORDER_WIDTH_DEFAULT)
      .on(TopologyMouseEventType.MOUSEENTER_EVENT, (event: any, d: d3.HierarchyPointNode<TopoNode>) => svg.selectAll(`#${D3_EDGE_ID}_${d.id}`).attr("filter", "url(#yellow-outline)"))
      .on(TopologyMouseEventType.MOUSELEAVE_EVENT, (event: any, d: d3.HierarchyPointNode<TopoNode>) => svg.selectAll(`#${D3_EDGE_ID}_${d.id}`).attr("filter", "none"));
    
    //merge the new items with the existing items
    let linkUpdate = linkSelectionEnter.merge(linkSelection as any);

    //translate exited edges (selected sub-tree) to the new calculated position
    linkUpdate
      .transition()
      .duration(CHART_ANIMATION_DURATION)
      .attr("d", (d: d3.HierarchyPointNode<TopoNode>) => this.diagonal(d, d.parent!));

    //translate exited edges (selected sub-tree) to the source edge and remove them
    linkSelection
      .exit()
      .transition()
      .duration(CHART_ANIMATION_DURATION)
      .attr("d", (d: any) => this.diagonal(source, source))
      .remove();
  }

  private diagonal(s: d3.HierarchyPointNode<TopoNode>, d: d3.HierarchyPointNode<TopoNode>) {
    let path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

    return path;
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
      filter(data => !!data),
      takeUntil(this.destroyedSubject)
    ).subscribe((data: TopoNode | null) => {
      console.log('handleGraphEvents')
      this.node = data!;
      this.rootNode = d3.hierarchy(this.node);
      
      this.initZoom();
      this.updateChart(this.rootNode, this.rootNode as d3.HierarchyPointNode<TopoNode>, this.svg);
   
    });
  }

  private updateChart(rootNode: d3.HierarchyNode<TopoNode>, source: d3.HierarchyPointNode<TopoNode>, svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
    let treeData = this.treemap()(rootNode as any) as d3.HierarchyPointNode<TopoNode>;

    let nodes = treeData.descendants();
    let links = treeData.descendants().slice(1);
  
    //assign y property according to the depth
    let depth = 0;
    nodes.forEach((d: d3.HierarchyPointNode<TopoNode>) => depth = Math.max(d.depth, depth));
    let layerWidth = Math.max(CHART_LAYER_DISTANCE_LOWER_BOUND, (this.width / (depth + 1)));
    nodes.forEach((d: d3.HierarchyPointNode<TopoNode>) => d.y = d.depth * layerWidth);

    //update the top and bottom according to the donut chart and the port table
    nodes.forEach((d: d3.HierarchyPointNode<TopoNode>) => {
      //donut chart
      d.data.top = d.x - NODE_RADIUS * 2;
      d.data.bottom = d.x + NODE_RADIUS * 2 + LABEL_Y_SHIFT + 50;
        //port table
        if (!_.isNil(d.data.descriptions) && d.data.descriptions.length > 0) { 
          d.data.bottom = d.data.bottom + (TABLE_COL_HEIGHT * d.data.descriptions.length - TABLE_Y) + 50;
        }
    });

    //update the top and bottom according to the previous node
    for (let i = 1; i < nodes.length; i++) {
      let current = nodes[i - 1];
      let next = nodes[i];
      let currentData = current.data;
      let nextData = next.data;
      if (current.depth === next.depth && nextData.top! <= currentData.bottom!) {
        const diff = currentData.bottom! - nextData.top!;
        nextData.top! += diff;
        nextData.bottom! += diff;
        next.x += diff;
      }
    }

    //retrieve or append nodes
    let nodeSelection = svg.selectAll("g.node").data(nodes, (d: any) => d.id || (d.id = ++this.cnt));
 
    //get ready to append items
    let nodeSelectionEnter = nodeSelection
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: d3.HierarchyPointNode<TopoNode>) => `translate(${d.y},${d.x})`);

    //defs
    this.updateDefs(svg);

    this.renderNodes(rootNode, source, svg, nodeSelection, nodeSelectionEnter);

    //edges
    this.renderEdges(source, svg, links);
  }

  private treemap = () => d3.tree().size([this.height, this.width]);
  
  private pie = () => d3.pie().value((d: any) => d.value);

  private pack = (width: number, height: number, margin: number, padding: number) => d3.pack().size([width - margin * 2, height - margin * 2]).padding(padding);

  private nodeClicked(d: d3.HierarchyPointNode<TopoNode>, rootNode: d3.HierarchyNode<TopoNode>, svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
    //update the state of the node
    if (d.children) {
      d.data._children = d.children;
      d.children = undefined;
      d.data.isExpanded = false;
    } else {
      d.children = d.data._children!;
      d.data._children = undefined;
      d.data.isExpanded = true;
    }

    //update the chart
    this.updateChart(rootNode, d, svg);
  }
}
