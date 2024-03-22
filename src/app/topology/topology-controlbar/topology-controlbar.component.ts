import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { LABEL_FONT_FAMILY_DEFAULT, LEGEND_FONT_SIZE, LEGEND_ICON_RADIUS, LEGEND_LEFT, LEGEND_LINE_LENGTH, LEGEND_TITLE_FONT_WEIGHT_DEFAULT, LEGEND_TITLE_FONT_WEIGHT_HIGHLIGHTED, LEGEND_TITLE_LENGTH, LEGEND_TOP, NODE_BACKGROUND_DEFAULT, NODE_BORDER_WIDTH_DEFAULT, NODE_BORDER_WIDTH_HIGHLIGHTED, PATH_ROOT_MARGIN_LEFT, PATH_ROOT_MARGIN_TOP, TopoLegend, TopologyControlType, TopologyGeometryType, TopologyNodeType } from '../service/topology.domain';

const D3_ROOT_ELEMENT_ID = "controlbar";

@Component({
  selector: 'app-topology-controlbar',
  templateUrl: './topology-controlbar.component.html',
  styleUrls: ['./topology-controlbar.component.scss']
})
export class TopologyControlbarComponent implements OnInit {
  width: number;
  height: number;
  svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  @Output() nodeTypeChanged = new EventEmitter<TopologyControlType>();
  @ViewChild(`${D3_ROOT_ELEMENT_ID}`, {read: ElementRef}) root: ElementRef | undefined; 

  legendItems: TopoLegend[] = [
    // {
    //   geometryType: TopologyGeometryType.NODE,
    //   legendTitle: "Control Points",
    //   legendIconBorderColor: "red",
    //   onClick: () => {}
    // },
   
    // {
    //   geometryType: TopologyGeometryType.EDGE,
    //   legendTitle: "Edge",
    //   legendIconBorderColor: "#000",
    //   onClick: () => {}
    // }, {
    //   geometryType: TopologyGeometryType.NODE,
    //   legendTitle: "Node",
    //   legendIconBorderColor: "#000",
    //   onClick: () => {}
    // },
    {
      geometryType: TopologyGeometryType.NODE,
      legendTitle: "Group Aggregation",
      legendIconBorderColor: "#deebf3",
      onClick: () => {
        this.highlightLegend(this.svg, 0, this.legendItems[0]);
        this.nodeTypeChanged.emit(TopologyControlType.agregration);
        //this.fetchEventSubject.next(TopologyNodeType.Individual)
      },
      isHighlighted: false
    },
    {
      geometryType: TopologyGeometryType.NODE,
      legendTitle: "Show Control Points",
      legendIconBorderColor: "red",
      onClick: () => {
        this.highlightLegend(this.svg, 1, this.legendItems[1]);
        this.nodeTypeChanged.emit(TopologyControlType.contolPoint);
        //this.fetchEventSubject.next(TopologyNodeType.Individual)
      },
      isHighlighted: false
    },
  ];

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.width = this.root?.nativeElement.offsetWidth;
    this.height = this.root?.nativeElement.offsetHeight;

    // Initialize the SVG
    this.svg = this.initSvg();

    // Subscribe events for graph
    this.renderLegends(this.svg, this.legendItems);
  }


  private initSvg() {
    return d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height )
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
          .attr("id", `legend_icon_circle_${index}`)
          .attr("cursor", "pointer")
          .on("click", (e) => item.onClick())
      } else if (item.geometryType === TopologyGeometryType.EDGE) {
        svg.append("line")
          .attr("x1", LEGEND_LEFT + index * LEGEND_TITLE_LENGTH)
          .attr("y1", LEGEND_TOP)
          .attr("x2", LEGEND_LEFT + index * LEGEND_TITLE_LENGTH + LEGEND_LINE_LENGTH)
          .attr("y2", LEGEND_TOP)
          .attr("stroke", item.legendIconBorderColor)
          .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)
          .attr("cursor", "pointer")
          .on("click", (e) => item.onClick())
      }

      //label
      svg.append("text")
        .attr("dx", LEGEND_LEFT + index * LEGEND_TITLE_LENGTH + LEGEND_ICON_RADIUS * 3)
        .attr("dy", LEGEND_TOP + 5)
        .attr("id", `legend_${index}`)
        .text(item.legendTitle)
        .attr("font-size", LEGEND_FONT_SIZE)
        .attr("font-weight", LEGEND_TITLE_FONT_WEIGHT_DEFAULT)
        .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
        .attr("cursor", "pointer")
        .on("click", (e) => item.onClick())
        .on("mouseover", (e) => console.log(e))
    }); 
  }

  private highlightLegend(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    index: number,
    legendItem: TopoLegend,
  ) {
    let highlightedStatus = legendItem.isHighlighted;
    legendItem.isHighlighted = !highlightedStatus;

    svg.select(`#legend_${index}`)
      .style("font-weight", !highlightedStatus ? LEGEND_TITLE_FONT_WEIGHT_HIGHLIGHTED : LEGEND_TITLE_FONT_WEIGHT_DEFAULT);

    svg.select(`#legend_icon_circle_${index}`)
      .style("stroke-width", !highlightedStatus ? NODE_BORDER_WIDTH_HIGHLIGHTED : NODE_BORDER_WIDTH_DEFAULT);
  }
}
