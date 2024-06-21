import { Injectable } from '@angular/core';

import { Observable, map, of } from 'rxjs';
import * as _ from 'lodash';

import { TopologyController, topologyControllerGroupingItemsTemplate } from '../../service/topology-controller.domain';

@Injectable({
  providedIn: 'root'
})
export class TopologyControlbarGroupService {

  constructor() { }

  list(): Observable<TopologyController[]> {
    const groupingItems = _.cloneDeep(topologyControllerGroupingItemsTemplate);
    return of(groupingItems).pipe(
      map(data => this.convertDataList(data)),
    );
  }
  
  private convertDataList(dataList: TopologyController[]): TopologyController[] {
    return dataList.map(data => this.convertData(data));
  }

  private convertData(data: TopologyController): TopologyController {
    const newData = _.cloneDeep(data);

    return newData;
  }
}
