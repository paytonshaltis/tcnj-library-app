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
import {ReservationsPage} from '../pages/reservations/reservations';
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
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule} from '@angular/common/http';
import { URLSearchParams } from '@angular/http';
import { HTTP } from '@ionic-native/http';
import { CompErrorsPage } from '../pages/comp-errors/comp-errors';
import { RoomErrorsPage } from '../pages/room-errors/room-errors';
import { SearchPage } from '../pages/search/search';


const routes: Routes = [
  {path: '', component: ReservationsPage}
];

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    InfoPage,
    AboutPage,
    StudyRoomsPage,
    ComputersPage,
    PrintersPage,
    ReservationsPage,
    MapsPage,
    GalleryPage,
    SlidesPage,
    KeyPage,
    StudyRoomListPage,
    CompErrorsPage,
    RoomErrorsPage,
    SearchPage,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    BrowserAnimationsModule,
    ZoomAreaModule.forRoot(),
    IonicModule.forRoot(MyApp),
    HttpModule,
    HttpClientModule,
    IonicImageViewerModule,
  ],
  bootstrap: [IonicApp],
  exports:[RouterModule],
  entryComponents: [
    MyApp,
    HomePage,
    InfoPage,
    AboutPage,
    StudyRoomsPage,
    ComputersPage,
    PrintersPage,
    ReservationsPage,
    MapsPage,
    GalleryPage,
    SlidesPage,
    KeyPage,
    StudyRoomListPage,
    CompErrorsPage,
    RoomErrorsPage,
    SearchPage,
  ],
  providers: [
    ScreenOrientation,
    PhotoViewer,
    File,
    HTTP,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
