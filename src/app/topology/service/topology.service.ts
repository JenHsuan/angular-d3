import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import * as _ from 'lodash';
import { PriorityQueueItem, PriorityQueueMinQueue, TopoEdge, Topology, TopoNode } from './topology.domain';
import { TOPOLOGY_MOCK } from '../mock/topology.mock';

@Injectable({
  providedIn: 'root'
})
export class TopologyService {

  constructor() { }

  getData(): Observable<Topology> {
    return of(TOPOLOGY_MOCK)
    .pipe(
      map(data => this.convertData(data))
    );
  }

  private convertData(data: Topology): Topology {
    const newData = _.cloneDeep(data);

    //mst
    const additionalEdges = this.popEdgesNotInMinimumSpanningTree(newData);

    console.log(additionalEdges)
    //build tree
    const newNodes = this.buildTree(newData);
    
    return {
      nodes: newNodes,
        edges: [ ...newData.edges, ...additionalEdges ]
    };
  }

  private popEdgesNotInMinimumSpanningTree(data: Topology): TopoEdge[] {
    const rawEdges = data.edges;
    const includedEdges: TopoEdge[] = [];

    rawEdges.forEach(edge => {
      const properties = edge.isFilteredByMst = true;
    });

    /*
     * Add the root node into the MST
     */
    const mstSet = new Set<string>();
    const startNode = data.nodes.filter(node => node.isRoot)[0];
    mstSet.add(startNode.id);

    /*
     * Initialize the priority queue
     */
    const pq = new PriorityQueueMinQueue();

    pq.push({
      weight: 0,
      fromNode: null,
      toNode: startNode.id
    });

    while (!pq.isEmpty) {
      const currItem: PriorityQueueItem = pq.pop()!;
      const currToNodeId = currItem.toNode;

      /*
       * Add the nodes associated to the minimal weight edge into the MST
       */
      if (!_.isNil(currToNodeId)) {
        mstSet.add(currToNodeId);
      }

      /*
       * Add neighbor edges into priority queue
       */
      const neighborEdges = rawEdges.filter(edge => {
        const nodes = [edge.source, edge.target];
        return nodes[0].id === currToNodeId || nodes[1].id === currToNodeId
      });

      for (let i = 0; i < neighborEdges.length; i++) {
        const neighborEdge = neighborEdges[i];
        for (let j = 0; j < 2; j++) {
          const nodes = [neighborEdge.source, neighborEdge.target];
          if (nodes[j].id !== currToNodeId && !mstSet.has(nodes[j].id)) {
            pq.push({
              weight: neighborEdge.weight ?? 1,
              fromNode: currToNodeId,
              toNode: nodes[j].id
            });

            mstSet.add(nodes[j].id);
            neighborEdge.isFilteredByMst = false;

            //Keep the minimal weight edge
            includedEdges.unshift(neighborEdge);
          }
        }
      }
    }

    const newData = _.cloneDeep(data);

    data.edges = includedEdges;

    return newData.edges.filter(edge => edge.isFilteredByMst);
  }

  private buildTree(data: Topology): TopoNode[] {
    const newData = _.cloneDeep(data);
    const newNodes = _.cloneDeep(newData.nodes);
    const newEdges = _.cloneDeep(newData.edges);

    newNodes.forEach(node => {
      node.children = [];
      node.isVisited = false;
    });

    const nodeQueue = [ newNodes[0] ];

    while (nodeQueue.length > 0) {
      const currentNode = nodeQueue.shift();
      currentNode!.isVisited = true;

      newEdges.forEach(edge => {
        if (edge.source.id === currentNode?.id) {
          const childs = newNodes.find(node => node.id === edge.target.id);
          if (!_.isNil(childs) && !childs.isVisited) {
            currentNode.children?.push(childs);
            nodeQueue.push(childs);
          }
        }
      })
    }

    return newNodes;
  }
}
