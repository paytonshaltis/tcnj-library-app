import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SlidesPage } from '../slides/slides';

@Component({
  selector: 'page-gallery',
  templateUrl: 'gallery.html'
})

/*
  This page is currently unused in the application. The slides page is used to
  display the picture instead. This code is left in the project just in case it
  is later found to be useful.
*/

export class GalleryPage {

  slidesPage = SlidesPage;

  images: Array<string> = [];
  thumbnails: Array<string> = [];
  grid: Array<Array<string>>;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    // place all of the image URIs from the scenic_shots folder into an array.
    for(let i = 1; i < 25; i++) {
      let img_uri = "assets/scenic_shots/".concat(i.toString(), ".png");
      this.images.push(img_uri);
      let thumbnail_uri = "assets/scenic_shots_thumbnails/".concat(i.toString(), ".png");
      this.thumbnails.push(thumbnail_uri);
    }
    this.grid = Array(Math.ceil(this.images.length/3));
  }

  /*
    When view loads, place the image URIs into the rows and columns of the
    grid, which is created in the HTML.
  */
  ionViewDidLoad() {
    for(let i = 0; i < 8; i++) {
      this.grid[i] = Array(3);
    }

    let rowNum = -1;
    let j = 0;
    for (let i = 0; i < this.thumbnails.length; i++) {
      if(i%3 == 0) {
        rowNum++;
        j = 0;
      }
      this.grid[rowNum][j] = this.thumbnails[i];
      j++;
    }
  }


}
