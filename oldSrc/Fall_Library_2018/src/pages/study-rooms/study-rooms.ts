import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { KeyPage } from '../key/key';
import { StudyRoomListPage } from '../study-room-list/study-room-list';
import 'rxjs/add/operator/map';
import xml2js from 'xml2js';


@Component({
  selector: 'page-study-rooms',
  templateUrl: 'study-rooms.html'
})
export class StudyRoomsPage {

  current_floor = 5; //DS

  keyPage = KeyPage;
   // will hold the parsed XML of study room data
  studyrooms: any; //

  // Arrays to hold the studyrooms for each floor
  firstFloorRooms = []; //
  secondFloorRooms = []; //
  thirdFloorRooms = []; //
  fourthFloorRooms = []; //
  plans: Array<string> = [];
  plan_names: Array<string> = ["Lower", "First", "Second", "Third", "Fourth"];
  images = [];
  //square_size = 65;
  colors = ["#FF0000", "#00FF00","#ff8300"]; // array holding three colors: red, green, yellow (occupied, available, reserved)

  img_src = "";


  /*
    Obtain URI of each map and add to array. Add name of each map to second array.
    Create the images of the floor plans.
  */
  constructor(public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, public navCtrl: NavController, public http: Http) {
    for(let i = 0; i < 5; i++) {
      let plan_uri = "assets/floor_plans/".concat(i.toString(), ".png");
      this.plans.push(plan_uri);
      this.plan_names[i] = this.plan_names[i] + " Level";
      this.images.push(this.createImage(this.plans[i], this.plan_names[i]));
    }
  }

  refresh(){
    this.loadXML();
    //this.sleep(900);
    this.setUpStudyRooms();

    //console.log(this.thirdFloorRooms);
    //this.drawRooms(this.current_floor);
    this.showFloor(this.current_floor);
  }

  /*
    Before view becomes the active page, loads the XML data into the study rooms
    variable.
  */
  ionViewWillEnter() {
    //this.current_floor = 5;
    this.loadXML();
    setInterval(() => {this.refresh()}, 3000);
  }

  /*
    After view becomes the active page, sort through the study room variable to
    place study rooms into the correct floor arrays.
  */
  ionViewDidEnter() {
    this.setUpStudyRooms();
   //if(this.studyrooms !== undefined)
      //this.openActionSheet();
  }

  /*
    Access the server, obtain the data within, parse the data, then assign that
    data to the study room variable.
  */
  loadXML() {
    //console.log(this.http.get("http://knoxlablibrary.tcnj.edu/studyroomstatus.php"));
    //console.log("going to fetch url");
    //alert("here 1");
    this.http.get("http://knoxlablibrary.tcnj.edu/studyroomstatus.php")
    .map(res => res.text()).subscribe(data => {
      //alert("here 4");
      this.parseXML(data).then((data) => {
        this.studyrooms = data;
        this.setUpStudyRooms();
        //alert("here 2"); //doesn't happen
        this.showFloor(this.current_floor);
      });
    },(error => {alert(error);}));
      //console.log("fetched url");
      //alert("here 3");

  }

  /*
    Parse the XML input, creating 2-element arrays (name and status) for each
    study room in the data.
  */
  parseXML(data) {
    //alert("here 5");//doesn't happen

    return new Promise(resolve => {
      var k,
      arr = [],
      parser = new xml2js.Parser({
        trim: true,
        explicitArray: true
      });

      parser.parseString(data, function (err, result){
        var obj1 = result.studyroomlist;
        //console.log(obj1);
        for(k in obj1.room){
          var item = obj1.room[k];
          //console.log(item);
          arr.push({
            name : item.name[0],
            status : item.status[0],
          });
        }
        resolve(arr);
      });

      //alert("here 6");//doesn't happen

    });
  }

  /*
    When view loads, open the menu of floor options.
  */
  ionViewDidLoad() {
    this.openActionSheet();
  }

  ionViewDidLeave() {
    this.current_floor = 5;
  }

  /*
    Opens a menu with all of the floor options available. All of the buttons
    are inside of an array, and each button shows a different floor plan.
  */
  openActionSheet(){
    //await sleep(2000);
    let actionsheet = this.actionSheetCtrl.create({
      title:"Select View",
      buttons:[{
        text: this.plan_names[0],
        handler: () => {
          this.showFloor(0);
          this.current_floor = 0;
        }
      },{
        text: this.plan_names[1],
        handler: () => {
          this.showFloor(1);
          this.current_floor = 1;
        }
      },{
        text: this.plan_names[2],
        handler: () => {
          this.showFloor(2);
          this.current_floor = 2;
        }
      },{
        text: this.plan_names[3],
        handler: () => {
          this.showFloor(3);
          this.current_floor = 3;
        }
      },{
        text: this.plan_names[4],
        handler: () => {
          this.showFloor(4);
          this.current_floor = 4;
        }
      }, {
        text: "Study Room Information",
        handler: () => {
          this.navCtrl.pop();
          this.navCtrl.push(StudyRoomListPage, {
            plan_names: this.plan_names
          });
        }
      }, {
        text: 'Cancel',
        role: 'cancel',
      }]
    });
    actionsheet.present();
  }


  getSrc(){
    return this.img_src;
  }

  showFloor(floor_number: number) {

    /*
    Creates a blank background (no floor plan) for when you
    have not chosen a floor yet
    */

    if(floor_number === 5)
      return;

    // Set title of page
    //document.getElementById("floor_name").innerHTML = this.plan_names[floor_number];
    if (!document.getElementById("floor_name")) { return; }

    console.log(floor_number);
    document.getElementById("floor_name").innerHTML = this.plan_names[floor_number];

    // Create then adjusts the height and width of the canvas element
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let img = this.images[floor_number];
    canvas.height = img.height;
    canvas.width = img.width;

    // Create a context from the canvas, which it moves and rotates before drawing the floor plan onto it
    let ctx = canvas.getContext("2d");
    //ctx.translate(canvas.width,0);
    //ctx.rotate(90*Math.PI/180);
    ctx.drawImage(img,0,0);


    //Based on floor number, chooses which drawing method to run
    switch(floor_number) {
      case 0:
        this.lowerLevelStudyRooms();
        break;
      case 1:
        this.firstLevelStudyRooms();
        break;
      case 2:
        this.secondLevelStudyRooms();
        break;
      case 3:
        this.thirdLevelStudyRooms();
        break;
      case 4:
        this.fourthLevelStudyRooms();
        break;
      case 5:
        break;
    }

    // Save canvas converted image
    this.img_src = canvas.toDataURL();

    // Make the canvas disappear :o
    canvas.height = 0;
    canvas.width = 0;

    //this.drawRooms(floor_number);
  }

  //  Sets the values of an HTML img element to be used for drawing.
  createImage(src: string, title: string) {
    let img = new Image();
    img.src = src;
    img.alt = title;
    img.title = title;
    return img;
  }

  /*
    Clears the values in the arrays after each execution. This way, the array
    does not hold onto all the values from all the instances. The following
    functions only deal with the first couple indexes in each array.
  */
  clearFloorRooms() {
    this.firstFloorRooms = []; //
    this.secondFloorRooms = []; //
    this.thirdFloorRooms = []; //
    this.fourthFloorRooms = []; //
  }

  /*
    Loops through all of the study rooms, placing them into arrays based on floor
    and sorting them into the order that they will be used in.
  */
  setUpStudyRooms() {
    //console.log(this.studyrooms);
    if(this.studyrooms === undefined) {
      document.getElementById('floor_name').style.visibility = "hidden";
      document.getElementById('floor_button').style.visibility = "hidden";
      /*document.getElementById('info_icon').style.visibility = "hidden";*/
      this.ShowWifiAlert();
    }
    else {
      this.clearFloorRooms();
      for(let i = 0; i < this.studyrooms.length; i++) {
        if(i < 3)
        this.firstFloorRooms.push(this.studyrooms[i]);
        else if(i < 10)
        this.secondFloorRooms.push(this.studyrooms[i]);
        else if(i < 19)
        this.thirdFloorRooms.push(this.studyrooms[i]);
        else if(i < 26)
        this.fourthFloorRooms.push(this.studyrooms[i]);
      }
    }
  }

  //Pop an alert to the user informing them that there are no study rooms.
  ShowWifiAlert() {
    let alert = this.alertCtrl.create({
      title: 'TCNJ WiFi!',
      subTitle: 'You must be on the TCNJ WiFi to view study room availability.',
      buttons: ['OK']
    });
    alert.present();
  }

  //The following methods draw squares onto floor plans to represent study rooms
  lowerLevelStudyRooms() {
    /*let alert = this.alertCtrl.create({
      title: 'No study rooms!',
      subTitle: 'There are no study rooms on the lower floor.',
      buttons: ['OK']
    });
    alert.present();*/

  }

  firstLevelStudyRooms() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");
    let yCoord = 370;
    let index = 0;
    ctx.lineWidth=8;


// *********** room 109 ***************************************************
    ctx.strokeStyle = this.colors[this.firstFloorRooms[index].status];

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(359,yCoord);
    ctx.lineTo(359,(yCoord + 96));
    ctx.lineTo((359 + 75),(yCoord + 96));
    ctx.lineTo((359 + 75),yCoord);
    ctx.lineTo(359 - 4,yCoord);
    ctx.stroke();
    ctx.moveTo(359 ,yCoord);

    // Makes an X if occupied (red)
    if (this.firstFloorRooms[index].status == 0){
      ctx.lineTo((359 + 75),(yCoord + 96));
      ctx.moveTo((359+ 75),yCoord);
      ctx.lineTo(359,(yCoord + 96));
      ctx.stroke();
    }

    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('109', 366, 430);

// *********** room 110 ***************************************************
    index++;
    ctx.strokeStyle = this.colors[this.firstFloorRooms[index].status];
    //ctx.lineWidth=6;
    //Rectangle
    ctx.beginPath();
    ctx.moveTo(240,yCoord);
    ctx.lineTo(240,(yCoord + 96));
    ctx.lineTo((240 + 98),(yCoord + 96));
    ctx.lineTo((240+ 98),yCoord);
    ctx.lineTo(240 - 4,yCoord);
    ctx.stroke();
    ctx.moveTo(240,yCoord);

    // Makes an X if occupied (red)
    if (this.firstFloorRooms[index].status == 0){
      ctx.lineTo((240 + 98),(yCoord + 96));
      ctx.moveTo((240 + 98),yCoord);
      ctx.lineTo(240,(yCoord + 96));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('110', 260, 430);

// *********** Room 111 ***************************************************

    index++;
    ctx.strokeStyle = this.colors[this.firstFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(142,yCoord);
    ctx.lineTo(142,(yCoord + 96));
    ctx.lineTo((142 + 78),(yCoord + 96));
    ctx.lineTo((142+ 78),yCoord);
    ctx.lineTo(142 - 4,yCoord);
    ctx.stroke();
    ctx.moveTo(142,yCoord);

    // Makes an X if occupied (red)
    if (this.firstFloorRooms[index].status == 0){
      ctx.lineTo((142 + 78),(yCoord + 96));
      ctx.moveTo((142+ 78),yCoord);
      ctx.lineTo(142,(yCoord + 96));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('111', 151, 430);


  }

//Reservation display only implemented on the second floor (orange striped box)
  secondLevelStudyRooms() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");
    let yCoord = 475;
    let index = 0;

// *********** room 202 ***************************************************
    ctx.strokeStyle = this.colors[this.secondFloorRooms[index].status];

    ctx.lineWidth=8;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(604,yCoord );
    ctx.lineTo(604,(yCoord + 82));
    ctx.lineTo((604 + 120),(yCoord + 82));
    ctx.lineTo((604+ 120),yCoord);
    ctx.lineTo(604 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(604, yCoord);

    // Makes an X if occupied (red)
    if (this.secondFloorRooms[index].status == 0){
      ctx.lineTo((604 + 120),(yCoord + 82));
      ctx.moveTo((604+ 120),yCoord);
      ctx.lineTo(604,(yCoord + 82));
      ctx.stroke();
    }

    let w = 120;
    let h = 82;
    let xCoord = 604;

    // Stripes for Reserved
    if (this.firstFloorRooms[index].status == 2){
      ctx.moveTo((xCoord + ((3/4) * w)),yCoord);
      ctx.lineTo(xCoord + w ,(yCoord + ((1/4) * h)));
      ctx.moveTo(xCoord + w, (yCoord + ((1/2) * h)));
      ctx.lineTo((xCoord + ((1/2) * w)), yCoord);
      ctx.moveTo((xCoord + ((1/4) * w)), yCoord);
      ctx.lineTo((xCoord + w), (yCoord + ((3/4) * h)));
      ctx.moveTo((xCoord + w), (yCoord + h));
      ctx.lineTo(xCoord , yCoord);
      ctx.moveTo(xCoord,(yCoord + ((1/4) * h)));
      ctx.lineTo((xCoord + ((3/4) * w)), (yCoord + h));
      ctx.moveTo((xCoord + ((1/2) * w)), (yCoord + h));
      ctx.lineTo(xCoord, (yCoord + ((1/2) * h)));
      ctx.moveTo(xCoord, (yCoord + ((3/4) * h)));
      ctx.lineTo((xCoord + ((1/4) * w)), (yCoord + h));

      ctx.stroke();
    }

    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('202', 635, 530);

// *********** room 205 ***************************************************
    index++;
    ctx.strokeStyle = this.colors[this.secondFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(463,yCoord );
    ctx.lineTo(463,(yCoord + 82));
    ctx.lineTo((463 + 115),(yCoord + 82));
    ctx.lineTo((463+ 115),yCoord);
    ctx.lineTo(463 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(463, yCoord);

    // Makes an X if occupied (red)
    if (this.secondFloorRooms[index].status == 0){
      ctx.lineTo((463 + 115),(yCoord + 82));
      ctx.moveTo((463+ 115),yCoord);
      ctx.lineTo(463,(yCoord + 82));
      ctx.stroke();
    }

    w = 115;
    h = 82;
    xCoord = 463;

    // Stripes for Reserved
    if (this.secondFloorRooms[index].status == 2){
      ctx.moveTo((xCoord + ((3/4) * w)),yCoord);
      ctx.lineTo(xCoord + w ,(yCoord + ((1/4) * h)));
      ctx.moveTo(xCoord + w, (yCoord + ((1/2) * h)));
      ctx.lineTo((xCoord + ((1/2) * w)), yCoord);
      ctx.moveTo((xCoord + ((1/4) * w)), yCoord);
      ctx.lineTo((xCoord + w), (yCoord + ((3/4) * h)));
      ctx.moveTo((xCoord + w), (yCoord + h));
      ctx.lineTo(xCoord , yCoord);
      ctx.moveTo(xCoord,(yCoord + ((1/4) * h)));
      ctx.lineTo((xCoord + ((3/4) * w)), (yCoord + h));
      ctx.moveTo((xCoord + ((1/2) * w)), (yCoord + h));
      ctx.lineTo(xCoord, (yCoord + ((1/2) * h)));
      ctx.moveTo(xCoord, (yCoord + ((3/4) * h)));
      ctx.lineTo((xCoord + ((1/4) * w)), (yCoord + h));

      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('205', 493, 530);

// *********** room 220 ***************************************************
    yCoord = 1150;

    index++;
    ctx.strokeStyle = this.colors[this.secondFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1457,yCoord );
    ctx.lineTo(1457,(yCoord + 175));
    ctx.lineTo((1457 + 122),(yCoord + 175));
    ctx.lineTo((1457+ 122),yCoord);
    ctx.lineTo(1457 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1457, yCoord);

    // Makes an X if occupied (red)
    if (this.secondFloorRooms[index].status == 0){
      ctx.lineTo((1457 + 122),(yCoord + 175));
      ctx.moveTo((1457+ 122),yCoord);
      ctx.lineTo(1457,(yCoord + 175));
      ctx.stroke();
    }

    w = 122;
    h = 175;
    xCoord = 1457;

    // Stripes for Reserved
    if (this.secondFloorRooms[index].status == 2){
      ctx.moveTo((xCoord + ((3/4) * w)),yCoord);
      ctx.lineTo(xCoord + w ,(yCoord + ((1/4) * h)));
      ctx.moveTo(xCoord + w, (yCoord + ((1/2) * h)));
      ctx.lineTo((xCoord + ((1/2) * w)), yCoord);
      ctx.moveTo((xCoord + ((1/4) * w)), yCoord);
      ctx.lineTo((xCoord + w), (yCoord + ((3/4) * h)));
      ctx.moveTo((xCoord + w), (yCoord + h));
      ctx.lineTo(xCoord , yCoord);
      ctx.moveTo(xCoord,(yCoord + ((1/4) * h)));
      ctx.lineTo((xCoord + ((3/4) * w)), (yCoord + h));
      ctx.moveTo((xCoord + ((1/2) * w)), (yCoord + h));
      ctx.lineTo(xCoord, (yCoord + ((1/2) * h)));
      ctx.moveTo(xCoord, (yCoord + ((3/4) * h)));
      ctx.lineTo((xCoord + ((1/4) * w)), (yCoord + h));

      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('220',1490, 1250);


// *********** room 224 ***************************************************
    yCoord = 570;

    index++;
    ctx.strokeStyle = this.colors[this.secondFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1334,yCoord );
    ctx.lineTo(1334,(yCoord + 125));
    ctx.lineTo((1334 + 91),(yCoord + 125));
    ctx.lineTo((1334 + 91),yCoord);
    ctx.lineTo(1334 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1344, yCoord);

    // Makes an X if occupied (red)
    if (this.secondFloorRooms[index].status == 0){
      ctx.lineTo((1334 + 91),(yCoord + 125));
      ctx.moveTo((1334+ 91),yCoord);
      ctx.lineTo(1334,(yCoord + 125));
      ctx.stroke();
    }

    w = 91;
    h = 125;
    xCoord = 1334;

    // Stripes for Reserved
    if (this.secondFloorRooms[index].status == 2){
      ctx.moveTo((xCoord + ((3/4) * w)),yCoord);
      ctx.lineTo(xCoord + w ,(yCoord + ((1/4) * h)));
      ctx.moveTo(xCoord + w, (yCoord + ((1/2) * h)));
      ctx.lineTo((xCoord + ((1/2) * w)), yCoord);
      ctx.moveTo((xCoord + ((1/4) * w)), yCoord);
      ctx.lineTo((xCoord + w), (yCoord + ((3/4) * h)));
      ctx.moveTo((xCoord + w), (yCoord + h));
      ctx.lineTo(xCoord , yCoord);
      ctx.moveTo(xCoord,(yCoord + ((1/4) * h)));
      ctx.lineTo((xCoord + ((3/4) * w)), (yCoord + h));
      ctx.moveTo((xCoord + ((1/2) * w)), (yCoord + h));
      ctx.lineTo(xCoord, (yCoord + ((1/2) * h)));
      ctx.moveTo(xCoord, (yCoord + ((3/4) * h)));
      ctx.lineTo((xCoord + ((1/4) * w)), (yCoord + h));

      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('224',1350, 645);


// *********** room 225 ***************************************************
    yCoord = 570;

    index++;
    ctx.strokeStyle = this.colors[this.secondFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1458,yCoord );
    ctx.lineTo(1458,(yCoord + 125));
    ctx.lineTo((1458 + 72),(yCoord + 125));
    ctx.lineTo((1458 +72),yCoord);
    ctx.lineTo(1458 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1458, yCoord);

    // Makes an X if occupied (red)
    if (this.secondFloorRooms[index].status == 0){
      ctx.lineTo((1458 + 72),(yCoord + 125));
      ctx.moveTo((1458+72),yCoord);
      ctx.lineTo(1458,(yCoord + 125));
      ctx.stroke();
    }

    w = 72;
    h = 125;
    xCoord = 1458;

    // Stripes for Reserved
    if (this.secondFloorRooms[index].status == 2){
      ctx.moveTo((xCoord + ((3/4) * w)),yCoord);
      ctx.lineTo(xCoord + w ,(yCoord + ((1/4) * h)));
      ctx.moveTo(xCoord + w, (yCoord + ((1/2) * h)));
      ctx.lineTo((xCoord + ((1/2) * w)), yCoord);
      ctx.moveTo((xCoord + ((1/4) * w)), yCoord);
      ctx.lineTo((xCoord + w), (yCoord + ((3/4) * h)));
      ctx.moveTo((xCoord + w), (yCoord + h));
      ctx.lineTo(xCoord , yCoord);
      ctx.moveTo(xCoord,(yCoord + ((1/4) * h)));
      ctx.lineTo((xCoord + ((3/4) * w)), (yCoord + h));
      ctx.moveTo((xCoord + ((1/2) * w)), (yCoord + h));
      ctx.lineTo(xCoord, (yCoord + ((1/2) * h)));
      ctx.moveTo(xCoord, (yCoord + ((3/4) * h)));
      ctx.lineTo((xCoord + ((1/4) * w)), (yCoord + h));

      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('225',1466, 645);


// *********** room 226 ***************************************************
    yCoord = 874;

    index++;
    ctx.strokeStyle = this.colors[this.secondFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1455,yCoord );
    ctx.lineTo(1455,(yCoord + 75));
    ctx.lineTo((1455 + 122),(yCoord + 75));
    ctx.lineTo((1455 +122),yCoord);
    ctx.lineTo(1455 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1455, yCoord);


    // Makes an X if occupied (red)
    if (this.secondFloorRooms[index].status == 0){
      ctx.lineTo((1455 + 122),(yCoord +75));
      ctx.moveTo((1455+122),yCoord);
      ctx.lineTo(1455,(yCoord + 75));
      ctx.stroke();
    }

    w = 122;
    h = 75;
    xCoord = 1455;

    // Stripes for Reserved
    if (this.secondFloorRooms[index].status == 2){
      ctx.moveTo((xCoord + ((3/4) * w)),yCoord);
      ctx.lineTo(xCoord + w ,(yCoord + ((1/4) * h)));
      ctx.moveTo(xCoord + w, (yCoord + ((1/2) * h)));
      ctx.lineTo((xCoord + ((1/2) * w)), yCoord);
      ctx.moveTo((xCoord + ((1/4) * w)), yCoord);
      ctx.lineTo((xCoord + w), (yCoord + ((3/4) * h)));
      ctx.moveTo((xCoord + w), (yCoord + h));
      ctx.lineTo(xCoord , yCoord);
      ctx.moveTo(xCoord,(yCoord + ((1/4) * h)));
      ctx.lineTo((xCoord + ((3/4) * w)), (yCoord + h));
      ctx.moveTo((xCoord + ((1/2) * w)), (yCoord + h));
      ctx.lineTo(xCoord, (yCoord + ((1/2) * h)));
      ctx.moveTo(xCoord, (yCoord + ((3/4) * h)));
      ctx.lineTo((xCoord + ((1/4) * w)), (yCoord + h));

      ctx.stroke();
    }

    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('226',1488, 924);


// *********** room 228 ***************************************************
    yCoord = 475;

    index++;
    ctx.strokeStyle = this.colors[this.secondFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1602,yCoord );
    ctx.lineTo(1602,(yCoord + 80));
    ctx.lineTo((1602 + 122),(yCoord + 80));
    ctx.lineTo((1602 + 122),yCoord);
    ctx.lineTo(1602 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1602, yCoord);

    // Makes an X if occupied (red)
    if (this.secondFloorRooms[index].status == 0){
      ctx.lineTo((1602 + 122),(yCoord + 80));
      ctx.moveTo((1602 + 122),yCoord);
      ctx.lineTo(1602,(yCoord + 80));
      ctx.stroke();
    }

    w = 122;
    h = 80;
    xCoord = 1602;

    // Stripes for Reserved
    if (this.secondFloorRooms[index].status == 2){
      ctx.moveTo((xCoord + ((3/4) * w)),yCoord);
      ctx.lineTo(xCoord + w ,(yCoord + ((1/4) * h)));
      ctx.moveTo(xCoord + w, (yCoord + ((1/2) * h)));
      ctx.lineTo((xCoord + ((1/2) * w)), yCoord);
      ctx.moveTo((xCoord + ((1/4) * w)), yCoord);
      ctx.lineTo((xCoord + w), (yCoord + ((3/4) * h)));
      ctx.moveTo((xCoord + w), (yCoord + h));
      ctx.lineTo(xCoord , yCoord);
      ctx.moveTo(xCoord,(yCoord + ((1/4) * h)));
      ctx.lineTo((xCoord + ((3/4) * w)), (yCoord + h));
      ctx.moveTo((xCoord + ((1/2) * w)), (yCoord + h));
      ctx.lineTo(xCoord, (yCoord + ((1/2) * h)));
      ctx.moveTo(xCoord, (yCoord + ((3/4) * h)));
      ctx.lineTo((xCoord + ((1/4) * w)), (yCoord + h));

      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('228',1633, 528);

  }

  thirdLevelStudyRooms() {

    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");
    let index = 0;

// *********** room 301 ***************************************************
    let yCoord = 468;

    //index++;
    ctx.strokeStyle = this.colors[this.thirdFloorRooms[index].status];
    ctx.lineWidth=8;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(612,yCoord );
    ctx.lineTo(612,(yCoord + 80));
    ctx.lineTo((612 + 112),(yCoord + 80));
    ctx.lineTo((612 + 112),yCoord);
    ctx.lineTo(612 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(610, yCoord);

    // Makes an X if occupied (red)
    if (this.thirdFloorRooms[index].status == 0){
      ctx.lineTo((612 + 112),(yCoord + 80));
      ctx.moveTo((612 + 112),yCoord);
      ctx.lineTo(612,(yCoord + 80));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('301',638, 520);

// ***********  room 308 ***************************************************

    yCoord = 956;

    index++;
    ctx.strokeStyle = this.colors[this.thirdFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1740,yCoord );
    ctx.lineTo(1740,(yCoord + 112));
    ctx.lineTo((1740 + 76),(yCoord + 112));
    ctx.lineTo((1740 + 76),yCoord);
    ctx.lineTo(1740 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1740, yCoord);

    // Makes an X if occupied (red)
    if (this.thirdFloorRooms[index].status == 0){
      ctx.lineTo((1740 + 76),(yCoord + 112));
      ctx.moveTo((1740 + 76),yCoord);
      ctx.lineTo(1740,(yCoord + 112));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('308',1749, 1024);


// *********** room 309 ***************************************************

    yCoord = 1100;

    index++;
    ctx.strokeStyle = this.colors[this.thirdFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1740,yCoord );
    ctx.lineTo(1740,(yCoord + 112));
    ctx.lineTo((1740 + 76),(yCoord + 112));
    ctx.lineTo((1740 + 76),yCoord);
    ctx.lineTo(1740 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1740, yCoord);

    // Makes an X if occupied (red)
    if (this.thirdFloorRooms[index].status == 0){
      ctx.lineTo((1740 + 76),(yCoord + 112));
      ctx.moveTo((1740 + 76),yCoord);
      ctx.lineTo(1740,(yCoord + 112));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('309',1749, 1170);

// *********** room 310 ***************************************************

    yCoord = 1143;

    index++;
    ctx.strokeStyle = this.colors[this.thirdFloorRooms[index].status];

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1468,yCoord );
    ctx.lineTo(1468,(yCoord + 73));
    ctx.lineTo((1468 + 113),(yCoord + 73));
    ctx.lineTo((1468 + 113),yCoord);
    ctx.lineTo(1468 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1468, yCoord);

    // Makes an X if occupied (red)
    if (this.thirdFloorRooms[index].status == 0){
      ctx.lineTo((1468 + 113),(yCoord + 73));
      ctx.moveTo((1468 + 113),yCoord);
      ctx.lineTo(1468,(yCoord + 73));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('310',1493, 1194);

// *********** room 311 ***************************************************

    yCoord = 1240;

    index++;
    ctx.strokeStyle = this.colors[this.thirdFloorRooms[index].status];

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1468,yCoord );
    ctx.lineTo(1468,(yCoord + 73));
    ctx.lineTo((1468 + 113),(yCoord + 73));
    ctx.lineTo((1468 + 113),yCoord);
    ctx.lineTo(1468 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1468, yCoord);

    // Makes an X if occupied (red)
    if (this.thirdFloorRooms[index].status == 0){
      ctx.lineTo((1468 + 113),(yCoord + 73));
      ctx.moveTo((1468 + 113),yCoord);
      ctx.lineTo(1468,(yCoord + 73));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('311',1496, 1289);

// *********** room 315 ***************************************************

    yCoord = 570;

    index++;
    ctx.strokeStyle = this.colors[this.thirdFloorRooms[index].status];

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1361,yCoord );
    ctx.lineTo(1361,(yCoord + 118));
    ctx.lineTo((1361 + 73),(yCoord + 118));
    ctx.lineTo((1361 + 73),yCoord);
    ctx.lineTo(1361 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1361, yCoord);

    // Makes an X if occupied (red)
    if (this.thirdFloorRooms[index].status == 0){
      ctx.lineTo((1361 + 73),(yCoord + 118));
      ctx.moveTo((1361 + 73),yCoord);
      ctx.lineTo(1361,(yCoord + 118));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('315',1367, 640);


// *********** room 316 ***************************************************

    yCoord = 570;

    index++;
    ctx.strokeStyle = this.colors[this.thirdFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1458,yCoord );
    ctx.lineTo(1458,(yCoord + 118));
    ctx.lineTo((1458 + 73),(yCoord + 118));
    ctx.lineTo((1458+ 73),yCoord);
    ctx.lineTo(1458 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1458, yCoord);

    // Makes an X if occupied (red)
    if (this.thirdFloorRooms[index].status == 0){
      ctx.lineTo((1458 + 73),(yCoord + 118));
      ctx.moveTo((1458 + 73),yCoord);
      ctx.lineTo(1458,(yCoord + 118));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('316',1465, 640);


// *********** room 317 ***************************************************

    yCoord = 825;

    index++;
    ctx.strokeStyle = this.colors[this.thirdFloorRooms[index].status];

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1458,yCoord );
    ctx.lineTo(1458,(yCoord + 118));
    ctx.lineTo((1458 + 73),(yCoord + 118));
    ctx.lineTo((1458+ 73),yCoord);
    ctx.lineTo(1458 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1458, yCoord);

    // Makes an X if occupied (red)
    if (this.thirdFloorRooms[index].status == 0){
      ctx.lineTo((1458 + 73),(yCoord + 118));
      ctx.moveTo((1458 + 73),yCoord);
      ctx.lineTo(1458,(yCoord + 118));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('317',1465, 897);


// *********** room 319 ***************************************************

    yCoord = 468;

    index++;
    ctx.strokeStyle = this.colors[this.thirdFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1608,yCoord );
    ctx.lineTo(1608,(yCoord + 80));
    ctx.lineTo((1608 + 113),(yCoord + 80));
    ctx.lineTo((1608 + 113),yCoord);
    ctx.lineTo(1608 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1608, yCoord);

    // Makes an X if occupied (red)
    if (this.thirdFloorRooms[index].status == 0){
      ctx.lineTo((1608 + 113),(yCoord + 80));
      ctx.moveTo((1608 + 113),yCoord);
      ctx.lineTo(1608,(yCoord + 80));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('319',1635, 520);

  }

  fourthLevelStudyRooms() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");
    let index = 0;


// *********** Room 406 ***************************************************
    let yCoord = 1587;

    ctx.strokeStyle = this.colors[this.fourthFloorRooms[index].status];
    ctx.lineWidth=8;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(230,yCoord );
    ctx.lineTo(230,(yCoord + 72));
    ctx.lineTo((230 + 119),(yCoord + 72));
    ctx.lineTo((230 + 119),yCoord);
    ctx.lineTo(230 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(230, yCoord);

    // Makes an X if occupied (red)
    if (this.fourthFloorRooms[index].status == 0){
      ctx.lineTo((230 + 119),(yCoord + 72));
      ctx.moveTo((230 + 119),yCoord);
      ctx.lineTo(230,(yCoord + 72));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('406',260, 1636);


// *********** room 404 ***************************************************

    yCoord = 901;
    index++;

    ctx.strokeStyle = this.colors[this.fourthFloorRooms[index].status];

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(223,yCoord );
    ctx.lineTo(223,(yCoord + 64));
    ctx.lineTo((223 + 118),(yCoord + 64));
    ctx.lineTo((223 + 118),yCoord);
    ctx.lineTo(223 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(224, yCoord);

    // Makes an X if occupied (red)
    if (this.fourthFloorRooms[index].status == 0){
      ctx.lineTo((223 + 118),(yCoord + 64));
      ctx.moveTo((223 + 118),yCoord);
      ctx.lineTo(223,(yCoord + 64));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('404',254, 946);


// *********** room 411 ***************************************************

    yCoord = 774;
    index++;

    ctx.strokeStyle = this.colors[this.fourthFloorRooms[index].status];

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1686,yCoord );
    ctx.lineTo(1686,(yCoord + 114));
    ctx.lineTo((1686 + 73),(yCoord + 114));
    ctx.lineTo((1686 + 73),yCoord);
    ctx.lineTo(1686 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1686, yCoord);

    // Makes an X if occupied (red)
    if (this.fourthFloorRooms[index].status == 0){
      ctx.lineTo((1686 + 73),(yCoord + 114));
      ctx.moveTo((1686 + 73),yCoord);
      ctx.lineTo(1686,(yCoord + 114));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('412',1693, 842);

// *********** room 412 ***************************************************

    yCoord = 774;
    index++;

    ctx.strokeStyle = this.colors[this.fourthFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1785,yCoord );
    ctx.lineTo(1785,(yCoord + 114));
    ctx.lineTo((1785 + 73),(yCoord + 114));
    ctx.lineTo((1785 + 73),yCoord);
    ctx.lineTo(1785 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1785, yCoord);

    // Makes an X if occupied (red)
    if (this.fourthFloorRooms[index].status == 0){
      ctx.lineTo((1785 + 73),(yCoord + 114));
      ctx.moveTo((1785 + 73),yCoord);
      ctx.lineTo(1785,(yCoord + 114));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('411',1794, 842);


// *********** room 413 ***************************************************

    yCoord = 1128;
    index++;

    ctx.strokeStyle = this.colors[this.fourthFloorRooms[index].status];
    //ctx.lineWidth=6;

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1505,yCoord );
    ctx.lineTo(1505,(yCoord + 55));
    ctx.lineTo((1505 - 50),(yCoord + 55));
    ctx.lineTo((1505 - 50),(yCoord + 88));
    ctx.lineTo((1505 - 38), (yCoord + 90));
    ctx.lineTo((1505 - 38), (yCoord + 173));
    ctx.lineTo((1505 + 77), (yCoord + 173));
    ctx.lineTo((1505 + 77), yCoord);
    ctx.lineTo(1505 - 4, yCoord );
    ctx.stroke();

    ctx.moveTo((1505 + 77), yCoord);

    // Makes an X if occupied (red)
    if (this.fourthFloorRooms[index].status == 0){
      ctx.lineTo((1503 - 38), (yCoord + 173));
      ctx.moveTo((1503 + 77), (yCoord + 173));
      ctx.lineTo((1503 - 18), (yCoord + 55));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('413', 1494, 1242);



// *********** 414 ***************************************************

    yCoord = 1329;
    index++;

    ctx.strokeStyle = this.colors[this.fourthFloorRooms[index].status];

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1500,yCoord );
    ctx.lineTo(1500,(yCoord + 132));
    ctx.lineTo((1500 + 78),(yCoord + 132));
    ctx.lineTo((1500 + 78),yCoord);
    ctx.lineTo(1500 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1500, yCoord);

    // Makes an X if occupied (red)
    if (this.fourthFloorRooms[index].status == 0){
      ctx.lineTo((1500 + 78),(yCoord + 132));
      ctx.moveTo((1500 + 78),yCoord);
      ctx.lineTo(1500,(yCoord + 132));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('414',1510, 1408);


// *********** room 415 ***************************************************

    yCoord = 1329;
    index++;

    ctx.strokeStyle = this.colors[this.fourthFloorRooms[index].status];

    //Rectangle
    ctx.beginPath();
    ctx.moveTo(1395,yCoord );
    ctx.lineTo(1395,(yCoord + 132));
    ctx.lineTo((1395 + 78),(yCoord + 132));
    ctx.lineTo((1395 + 78),yCoord);
    ctx.lineTo(1395 - 4, yCoord);
    ctx.stroke();
    ctx.moveTo(1395, yCoord);

    // Makes an X if occupied (red)
    if (this.fourthFloorRooms[index].status == 0){
      ctx.lineTo((1395 + 78),(yCoord + 132));
      ctx.moveTo((1395 + 78),yCoord);
      ctx.lineTo(1395,(yCoord + 132));
      ctx.stroke();
    }
    ctx.closePath();

    ctx.font = '40px serif';
    ctx.fillStyle = 'black';

    ctx.fillText('415',1404, 1408);

  }
}
