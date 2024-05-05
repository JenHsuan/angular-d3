import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import * as _ from 'lodash';
import { Topology } from './topology.domain';
import { TOPOLOGY_MOCK } from '../mock/topology.mock';

@Injectable({
  providedIn: 'root'
})
export class TopologyService {

  constructor() { }

  getData(): Observable<Topology> {
    console.log(123)
    return of(TOPOLOGY_MOCK)
    .pipe(
      map(data => this.convertData(data))
    );
  }

  private convertData(data: Topology): Topology {
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
    
    console.log(newNodes)
    return {
      nodes: newNodes,
      edges: newEdges
    };
  }
}
