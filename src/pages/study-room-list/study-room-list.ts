import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-study-room-list',
  templateUrl: 'study-room-list.html'
})
export class StudyRoomListPage {

  first_level_rooms = [];
  second_level_rooms = [];
  third_level_rooms = [];
  fourth_level_rooms = [];
  plan_names: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.loadFirstLevelRooms();
    this.loadSecondLevelRooms();
    this.loadThirdLevelRooms();
    this.loadFourthLevelRooms();
    this.plan_names = this.navParams.get("plan_names");
  }

  ionViewDidLoad() {
    document.getElementById("first").innerHTML = this.plan_names[1];
    document.getElementById("second").innerHTML = this.plan_names[2];
    document.getElementById("third").innerHTML = this.plan_names[3];
    document.getElementById("fourth").innerHTML = this.plan_names[4];
    document.getElementById("firstNumber").innerHTML = this.first_level_rooms.length + " Rooms";
    document.getElementById("secondNumber").innerHTML = this.second_level_rooms.length + " Rooms";
    document.getElementById("thirdNumber").innerHTML = this.third_level_rooms.length + " Rooms";
    document.getElementById("fourthNumber").innerHTML = this.fourth_level_rooms.length + " Rooms";
  }

  loadFirstLevelRooms() {
    this.first_level_rooms.push("Room: 109, Size: Small");
    this.first_level_rooms.push("Room: 110, Size: Standard");
    this.first_level_rooms.push("Room: 111, Size: Small");
  }

  loadSecondLevelRooms() {
    this.second_level_rooms.push("Room: 202, Size: Standard");
    this.second_level_rooms.push("Room: 205, Size: Standard");
    this.second_level_rooms.push("Room: 220, Size: Very large");
    this.second_level_rooms.push("Room: 224, Size: Large");
    this.second_level_rooms.push("Room: 225, Size: Standard");
    this.second_level_rooms.push("Room: 226, Size: Standard");
    this.second_level_rooms.push("Room: 228, Size: Standard");
  }

  loadThirdLevelRooms() {
    this.third_level_rooms.push("Room: 301, Size: Standard");
    this.third_level_rooms.push("Room: 308, Size: Standard");
    this.third_level_rooms.push("Room: 309, Size: Standard");
    this.third_level_rooms.push("Room: 310, Size: Standard");
    this.third_level_rooms.push("Room: 311, Size: Standard");
    this.third_level_rooms.push("Room: 315, Size: Standard");
    this.third_level_rooms.push("Room: 316, Size: Standard");
    this.third_level_rooms.push("Room: 317, Size: Standard");
    this.third_level_rooms.push("Room: 319, Size: Standard");
  }

  loadFourthLevelRooms() {
    this.fourth_level_rooms.push("Room: 404, Size: Small");
    this.fourth_level_rooms.push("Room: 406, Size: Standard");
    this.fourth_level_rooms.push("Room: 411, Size: Standard");
    this.fourth_level_rooms.push("Room: 412, Size: Standard");
    this.fourth_level_rooms.push("Room: 413, Size: Very large");
    this.fourth_level_rooms.push("Room: 414, Size: Standard");
    this.fourth_level_rooms.push("Room: 415, Size: Standard");
  }
}
