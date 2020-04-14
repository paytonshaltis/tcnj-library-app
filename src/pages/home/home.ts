import {Component} from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import {InAppBrowser} from 'ionic-native';

/*
  Import the pages of the application that this page links to.
*/
import {InfoPage} from '../info/info';
import {AboutPage} from '../about/about';
import {StudyRoomsPage} from '../study-rooms/study-rooms';
import {ComputersPage} from '../computers/computers';
import {PrintersPage} from '../printers/printers';
//import {ReservationsPage} from '../reservations/reservations';
import {MapsPage} from '../maps/maps';
import {SlidesPage} from '../slides/slides';

//declare var SqlServer: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

  /*
    Assign the imported pages to fields within the class, to be used in HTML.
  */

 broken: any;
 mes: any;

  infoPage = InfoPage;
  aboutPage = AboutPage;
  studyRoomsPage = StudyRoomsPage;
  computersPage = ComputersPage;
  printersPage = PrintersPage;
  //reservationsPage = ReservationsPage;
  mapsPage = MapsPage;
  slidesPage = SlidesPage;


  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public http: Http) {
  }

  ngOnInit() {
    this.http.get("http://knoxlablibrary.tcnj.edu/brokenmessage.php").subscribe( data => {
      this.broken = data.text();
      if (this.broken === "none") {
        console.log ("Nothing");
      } else {
        this.showWifiAlert();
      }
  });
  }

  showWifiAlert() {
    var space = " ";
    this.http.get("http://knoxlablibrary.tcnj.edu/brokenmessage.php").subscribe( data => {
      this.broken = data.text();
      console.log (this.broken);
      space = this.broken.toString();
      console.log (space);
      let alert = this.alertCtrl.create({
        title: '<center> NOTICE </center>',
        subTitle: 'The following rooms and computers are currently offline. They will appear as occupied on the maps:',
        message: '' + space,
        buttons: ['OK']
      });
      alert.present();
   });
  }

}
