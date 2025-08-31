import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { TopologyService } from './topology/service/topology.service';
import { CHART_ANIMATION_DURATION, CHART_LAYER_DISTANCE_LOWER_BOUND, DEFS_FILTER_COLOR, DEFS_FILTER_DEVIATION, DRAG_DEBOUNCE_TIME, EDGE_BORDER_COLOR_DEFAULT, EDGE_BORDER_WIDTH_DEFAULT, LABEL_FONT_FAMILY_DEFAULT, LABEL_FONT_SIZE_DEFAULT, LABEL_FONT_SIZE_GROUP, LABEL_X_SHIFT, LABEL_Y_SHIFT, LOADING_DELAY, NODE_BORDER_WIDTH_DEFAULT, NODE_RADIUS, PATH_ROOT_MARGIN_BOTTOM, PATH_ROOT_MARGIN_LEFT, PATH_ROOT_MARGIN_RIGHT, PATH_ROOT_MARGIN_TOP, TABLE_BACKGROUND, TABLE_BORDER, TABLE_COL_HEIGHT, TABLE_COL_MARGIN_LEFT, TABLE_COL_Y_SHIFT, TABLE_TEXT_X, TABLE_TEXT_Y, TABLE_WIDTH, TABLE_X, TABLE_Y, TopoEdge, TopoLegend, TopoNode, TopoNodeDragEvent, Topology, TopologyControlType, TopologyGeometryType, TopologyMouseEventType, TopoNodeRemoveEvent, TopologyNodeType, TopologyVirtualEdge, groupColorMap } from './topology/service/topology.domain';
import { BehaviorSubject, Subject, debounceTime, delay, filter, switchMap, takeUntil, tap } from 'rxjs';
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
  flattenedNodes: d3.HierarchyPointNode<TopoNode>[] = [];
  edges: TopoEdge[] = [];

  rootNode: d3.HierarchyNode<TopoNode>;

  svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

  @ViewChild(`${D3_ROOT_ELEMENT_ID}`, {read: ElementRef}) root: ElementRef | undefined;

  fetchEventSubject = new BehaviorSubject<TopologyNodeType | null>(null);
  fetchEvent$ = this.fetchEventSubject.asObservable();
  
  private renderGraphEventSubject = new BehaviorSubject<Topology | null>(null);
  private destroyedSubject = new Subject<void>();

  nodePostionMap = new Map<string, {x: number, y: number}>;

  isEditModeSubject = new BehaviorSubject<boolean>(false);
  get inEditMode(): boolean {
    return this.isEditModeSubject.getValue();
  }

  private nodeDragSubject = new BehaviorSubject<TopoNodeDragEvent | null>(null);

  drag = d3.drag();

  private nodeRemoveSubject = new BehaviorSubject<TopoNodeRemoveEvent | null>(null);

  private topologyDataSubject = new BehaviorSubject<Topology | null>(null);
get footerLeftPosition(): number {
    return this.el.nativeElement.offsetWidth - 80;
  }

  get footerTopPosition(): number {
    return this.el.nativeElement.offsetHeight - 150;
  }

  constructor(
    private topologyService: TopologyService,
    private loadingService: LoadingService,
    private detectChanges: ChangeDetectorRef,
    private el: ElementRef
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
      
      this.renderGraphEventSubject.next(data);
    });

    this.registerNodeDraggingEventHandler();
    this.registerModeSwitching();
    this.registerNodeRemovingEventHandler();
    this.registerTopologyDataChanging();
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
      .attr("class", "node-circle")
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
      //.on(TopologyMouseEventType.CLICK_EVENT, (event, d: d3.HierarchyPointNode<TopoNode>) => this.nodeClicked(d, rootNode, svg));

    svg.selectAll(`.node`)
      .each((d: any) => {
        this.nodePostionMap.set(d.data.id, {x: d.x, y: d.y});
      });

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

    //update the nodeCoordinateMap
    svg.selectAll('.node')
      .each((d: any) => {
        this.nodePostionMap.set(d.data.id, {
          x: d.x,
          y: d.y
        });
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
    
    this.handleNodeGragging(nodeSelectionEnter);
    //merge the new items with the existing items
    let nodeUpdate = nodeSelectionEnter.merge(nodeSelection as any);

    //translate exited nodes (selected sub-tree) to the new calculated position
    // nodeUpdate
    //   .transition()
    //   .duration(CHART_ANIMATION_DURATION)
    //   .attr("transform", (d: d3.HierarchyPointNode<TopoNode>) => `translate(${d.y},${d.x})`);
    
   //translate exited nodes (selected sub-tree) to the source node and remove them
   let nodeExit = nodeSelection
      .exit()
      .remove();
  }

  private updateNodeControlButtons(
    nodeSelectionEnter: d3.Selection<SVGGElement, d3.HierarchyPointNode<TopoNode>, SVGGElement, unknown>
  ) {
    if (this.inEditMode) {
      //append remove button for standard nodes
      nodeSelectionEnter
        .append("circle")
        .attr("id", "node-remove")
        .attr("cx", 2 * NODE_RADIUS)
        .attr("cy", -NODE_RADIUS)
        .attr("r", 6)
        .style("fill", 'red')
        .attr("cursor", "pointer")
        .attr("opacity", 0)

      //append cross sign for standard nodes
      nodeSelectionEnter
        .append("text")
        .attr("transform", `translate(${2 * NODE_RADIUS},${-NODE_RADIUS + 4})`)
        .attr("text-anchor", "middle")
        .attr("cursor", "pointer")
        .attr("id","node-remove-text")
        .attr("font-size", 12)
        .style("fill-opacity", 0)
        .text('x')
        .style("fill", '#fff')
      
      nodeSelectionEnter
        .on(TopologyMouseEventType.MOUSEENTER_EVENT, function(event, node: d3.HierarchyPointNode<TopoNode>) {
          const group = d3.select(this);
          const removeBtn = group.select(`#node-remove`);
          if (removeBtn) {
            removeBtn.attr("opacity", 1)
          }

          const removeBtnText = group.select(`#node-remove-text`);
          if (removeBtnText) {
            removeBtnText.style("fill-opacity", 1)
          }
        })
        .on(TopologyMouseEventType.MOUSELEAVE_EVENT, function(event, node: d3.HierarchyPointNode<TopoNode>) {
          const group = d3.select(this);
          const removeBtn = group.select(`#node-remove`);
          if (removeBtn) {
            removeBtn.attr("opacity", 0)
          }

          const removeBtnText = group.select(`#node-remove-text`);
          if (removeBtnText) {
            removeBtnText.style("fill-opacity", 0)
          }
        })
    }
  }

  registerNodeRemovingEventHandler() {
    this.nodeRemoveSubject.pipe(
      filter(data => this.inEditMode && !_.isNil(data)),
      takeUntil(this.destroyedSubject)
    ).subscribe((data: TopoNodeRemoveEvent | null) => {
      const { node } = data!;

      const index = this.flattenedNodes.findIndex(n => n.data.id === node.data.id);

      if (index !== -1) {
        //remove thevtarget node
        this.flattenedNodes.splice(index, 1);

        //retrieve or append nodes
        let nodeSelection = this.svg.selectAll("g.node").data(this.flattenedNodes, (d: any) => d.id || (d.id = ++this.cnt));
 
        //get ready to append items
        let nodeSelectionEnter = nodeSelection
          .enter()
          .append("g")
          .attr("class", "node")
          .attr("transform", (d: d3.HierarchyPointNode<TopoNode>) => `translate(${d.y},${d.x})`);

        this.renderNodes(this.rootNode, this.rootNode as d3.HierarchyPointNode<TopoNode>, this.svg, nodeSelection, nodeSelectionEnter);

        this.updateNodeControlButtons(nodeSelectionEnter);

        //delete associated edges
        let edgeIndex = this.edges.findIndex(edge => {
          return edge.source.id === node.data.id || edge.target.id === node.data.id
        });
        let currEdge = _.cloneDeep(this.edges[edgeIndex]);

        while (edgeIndex !== -1) {
          //remove edge
          this.edges.splice(edgeIndex, 1);

          //find the next neighbor edge
          edgeIndex = this.edges.findIndex(edge => {
            return edge.source.id === node.data.id || edge.target.id === node.data.id
          });
          currEdge = _.cloneDeep(this.edges[edgeIndex]);
        }

        this.renderEdges(this.svg, this.edges);

        this.topologyDataSubject.next({
          nodes: this.convertHierarchyPointNodesToSimpleNodes(this.flattenedNodes),
          edges: this.edges
        });
      }
    })
  }

  private renderEdges(
   // source: d3.HierarchyPointNode<TopoNode>,
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    additionalEdges: TopoEdge[]
  ) {
    const virtualEdges: TopologyVirtualEdge[] = [];

    additionalEdges?.forEach((filteredEdge, index) => {
      const edgeNodes = [filteredEdge.source, filteredEdge.target];
      const sourceNode = this.nodePostionMap.get(edgeNodes[0].id);
      const destinationNode = this.nodePostionMap.get(edgeNodes[1].id);

      const virtualEdge = new TopologyVirtualEdge();
      virtualEdge.id = `virtual-${index}`;
      virtualEdge.sourceX = sourceNode?.x;
      virtualEdge.destinationX = destinationNode?.x;
      virtualEdge.sourceY = sourceNode?.y;
      virtualEdge.destinationY = destinationNode?.y;
      virtualEdge.isFilteredByMst = filteredEdge?.isFilteredByMst;

      virtualEdges.push(virtualEdge);
    })
    
    let linkSelection = svg.selectAll("path.link")
      .data(virtualEdges, (d: any) => d.id);

    //append new edges
    let linkSelectionEnter = linkSelection
      .enter()
      .insert("path", "g")
      .attr("id", (d: TopologyVirtualEdge) => `${D3_EDGE_ID}_${d.id}`)
      .attr("class", "link")
      .attr("fill", "none")
      .attr("filter", "none")
      .attr("stroke", (d: TopologyVirtualEdge) => {
        // return d.isFilteredByMst? 'red' : EDGE_BORDER_COLOR_DEFAULT;
        return EDGE_BORDER_COLOR_DEFAULT;
      })
      .attr("stroke-width", (d: TopologyVirtualEdge) => EDGE_BORDER_WIDTH_DEFAULT)
      .on(TopologyMouseEventType.MOUSEENTER_EVENT, (event: any, d:TopologyVirtualEdge) => svg.selectAll(`#${D3_EDGE_ID}_${d.id}`).attr("filter", "url(#yellow-outline)"))
      .on(TopologyMouseEventType.MOUSELEAVE_EVENT, (event: any, d: TopologyVirtualEdge) => svg.selectAll(`#${D3_EDGE_ID}_${d.id}`).attr("filter", "none"));
    
    //merge the new items with the existing items
    let linkUpdate = linkSelectionEnter.merge(linkSelection as any);

    //translate exited edges (selected sub-tree) to the new calculated position
    linkUpdate
      .attr("d", (d: TopologyVirtualEdge) => this.diagonal({
        x: d.destinationX!,
        y: d.destinationY!
      }, {
        x: d.sourceX!,
        y: d.sourceY!
      }));

    //translate exited edges (selected sub-tree) to the source edge and remove them
    // linkSelection
    //   .exit()
    //   .transition()
    //   .duration(CHART_ANIMATION_DURATION)
    //   .attr("d", (d: any) => this.diagonal(source, source))
    //   .remove();
  }

  private diagonal(s: any, d: any) {
    if (Math.floor(s.y) === Math.floor(d.y)) {
      return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 3 * 2} ${s.x},
              ${(s.y + d.y) / 3 * 2 } ${d.x},
              ${d.y} ${d.x}`;
    }

    return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
  }

  private initZoom() {
    let zoom = d3.zoom()
    .filter((event) => {
      return !this.inEditMode || (event.type === TopologyMouseEventType.WHEEL_EVENT);
    })
    .on('zoom', this.handleRootZoomEvent.bind(this));

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
    ).subscribe((data: Topology | null) => {
      console.log('handleGraphEvents')
      this.node = data?.nodes[0]!;
      this.edges = data?.edges!;
      this.rootNode = d3.hierarchy(this.node);
      
      this.initZoom();
      let treeData = this.treemap()(this.rootNode as any) as d3.HierarchyPointNode<TopoNode>;
      this.flattenedNodes = treeData.descendants();
    
      this.updateChart(this.rootNode, this.rootNode as d3.HierarchyPointNode<TopoNode>, this.svg);
   
    });
  }

  private updateChart(rootNode: d3.HierarchyNode<TopoNode>, source: d3.HierarchyPointNode<TopoNode>, svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
    //assign y property according to the depth
    let depth = 0;
    this.flattenedNodes.forEach((d: d3.HierarchyPointNode<TopoNode>) => depth = Math.max(d.depth, depth));
    let layerWidth = Math.max(CHART_LAYER_DISTANCE_LOWER_BOUND, (this.width / (depth + 1)));
    this.flattenedNodes.forEach((d: d3.HierarchyPointNode<TopoNode>) => d.y = d.depth * layerWidth);

    //update the top and bottom according to the donut chart and the port table
    this.flattenedNodes.forEach((d: d3.HierarchyPointNode<TopoNode>) => {
      //donut chart
      d.data.top = d.x - NODE_RADIUS * 2;
      d.data.bottom = d.x + NODE_RADIUS * 2 + LABEL_Y_SHIFT + 50;
        //port table
        if (!_.isNil(d.data.descriptions) && d.data.descriptions.length > 0) { 
          d.data.bottom = d.data.bottom + (TABLE_COL_HEIGHT * d.data.descriptions.length - TABLE_Y) + 50;
        }
    });

    //update the top and bottom according to the previous node
    for (let i = 1; i < this.flattenedNodes.length; i++) {
      let current = this.flattenedNodes[i - 1];
      let next = this.flattenedNodes[i];
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
    let nodeSelection = svg.selectAll("g.node").data(this.flattenedNodes, (d: any) => d.id || (d.id = ++this.cnt));
 
    //get ready to append items
    let nodeSelectionEnter = nodeSelection
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: d3.HierarchyPointNode<TopoNode>) => `translate(${d.y},${d.x})`);

    //defs
    this.updateDefs(svg);

    this.renderNodes(rootNode, source, svg, nodeSelection, nodeSelectionEnter);

    this.updateNodeControlButtons(nodeSelectionEnter);

    //edges
    this.renderEdges(svg, this.edges);
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

  registerModeSwitching() {
    //rerender the chart when mode is changed
    this.isEditModeSubject.pipe(
      filter((inEditMode) => !!this.svg),
      takeUntil(this.destroyedSubject)
    ).subscribe((inEditMode) => {
      //clean all items on the svg
      this.cleanItemsOnSvg();
    
      //update the chart
      this.updateChart(this.rootNode, this.rootNode as d3.HierarchyPointNode<TopoNode>, this.svg);
    });
  }

  registerNodeDraggingEventHandler() {
    this.nodeDragSubject.pipe(
      filter(data => this.inEditMode && !_.isNil(data)),
      debounceTime(DRAG_DEBOUNCE_TIME),
      takeUntil(this.destroyedSubject)
    ).subscribe((data: TopoNodeDragEvent | null) => {
      const { node: currNode, x: currentX, y: currentY } = data!;

      const targetNode = this.flattenedNodes.find(node => node.data.id === currNode.data.id);

      if (targetNode) {
        targetNode.x = currentY;
        targetNode.y = currentX;
      }

      this.nodePostionMap.set(currNode.data.id, {
        x: currentY,
        y: currentX
      });

      if (this.edges.length > 0) {
        d3.selectAll("path.link").remove();

        //render edges group
        this.renderEdges(this.svg, this.edges);
      }

      this.topologyDataSubject.next({
        nodes: this.convertHierarchyPointNodesToSimpleNodes(this.flattenedNodes),
        edges: this.edges
      });
    });
  }

  convertHierarchyPointNodesToSimpleNodes = (nodes: d3.HierarchyPointNode<TopoNode>[]): TopoNode[] => {
    const data: TopoNode[] = [];
  
    nodes.forEach(node => {
      const newNode: TopoNode = _.cloneDeep(node.data);
      data.push(newNode);
    });
  
    return data;
  }

  registerTopologyDataChanging() {
    this.topologyDataSubject
      .pipe(
        takeUntil(this.destroyedSubject)
      ).subscribe((data) => {
        console.log(data)
      });
  }

  private handleNodeGragging(
    nodeSelectionEnter: d3.Selection<SVGGElement, d3.HierarchyPointNode<TopoNode>, SVGGElement, unknown>
  ) {
    const self = this;

    let currentX = 0;
    let currentY = 0;
    let shouldStop = false;

    nodeSelectionEnter.call(
      (this.drag as any)
        .on(TopologyMouseEventType.START, function(this: SVGGElement, event: any){
          if (self.inEditMode) {
            const target = event.sourceEvent.target;
            shouldStop = false;

            if (target.id === "node-remove" || target.id === "node-remove-text") {
              //remove
              const parent = target.parentNode;
              const group = d3.select(parent);
              const currNode = (group.data()[0] as d3.HierarchyPointNode<TopoNode>);
              self.nodeRemoveSubject.next({
                node: _.cloneDeep(currNode)
              });

              //avoid dragging
              shouldStop = true;
            } else {
              //drag
              const transform = d3.select(this).attr("transform");
              const match = /translate\(([^,]+),([^)]+)\)/.exec(transform);
              if (match) {
                currentX = parseFloat(match[1]);
                currentY = parseFloat(match[2]);
              } else {
                currentX = 0;
                currentY = 0;
              }
            }
          }
        })
        .on(TopologyMouseEventType.DRAG, function(this: SVGGElement, event: any){
          if (self.inEditMode) {
            //drag event
            currentX += event.dx;
            currentY += event.dy;
  
            d3.select(this)
              .attr("transform", `translate(${currentX}, ${currentY})`);
  
            const group = d3.select(this);
            const currNode = (group.data()[0] as d3.HierarchyPointNode<TopoNode>);
  
            self.nodeDragSubject.next(
              {
                node: _.cloneDeep(currNode),
                x: currentX,
                y: currentY
              }
            );
          }
        })
        .on(TopologyMouseEventType.END, function(event: any){
        })
      )
  }
}
