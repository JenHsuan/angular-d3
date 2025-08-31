import { Component, Input, OnInit } from '@angular/core';

const APP_URL = 'https://www.alayman.io/';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input() top: number;
  @Input() left: number;
  @Input() link: string;

  onClicked() {
    this.open(APP_URL);
  }

  open(url: string) {
    window.open(url, '_blank');
  }

}
