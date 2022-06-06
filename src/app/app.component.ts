import { Component } from '@angular/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
   
    { title: 'About Us', url: '/about-us', icon: 'warning' },
  ];
 
  constructor() {
    defineCustomElements(window);
  }
}
