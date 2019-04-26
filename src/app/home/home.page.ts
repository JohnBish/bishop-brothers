import { Component, ViewChild, AfterViewInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from "@angular/animations";
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  animations: [
    trigger('navState', [
      state('show', style({
        opacity: .6,
        'margin-top': '0px'
      })),
      state('hide', style({
        opacity: 0,
        'margin-top': '-56px'
      })),
      transition('show => hide', animate('150ms ease-in')),
      transition('hide => show', animate('100ms ease-out'))
    ])
  ]
})
export class HomePage implements AfterViewInit {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('curve') curve: any;

  navState = 'hide';

  updateNavState(y: number) {
    if (y == 0 || y > this.curve.platform.height()) {
      this.navState = 'show';
    } else {
      this.navState = 'hide';
    }
  }

  doScroll(e: Event) {
    this.content.getScrollElement().then(res => {
      const y = res.scrollTop;
      this.curve.onScroll(y);
      this.updateNavState(y);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.navState = 'show';
    });
  }
}
