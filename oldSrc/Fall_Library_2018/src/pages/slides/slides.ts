import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-slides',
  templateUrl: 'slides.html'
})
export class SlidesPage {

  images: Array<string> = [];

  /*
    Place all of the image URIs from the scenic_shots folder into an array,
    which is used to populate slides in the HTML.
  */
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    for(let i = 1; i < 25; i++) {
      let img_uri = "assets/scenic_shots/".concat(i.toString(), ".png");
      this.images.push(img_uri);
    }
  }
}
