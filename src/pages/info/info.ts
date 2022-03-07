import { Component } from '@angular/core';
import { Platform, NavController, NavParams} from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';
import { VpnPage } from '../vpn/vpn';

@Component({
  selector: 'page-info',
  templateUrl: 'info.html'
})

export class InfoPage {

  platform: any;
  vpnPage = VpnPage;

  /*
    Discovers the platform that the app is running on.
  */
  static get parameters() {
    return [[Platform]];
  }

  /*
    Instantiates the platform field to the platform the app is running on.
  */
  constructor(public navCtrl: NavController, platform) {
    this.platform = platform;
  }

  /*
    Creates an instance of InAppBrowser plugin to launch the given URL in the
    default browser of the platform.
  */
  launch(url) {
    this.platform.ready().then(() => {
        new InAppBrowser(url, "_system", "location=yes");
    });
}
}
