import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { HTTP } from '@ionic-native/http'
import xml2js from 'xml2js';

// Server in which MySQL database resides.
const URL = 'http://knoxlablibrary.tcnj.edu/studyroomstatus.php';

// Terms used for each room size.
const SMALL = 4;
const STANDARD = 6;
const LARGE = 8;
const VERY_LARGE = 12;

/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: HTTP, public alertCtrl: AlertController) {
  }

  // Variables used by the SearchPage.
  inputValue = 0;
  studyrooms: any;
  availableRooms = [];
  availableRoomsSizes = [];
  roomSizes = [
    SMALL,
    STANDARD,
    SMALL,
    STANDARD,
    STANDARD,
    VERY_LARGE,
    0,
    LARGE,
    STANDARD,
    STANDARD,
    STANDARD,
    STANDARD,
    STANDARD,
    STANDARD,
    STANDARD,
    STANDARD,
    STANDARD,
    STANDARD,
    STANDARD,
    STANDARD,
    SMALL,
    STANDARD,
    STANDARD,
    STANDARD,
    VERY_LARGE,
    0,
    STANDARD,
    STANDARD,
    0,
  ];

  /*
    Before view becomes the active page, loads the XML data into the study rooms.
    variable.
  */
  ionViewWillEnter() {
    this.loadXML();
  }

  /*
    Loads study room data from the 'knoxlablibrary' database.
  */
  loadXML() {

    this.http.get(URL, {}, {})
    .then(data => {
      // console.log('Data Fetched:');
      // console.log(data.status);
      // console.log(data.data);
      // console.log(data.headers);
      data = data.data;
      this.parseXML(data).then((data) => {
        this.studyrooms = data;
        console.log("The parsed data:", JSON.stringify(this.studyrooms));
      });
    })
    .catch(error => {
      console.log('Error:');
      console.log(error.status);
      console.log(error.data);
      console.log(error.headers);
    });
  }

  /*
    Parses the data fetched. Sorts into individual floor arrays.
  */
  parseXML(data) {
    return new Promise(resolve => {
      var k,
      arr = [],
      parser = new xml2js.Parser({
        trim: true,
        explicitArray: true
      });

      parser.parseString(data, function (err, result){
        var obj1 = result.studyroomlist;
        for(k in obj1.room){
          var item = obj1.room[k];
          arr.push({
            name : item.name[0],
            status : item.status[0],
          });
        }
        resolve(arr);
      });

    });
  }

  /*
    Pop an alert to the user informing them that there are no study rooms.
  */
    ShowWifiAlert() {
    let alert = this.alertCtrl.create({
      title: 'TCNJ WiFi!',
      subTitle: 'You must be on the TCNJ WiFi to find available study rooms.',
      buttons: ['OK']
    });
    alert.present();
  }

  /*
    Fetches the necessary occupancy data from the server's database. Looks through
    each room to determine whether or not it has the correct number of seats and
    if it is available. Stops after it puts 3 rooms into 'availableRooms'.
  */
  findRooms() {

    // Clear the arrays from previous calls.
    this.availableRooms = [];
    this.availableRoomsSizes = [];

    // Clear the HTML result elements from previous calls.
    document.getElementById('result1').innerHTML = "";
    document.getElementById('result2').innerHTML = "";
    document.getElementById('result3').innerHTML = "";

    // Show the WiFi alery if the array is undefined.
    if(this.studyrooms === undefined) {
      this.ShowWifiAlert();
      return;
    }

    // Make the result label and line visible.
    document.getElementById('resultLabel').style.visibility = "visible";
    document.getElementById('line').style.visibility = "visible";

    // Inform the user if their number of students is invalid.
    if(this.inputValue <= 0) {
      document.getElementById('result1').innerHTML = "Invalid number of students. Please enter a positive number.";
      return;
    }

    // Find a max of 3 available rooms.
    let i = 0;
    while(this.availableRooms.length < 3 && i < this.studyrooms.length) {
      
      // For rooms with two sensors, check both and increase index again.
      if(i == 5 || i == 24) {
        if((this.studyrooms[i].status == 1 || this.studyrooms[i + 1].status) && this.roomSizes[i] >= this.inputValue) {
          this.availableRooms.push(this.studyrooms[i]);
          this.availableRoomsSizes.push(this.roomSizes[i]);
        }
        i++;
      }

      // Always skip the last room (this is the lab motion sensor).
      else if(i == 28) {
        i++;
        continue;
      }

      // For all other rooms with single motion sensors.
      else if(this.studyrooms[i].status == 1 && this.roomSizes[i] >= this.inputValue) {
        this.availableRooms.push(this.studyrooms[i]);
        this.availableRoomsSizes.push(this.roomSizes[i]);
      }

      // Always increase the index by one.
      i++;
    }

    // If there are no available rooms.
    if(this.availableRooms.length == 0) {
      document.getElementById('result1').innerHTML = "No study rooms available for this number of students.";
      document.getElementById('result2').innerHTML = "";
      document.getElementById('result3').innerHTML = "";
    }

    // If there are available rooms.
    else {
      for(let i = 1; i <= this.availableRooms.length; i++) {
        document.getElementById("result" + i).innerHTML = "Room " + this.availableRooms[i - 1].name.substring(10) + " - Fits " + this.availableRoomsSizes[i - 1] + " students.";
      }
    }

  }

}
