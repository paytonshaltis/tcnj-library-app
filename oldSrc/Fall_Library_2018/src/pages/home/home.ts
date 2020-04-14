import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {InAppBrowser} from 'ionic-native';

/*
  Import the pages of the application that this page links to.
*/
import {InfoPage} from '../info/info';
import {AboutPage} from '../about/about';
import {StudyRoomsPage} from '../study-rooms/study-rooms';
import {ComputersPage} from '../computers/computers';
import {PrintersPage} from '../printers/printers';
import {MapsPage} from '../maps/maps';
import {SlidesPage} from '../slides/slides';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  /*
    Assign the imported pages to fields within the class, to be used in HTML.
  */
  infoPage = InfoPage;
  aboutPage = AboutPage;
  studyRoomsPage = StudyRoomsPage;
  computersPage = ComputersPage;
  printersPage = PrintersPage;
  mapsPage = MapsPage;
  slidesPage = SlidesPage;


  constructor(public navCtrl: NavController) {}

}
