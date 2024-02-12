import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import * as _ from 'lodash';
import { TopoEdge } from './topology.domain';
import { TOPO_MOCK_EDGE } from './topology.mock';

@Injectable({
  providedIn: 'root'
})
export class TopologyService {

  constructor() { }

  getEdges(): Observable<TopoEdge[]> {
    return of(TOPO_MOCK_EDGE)
    .pipe(
      map(data => this.convertData(data))
    );
  }

  private convertData(data: TopoEdge[]): TopoEdge[] {
    const newData = _.cloneDeep(data);

    newData.forEach((edge, index) => {
      edge.id = _.isNil(edge.id) ? `${index}-edge` : edge.id;
      edge.source.id = _.isNil(edge.source.id) ? `${index}-source-node` : edge.source.id;
      edge.target.id = _.isNil(edge.target.id) ? `${index}-target-node` : edge.target.id;
    });
    return newData;
  }
}
