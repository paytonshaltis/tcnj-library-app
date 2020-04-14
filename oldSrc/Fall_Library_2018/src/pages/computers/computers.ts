import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { ActionSheetController, NavParams, AlertController } from 'ionic-angular';
import { KeyPage } from '../key/key';
import 'rxjs/add/operator/map';
import xml2js from 'xml2js';

@Component({
  selector: 'page-computers',
  templateUrl: 'computers.html'
})
export class ComputersPage {

  keyPage = KeyPage;

  computers: any;     // will hold the parsed XML of computer data

  // Arrays to hold the computers for each floor
  basementComps = [];
  firstFloorComps = [];
  secondFloorComps = [];
  fourthFloorComps = [];

  plans: Array<string> = [];
  plan_names: Array<string> = ["Lower Level", "First", "Second", "Third", "Fourth"];
  images = [];
  square_size = 25;
  colors = ["#FF0000", "#00FF00"]; // array holding two colors: red and green

  img_src = "";

  /*
    Obtain URI of each map and add to array. Add name of each map to second array.
    Create the images of the floor plans.
  */
  constructor(public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, public http: Http) {
    for(let i = 0; i < 5; i++) {
      let plan_uri = "assets/floor_plans/".concat(i.toString(), "_comp.png");
      this.plans.push(plan_uri);
      if(i > 0)
        this.plan_names[i] = this.plan_names[i] + " Level";
      this.images.push(this.createImage(this.plans[i], this.plan_names[i]));
    }
  }

  /*
    Before view becomes the active page, loads the XML data into the computers
    variable.
  */
  ionViewWillEnter() {
    this.loadXML();
  }

  /*
    After view becomes the active page, sort through the computers variable to
    place computers into the correct floor arrays.
  */
  ionViewDidEnter() {
    this.setUpComps();
    if(this.computers !== undefined)
      this.openActionSheet();
  }

  /*
    Access the server, obtain the data within, parse the data, then assign that
    data to the computers variable.
  */
  loadXML() {
    this.http.get("http://knoxlablibrary.tcnj.edu/compstatus.php")
    .map(res => res.text())
    .subscribe(
    data => {
    this.parseXML(data).then((data) => {
    this.computers = data;
        });
      });
    }

  /*
    Parse the XML input, creating 2-element arrays (name and status) for each
    computer in the data.
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
        var obj = result.computerlist;
        //console.log(obj);
        for(k in obj.comp){
          var item = obj.comp[k];
          //console.log(item);
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
    Open a menu with all of the floor options available. All of the buttons
    are inside of an array, and each button shows a different floor plan.
  */
  openActionSheet(){
    let actionsheet = this.actionSheetCtrl.create({
      title:"Select Floor",
      buttons:[{
        text: this.plan_names[0],
        handler: () => {
          this.showFloor(0);
        }
      },{
        text: this.plan_names[1],
        handler: () => {
          this.showFloor(1);
        }
      },{
        text: this.plan_names[2],
        handler: () => {
          this.showFloor(2);
        }
      },{
        text: this.plan_names[3],
        handler: () => {
          this.showFloor(3);
        }
      },{
        text: this.plan_names[4],
        handler: () => {
          this.showFloor(4);
        }
      }, {
        text: 'Cancel',
        role: 'cancel',
      }]
    });
    actionsheet.present();
  }

  // Returns converted canvas image
  getSrc(){
    return this.img_src;
  }

  /*
    Display the floor plan specified by the input, then call one of the functions
    to draw computers onto the floor plan, based on the floor number.
  */
  showFloor(floor_number: number) {
    // Set title of page
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

    // Based on floor number, chooses which drawing method to run
    switch(floor_number) {
      case 0:
        this.lowerLevelComputers();
        break;
      case 1:
        this.firstLevelComputers();
        break;
      case 2:
        this.secondLevelComputers();
        break;
      case 3:
        this.showNoComputersAlert();
        break;
      case 4:
        this.fourthLevelComputers();
        break;
    }

    // Save canvas converted image
    this.img_src = canvas.toDataURL();

    // Make the canvas disappear :o
    canvas.height = 0;
    canvas.width = 0;
  }

  /*
    Set the values of an HTML img element to be used for drawing.
  */
  createImage(src: string, title: string) {
    let img = new Image();
    img.src = src;
    img.alt = title;
    img.title = title;
    return img;
  }

  /*
    Loops through all of the computers, placing them into arrays based on floor
    and sorting them into the order that they will be used in.
  */
  setUpComps() {
    if(this.computers === undefined) {
      document.getElementById('floor_name').style.visibility = "hidden";
      document.getElementById('floor_button').style.visibility = "hidden";
      document.getElementById('info_icon').style.visibility = "hidden";
      this.showWifiAlert();
    }
    else {
      for(let i = 0; i < this.computers.length; i++) {
        if(this.computers[i].name.includes("LIBP1")){
          this.firstFloorComps.push(this.computers[i]);
        }
        else if(this.computers[i].name.includes("LIBP4")){
          this.fourthFloorComps.push(this.computers[i]);
        }
        else if(this.computers[i].name.includes("LIBP2")){
          this.secondFloorComps.push(this.computers[i]);
        }
        else {
          this.basementComps.push(this.computers[i]);
        }
      }
    }
    this.firstFloorComps.sort(function(a, b) {
      if((<string>a.name) < (<string>b.name))
        return -1;
      else
        return 1;
    });

    this.firstFloorComps = this.firstFloorComps.concat(this.firstFloorComps.splice(0,5));
  }

  /*
    Pop an alert to the user informing them that there are no computers.
  */
  showWifiAlert() {
    let alert = this.alertCtrl.create({
      title: 'TCNJ WiFi!',
      subTitle: 'You must be on the TCNJ WiFi to view computer availability.',
      buttons: ['OK']
    });
    alert.present();
  }

  /*
    Draw computer rectangles that are 30x30, coordinates entered manually
  */
  lowerLevelComputers() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");

    // Draw computers in Instructional Lab 2
    let index = 0;


    let xCoord = 896;
    let yCoord = 963;
    let direction = false;
    for(let i = 0; i < 5; i++) {
      yCoord -= 33;
      if(i == 2) {
        continue;
      }
      direction = !direction;
      for(let j = 0; j < 6; j++) {
        if(direction){
          xCoord -= 33;
        }
        else{
          xCoord += 33;
        }

        if(this.basementComps[index].status == 0 ){
          ctx.lineWidth = 8;
          ctx.strokeStyle = this.colors[this.basementComps[index].status];

          ctx.beginPath();
          ctx.moveTo(yCoord,xCoord);
          ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
          ctx.moveTo(yCoord,(xCoord +this.square_size));
          ctx.lineTo((yCoord + this.square_size),xCoord);
          ctx.stroke();
          ctx.closePath();

          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';
        }
        else {
          ctx.beginPath();

          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';
          ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
          ctx.fillStyle = this.colors[this.basementComps[index].status];
          ctx.closePath();
          ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);

        }
        index++;
      }
      if(direction)
        xCoord -= 33;
      else
        xCoord += 33;
    }


    for(let i = 0; i < 4; i++) {

      if(this.basementComps[index].status == 0 ){
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.colors[this.basementComps[index].status];

        ctx.beginPath();
        ctx.moveTo(yCoord,xCoord);
        ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
        ctx.moveTo(yCoord,(xCoord +this.square_size));
        ctx.lineTo((yCoord + this.square_size),xCoord);
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
      }
      else {
        ctx.beginPath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(745, xCoord, this.square_size, this.square_size);
        ctx.fillStyle = this.colors[this.basementComps[index].status];
        ctx.closePath();
        ctx.fillRect(745, xCoord, this.square_size, this.square_size);
      }

      xCoord -= 33;
      index++;
    }

    // Draw computers in Instruction Lab 5
    yCoord = 1307;
    xCoord = 1065;
    for(let i = 0; i < 2; i++) {
      for(let j = 0; j < 3; j++) {
        yCoord -= 33;
        if(this.basementComps[index].status == 0 ){
          ctx.lineWidth = 8;
          ctx.strokeStyle = this.colors[this.basementComps[index].status];

          ctx.beginPath();
          ctx.moveTo(yCoord,xCoord);
          ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
          ctx.moveTo(yCoord,(xCoord +this.square_size));
          ctx.lineTo((yCoord + this.square_size),xCoord);
          ctx.stroke();
          ctx.closePath();

          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';
        }
        else {
          ctx.beginPath();

          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';

          ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
          ctx.fillStyle = this.colors[this.basementComps[index].status];
          ctx.closePath();
          ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
        }

        index++;
      }

      yCoord -= 33;
      xCoord -= 33;

      for(let j = 0; j < 9; j++) {
        xCoord += 33;
        if(j == 4) {
          xCoord += 20;
          continue;
        }
        if(this.basementComps[index].status == 0 ){
          ctx.lineWidth = 8;
          ctx.strokeStyle = this.colors[this.basementComps[index].status];

          ctx.beginPath();
          ctx.moveTo(yCoord,xCoord);
          ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
          ctx.moveTo(yCoord,(xCoord +this.square_size));
          ctx.lineTo((yCoord + this.square_size),xCoord);
          ctx.stroke();
          ctx.closePath();

          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';
        }
        else {
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';
          ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
          ctx.fillStyle = this.colors[this.basementComps[index].status];
          ctx.closePath();
          ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
        }
        index++;
      }

      for(let j = 0; j < 3; j++) {
        yCoord += 33;
        if(this.basementComps[index].status == 0 ){
          ctx.lineWidth = 8;
          ctx.strokeStyle = this.colors[this.basementComps[index].status];

          ctx.beginPath();
          ctx.moveTo(yCoord,xCoord);
          ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
          ctx.moveTo(yCoord,(xCoord +this.square_size));
          ctx.lineTo((yCoord + this.square_size),xCoord);
          ctx.stroke();
          ctx.closePath();

          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';
        }
        else {
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';
          ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
          ctx.fillStyle = this.colors[this.basementComps[index].status];
          ctx.closePath();
          ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
        }
        index++;
      }
      yCoord += 182;
      xCoord = 1065;
    }
  }

  /*
    Draw computer rectangles that are 30x30, coordinates entered manually
  */
  firstLevelComputers() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");

    let index = 0;

    let yCoord = 980;
    let xCoord = 530;
    for(let i = 0; i < 5; i++) {
      yCoord -= 40;
      if(this.firstFloorComps[index].status == 0 ){
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.colors[this.firstFloorComps[index].status];

        ctx.beginPath();
        ctx.moveTo(yCoord,xCoord);
        ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
        ctx.moveTo(yCoord,(xCoord +this.square_size));
        ctx.lineTo((yCoord + this.square_size),xCoord);
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
      }
      else {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
        ctx.fillStyle = this.colors[this.firstFloorComps[index].status];
        ctx.closePath();
        ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
      }
      index++;
    }

    yCoord = 738;
    xCoord = 585;
    for(let i = 0; i < 7; i++) {
      yCoord -= 40;
      if(this.firstFloorComps[index].status == 0 ){
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.colors[this.firstFloorComps[index].status];

        ctx.beginPath();
        ctx.moveTo(yCoord,xCoord);
        ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
        ctx.moveTo(yCoord,(xCoord +this.square_size));
        ctx.lineTo((yCoord + this.square_size),xCoord);
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
      }
      else {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
        ctx.fillStyle = this.colors[this.firstFloorComps[index].status];
        ctx.closePath();
        ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
      }
      index++;
    }


    yCoord = 405;
    xCoord = 550;
    for(let i = 0; i < 2; i++) {
      for(let j = 0; j < 5; j++) {
        yCoord -= 37;
        if(this.firstFloorComps[index].status == 0 ){
          ctx.lineWidth = 8;
          ctx.strokeStyle = this.colors[this.firstFloorComps[index].status];

          ctx.beginPath();
          ctx.moveTo(yCoord,xCoord);
          ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
          ctx.moveTo(yCoord,(xCoord +this.square_size));
          ctx.lineTo((yCoord + this.square_size),xCoord);
          ctx.stroke();
          ctx.closePath();

          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';
        }
        else {
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';
          ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
          ctx.fillStyle = this.colors[this.firstFloorComps[index].status];
          ctx.closePath();
          ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
        }
        index++;
      }
      yCoord = 405;
      xCoord -= 37;
    }

    yCoord = 690;
    xCoord = 764;
    for(let i = 0; i < 1; i++) {
      for(let j = 0; j < 2; j++) {
        if(i == 0)
          xCoord += 37;
        else
          xCoord -= 37;
          if(this.firstFloorComps[index].status == 0 ){
            ctx.lineWidth = 8;
            ctx.strokeStyle = this.colors[this.firstFloorComps[index].status];

            ctx.beginPath();
            ctx.moveTo(yCoord,xCoord);
            ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
            ctx.moveTo(yCoord,(xCoord +this.square_size));
            ctx.lineTo((yCoord + this.square_size),xCoord);
            ctx.stroke();
            ctx.closePath();

            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
          }
          else {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
            ctx.fillStyle = this.colors[this.firstFloorComps[index].status];
            ctx.closePath();
            ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
          }
        index++;
      }
      xCoord += 37;
      yCoord -= 37;
    }


    yCoord = 620;
    xCoord = 800;
    for(let i = 0; i < 5; i++) {
      yCoord -= 37;
      if(i == 2) {

        continue;
      }

      ctx.fillStyle = 'orange';

      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.arc(yCoord + (this.square_size/2), xCoord + (this.square_size/2), this.square_size/2 , 0, Math.PI * 2, true);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();

    }

    yCoord = 366;
    xCoord = 767;
    for(let i = 0; i < 2; i++) {
      for(let j = 0; j < 2; j++) {
        if(i == 0)
          xCoord += 37;
        else
          xCoord -= 37;

          if(this.firstFloorComps[index].status == 0 ){
            ctx.lineWidth = 8;
            ctx.strokeStyle = this.colors[this.firstFloorComps[index].status];

            ctx.beginPath();
            ctx.moveTo(yCoord,xCoord);
            ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
            ctx.moveTo(yCoord,(xCoord +this.square_size));
            ctx.lineTo((yCoord + this.square_size),xCoord);
            ctx.stroke();
            ctx.closePath();

            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';

          }
          else {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
            ctx.fillStyle = this.colors[this.firstFloorComps[index].status];
            ctx.closePath();
            ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
          }
        index++;
      }
      xCoord += 37;
      yCoord -= 37;
    }


    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.arc(657 + (this.square_size/2), 800 + (this.square_size/2), this.square_size/2 , 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.arc(657 + (this.square_size/2), 837 + (this.square_size/2), this.square_size/2 , 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
    ctx.fill();


    yCoord = 330;
    xCoord = 1235;
    for(let i = 0; i < 4; i++) {
      if(i == 3)
        xCoord -= 15;
      for(let j = 0; j < 3; j++) {
        xCoord -= 37;
        if(this.firstFloorComps[index].status == 0 ){
         ctx.lineWidth = 8;
         ctx.strokeStyle = this.colors[this.firstFloorComps[index].status];

         ctx.beginPath();
         ctx.moveTo(yCoord,xCoord);
         ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
         ctx.moveTo(yCoord,(xCoord +this.square_size));
         ctx.lineTo((yCoord + this.square_size),xCoord);
         ctx.stroke();
         ctx.closePath();

         ctx.lineWidth = 1;
         ctx.strokeStyle = 'black';
       }
       else {
         ctx.beginPath();
         ctx.lineWidth = 1;
         ctx.strokeStyle = 'black';
         ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
         ctx.fillStyle = this.colors[this.firstFloorComps[index].status];
         ctx.closePath();
         ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
       }
       index++;
      }
      xCoord = 1235;
      yCoord -= 60;
    }

    xCoord = 1022;
    yCoord = 150;
    if(this.firstFloorComps[index].status == 0 ){
     ctx.lineWidth = 8;
     ctx.strokeStyle = this.colors[this.firstFloorComps[index].status];

     ctx.beginPath();
     ctx.moveTo(yCoord,xCoord);
     ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
     ctx.moveTo(yCoord,(xCoord +this.square_size));
     ctx.lineTo((yCoord + this.square_size),xCoord);
     ctx.stroke();
     ctx.closePath();

     ctx.lineWidth = 1;
     ctx.strokeStyle = 'black';
    }
    else {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
      ctx.fillStyle = this.colors[this.firstFloorComps[index].status];
      ctx.closePath();
      ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
    }
    index++;

    xCoord = 700;
    yCoord = 150;
    if(this.firstFloorComps[index].status == 0 ){
      ctx.lineWidth = 8;
      ctx.strokeStyle = this.colors[this.firstFloorComps[index].status];

      ctx.beginPath();
      ctx.moveTo(yCoord,xCoord);
      ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
      ctx.moveTo(yCoord,(xCoord +this.square_size));
      ctx.lineTo((yCoord + this.square_size),xCoord);
      ctx.stroke();
      ctx.closePath();

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
    }
    else {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
      ctx.fillStyle = this.colors[this.firstFloorComps[index].status];
      ctx.closePath();
      ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
    }
    index++;
  }

  /*
    Draw computer rectangles that are 30x30, coordinates entered manually
  */
  secondLevelComputers() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");

    //let index = 0;

    let xCoord = 450;
    let yCoord = 150;

    for(let i = 0; i < 8; i++) {
      if(this.secondFloorComps[i].status == 0 ){
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.colors[this.secondFloorComps[i].status];
        ctx.beginPath();

        ctx.moveTo(yCoord,xCoord);
        ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
        ctx.moveTo(yCoord,(xCoord +this.square_size));
        ctx.lineTo((yCoord + this.square_size),xCoord);
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';

      }
      else {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
        ctx.fillStyle = this.colors[this.secondFloorComps[i].status];
        ctx.closePath();
        ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
      }
      xCoord += 40;

      if(i % 2 != 0) {
        xCoord += 30;
      }
    }
  }

  /*
    Pop an alert to the user informing them that there are no computers.
  */
  showNoComputersAlert() {
    let alert = this.alertCtrl.create({
      title: 'No computers!',
      subTitle: 'There are no computers on the third floor.',
      buttons: ['OK']
    });
    alert.present();
  }

  /*
    Draw computer rectangles that are 30x30, coordinates entered manually
  */
  fourthLevelComputers() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");

    let xCoord = 1455;
    let yCoord = 780;
    for(let i = 0; i < 2; i++) {
      for(let j = 0; j < 2; j++) {
        if(this.fourthFloorComps[i].status == 0 ){
           ctx.lineWidth = 8;
           ctx.strokeStyle = this.colors[this.fourthFloorComps[i].status];

           ctx.beginPath();
           ctx.moveTo(yCoord,xCoord);
           ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
           ctx.moveTo(yCoord,(xCoord +this.square_size));
           ctx.lineTo((yCoord + this.square_size),xCoord);
           ctx.stroke();
           ctx.closePath();

           ctx.lineWidth = 1;
           ctx.strokeStyle = 'black';

         }
         else {
           ctx.beginPath();
           ctx.lineWidth = 1;
           ctx.strokeStyle = 'black';
           ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
           ctx.fillStyle = this.colors[this.fourthFloorComps[i].status];
           ctx.closePath();
           ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
         }
         xCoord -= 40;
      }
      xCoord = 1455;
      yCoord += 40;
    }

    xCoord = 1005;
    yCoord = 300;
    if(this.fourthFloorComps[4].status == 0 ){
       ctx.lineWidth = 8;
       ctx.strokeStyle = this.colors[this.fourthFloorComps[4].status];

       ctx.beginPath();
       ctx.moveTo(yCoord,xCoord);
       ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
       ctx.moveTo(yCoord,(xCoord +this.square_size));
       ctx.lineTo((yCoord + this.square_size),xCoord);
       ctx.stroke();
       ctx.closePath();

       ctx.lineWidth = 1;
       ctx.strokeStyle = 'black';

    }
    else {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
      ctx.fillStyle = this.colors[this.fourthFloorComps[4].status];
      ctx.closePath();
      ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
    }

    xCoord = 1005;
    yCoord = 340;

    if(this.fourthFloorComps[5].status == 0 ){
       ctx.lineWidth = 8;
       ctx.strokeStyle = this.colors[this.fourthFloorComps[5].status];

       ctx.beginPath();
       ctx.moveTo(yCoord,xCoord);
       ctx.lineTo((yCoord + this.square_size),(xCoord +this.square_size));
       ctx.moveTo(yCoord,(xCoord +this.square_size));
       ctx.lineTo((yCoord + this.square_size),xCoord);
       ctx.stroke();
       ctx.closePath();

       ctx.lineWidth = 1;
       ctx.strokeStyle = 'black';

    }
    else {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.strokeRect(yCoord, xCoord, this.square_size, this.square_size);
      ctx.fillStyle = this.colors[this.fourthFloorComps[5].status];
      ctx.closePath();
      ctx.fillRect(yCoord, xCoord, this.square_size, this.square_size);
    }
  }

}
