import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})

/*
  This page is static, so no scripting is needed.
*/
export class AboutPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

}
