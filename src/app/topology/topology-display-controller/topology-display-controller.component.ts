import { Component, Input } from '@angular/core';

import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-topology-display-controller',
  templateUrl: './topology-display-controller.component.html',
  styleUrls: ['./topology-display-controller.component.scss']
})
export class TopologyDisplayControllerComponent {

  @Input('isEditModeSubject') isEditModeSubject: BehaviorSubject<boolean>;

  get modeLabel(): string {
    if (_.isNil(this.isEditModeSubject)) {
      return "Edit Mode";
    }

    return this.isEditModeSubject.getValue() ? "View Mode" : "Edit Mode";
  }

  onModeButtonClick() {
    const curMode = this.isEditModeSubject.getValue();
    this.isEditModeSubject.next(!curMode);
  }
}
