import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { InfoPage } from '../pages/info/info';
import { AboutPage } from '../pages/about/about';
import { ComputersPage } from '../pages/computers/computers';
import { StudyRoomsPage } from '../pages/study-rooms/study-rooms';
import { PrintersPage } from '../pages/printers/printers';
import { MapsPage } from '../pages/maps/maps';
import { GalleryPage } from '../pages/gallery/gallery';
import { SlidesPage } from '../pages/slides/slides'
import { KeyPage } from '../pages/key/key'
import { StudyRoomListPage } from '../pages/study-room-list/study-room-list'
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ZoomAreaModule } from 'ionic2-zoom-area';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { File } from '@ionic-native/file';



@NgModule({
  declarations: [
    MyApp,
    HomePage,
    InfoPage,
    AboutPage,
    StudyRoomsPage,
    ComputersPage,
    PrintersPage,
    MapsPage,
    GalleryPage,
    SlidesPage,
    KeyPage,
    StudyRoomListPage
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ZoomAreaModule.forRoot(),
    IonicModule.forRoot(MyApp),
    HttpModule,
    IonicImageViewerModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    InfoPage,
    AboutPage,
    StudyRoomsPage,
    ComputersPage,
    PrintersPage,
    MapsPage,
    GalleryPage,
    SlidesPage,
    KeyPage,
    StudyRoomListPage,
  ],
  providers: [
    ScreenOrientation,
    PhotoViewer,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
