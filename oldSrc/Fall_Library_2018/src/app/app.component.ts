import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import {ScreenOrientation} from "@ionic-native/screen-orientation";

import { HomePage } from '../pages/home/home';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage = HomePage;

  constructor(platform: Platform, private screenOrientation:ScreenOrientation) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
      if(platform.is('cordova')){
        //plug ins are not available on browser; portrait mode is only locked if you are on a device
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
     }
    });
  }
}
