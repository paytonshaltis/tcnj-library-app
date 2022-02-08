import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { HTTP } from '@ionic-native/http';
import { ActionSheetController, NavParams, AlertController } from 'ionic-angular';
import { KeyPage } from '../key/key';
import 'rxjs/add/operator/map';
import xml2js from 'xml2js';

const URL = 'http://knoxlablibrary.tcnj.edu/compstatus.php';

@Component({
  selector: 'page-computers',
  templateUrl: 'computers.html'
})

export class ComputersPage {

  keyPage = KeyPage;

  // The parsed XML of computer data
  computers: any;     

  // Arrays to hold the computers for each floor
  basementComps = [];
  firstFloorComps = [];
  secondFloorComps = [];
  fourthFloorComps = [];

  // Other arrays for holding application data
  plans: Array<string> = [];
  plan_names: Array<string> = ["Lower Level", "First", "Second", "Third", "Fourth"];
  images = [];
  square_size = 25;
  colors = ["#FF0000", "#00FF00"]; 
  img_src = "";

  /* Obtain URI of each map / name of each map to array, create floor plan images */
  constructor(public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, public http: HTTP) {
    for(let i = 0; i < 5; i++) {
      let plan_uri = "assets/floor_plans/".concat(i.toString(), "_comp.png");
      this.plans.push(plan_uri);
      if(i > 0)
        this.plan_names[i] = this.plan_names[i] + " Level";
      this.images.push(this.createImage(this.plans[i], this.plan_names[i]));
    }
  }

  /* Before view becomes the active page, fetch XML from database */
  ionViewWillEnter() {
    console.log('Fetching new occupancy data...');
    this.loadXML();
  }

  /* After view becomes the active page, set up computer / status arrays */
  ionViewDidEnter() {
    this.setUpComps();
    
    // So long as arrays have contents now, we can present a menu
    if(this.computers !== undefined)
      this.openActionSheet();
  }

  /* Fetch data from the database and call the parse function */
  loadXML() {
    
    // New Ionic Native HTTP request code, Payton Shaltis
    this.http.get(URL, {}, {})
    .then(data => {
      console.log('Data Fetched:');
      console.log(data.status);
      console.log(data.data);
      console.log(data.headers);
      data = data.data;
      this.parseXML(data).then((data) => {
        this.computers = data;
        
        // Prints the parsed data for debugging purposes
        console.log("The parsed data:", JSON.stringify(this.computers));
      });
    })

    // Report any errors that may have come up
    .catch(error => {
      console.log('Error:');
      console.log(error.status);
      console.log(error.data);
      console.log(error.headers);
    });

    // Old Cordova HTTP resuest code, not working as of Fall 2021 
    /*
    this.http.get("http://knoxlablibrary.tcnj.edu/compstatus.php")
    .map(res => res.text())
    .subscribe(
    data => {
    this.parseXML(data).then((data) => {
    this.computers = data;
    console.log (this.computers);
        });
      });
    */

    }

  /* Parse the XML. Determine status of computers via service  */
  parseXML(data) {
    
    return new Promise(resolve => {
      
      // Prepare the parser to be used
      var k,
      arr = [],
      parser = new xml2js.Parser({
        trim: true,
        explicitArray: true
      });

      // Parse the XML string
      parser.parseString(data, function (err, result){
        var obj = result.computerlist;
        
        // Do the following for each computer:
        for(k in obj.comp){
          var item = obj.comp[k];

          // Push the name of the computer
          arr.push({
            name : item.name[0]
          });

          // Change 'status' based on 'service'
          // If out for service, mark as in-use
          if(item.service[0] == 1) {
            arr[arr.length - 1].status = 0;
          }
          
          // If NOT out for service, mark as its status
          else {  
            arr[arr.length - 1].status = item.status[0];
          }

        }
        resolve(arr);
      });
    });
  }

  /* Open a new menu that allows the user to select a floor */
  openActionSheet(){
    
    // Create the action sheet
    let actionsheet = this.actionSheetCtrl.create({
      title:"Select Floor",
      buttons:[
        {text: this.plan_names[0], handler: () => {this.showFloor(0);}}, 
        {text: this.plan_names[1], handler: () => {this.showFloor(1);}},
        {text: this.plan_names[2], handler: () => {this.showFloor(2);}},
        {text: this.plan_names[3], handler: () => {this.showFloor(3);}},
        {text: this.plan_names[4], handler: () => {this.showFloor(4);}}, 
        {text: 'Cancel', role: 'cancel',}
      ]
    });

    // Present the action sheet to the screen
    actionsheet.present();
  }

  /* Returns converted canvas image */
  getSrc(){
    return this.img_src;
  }

  /* Display the floor plan specified by the input and draw computers */
  showFloor(floor_number: number) {
    
    // Set title of page
    document.getElementById("floor_name").innerHTML = this.plan_names[floor_number];

    // Create and adjust the height and width of the canvas element
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let img = this.images[floor_number];
    canvas.height = img.height;
    canvas.width = img.width;

    // Create a context from the canvas
    let ctx = canvas.getContext("2d");
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

    // Make the canvas disappear
    canvas.height = 0;
    canvas.width = 0;
  }

  /* Set the values of an HTML img element to be used for drawing */
  createImage(src: string, title: string) {
    let img = new Image();
    img.src = src;
    img.alt = title;
    img.title = title;
    return img;
  }

  /* Organizes all computers into floor-based arrays */
  setUpComps() {
    
    // If the computers were not properly fetched from the database...
    if(this.computers === undefined) {
      
      // Hide these elements on the display
      document.getElementById('floor_name').style.visibility = "hidden";
      document.getElementById('floor_button').style.visibility = "hidden";
      document.getElementById('info_icon').style.visibility = "hidden";
      
      // Inform the user that they must be on the TCNJ WiFi
      this.showWifiAlert();
    }

    // If the computers were properly fetched from the database...
    else {
      
      for(let i = 0; i < this.computers.length; i++) {
        
        // Append each computer to its appropriate array
        // Note that all Macs are on the first floor as of Spring 2022
        if(this.computers[i].name.includes("LIBP1") || this.computers[i].name.includes("MAC")){
          this.firstFloorComps.push(this.computers[i]);
        }
        else if(this.computers[i].name.includes("LIBP4")){
          this.fourthFloorComps.push(this.computers[i]);
        }
        else if(this.computers[i].name.includes("LIBP2")){
          this.secondFloorComps.push(this.computers[i]);
        }
        else if(this.computers[i].name.includes("LIB2") || this.computers[i].name.includes("LIB5")) {
          this.basementComps.push(this.computers[i]);
        }

        // All other entries in the database are ignored! This allows for test
        // computers to be added as needed

      }

    }

  }

  /* Alert the user that they are not on the TCNJ WiFi */
  showWifiAlert() {
    let alert = this.alertCtrl.create({
      title: 'TCNJ WiFi!',
      subTitle: 'You must be on the TCNJ WiFi to view computer availability.',
      buttons: ['OK']
    });
    alert.present();
  }

  /* Draw the computers on the lower level */
  lowerLevelComputers() {
    
    // Prepare the drawing canvas
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");

    // Coordinates for all 56 computers on the lower level
    // COMP #: (Lib2-LibXX)    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19   20   21   22   23   24   25   26   27   28
    let XCoord =            [863, 830, 797, 764, 731, 698, 698, 731, 764, 797, 830, 863, 863, 830, 797, 764, 731, 698, 698, 731, 764, 797, 830, 863, 896, 863, 830, 797];
    let YCoord =            [930, 930, 930, 930, 930, 930, 897, 897, 897, 897, 897, 897, 831, 831, 831, 831, 831, 831, 798, 798, 798, 798, 798, 798, 745, 745, 745, 745];
    
    // COMP #: (LIB5-LIBXX)    11    10     9     8     7     6     5     4     3     2     1    28    27    26    18    17    16    15    14    13    12    25    24    23    22    21    20    19 
    XCoord.push             (1065, 1065, 1065, 1065, 1098, 1131, 1164, 1217, 1250, 1283, 1316, 1316, 1316, 1316, 1065, 1065, 1065, 1065, 1098, 1131, 1164, 1217, 1250, 1283, 1316, 1316, 1316, 1316);
    YCoord.push             (1274, 1241, 1208, 1175, 1175, 1175, 1175, 1175, 1175, 1175, 1175, 1208, 1241, 1274, 1423, 1390, 1357, 1324, 1324, 1324, 1324, 1324, 1324, 1324, 1324, 1357, 1390, 1423);
    
    // Draw each of the 56 computers from the arrays above
    for(let i = 0; i < 56; i++) {
      
      // If the computer is occupied:
      if(this.basementComps[i].status == 0 ){
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.colors[this.basementComps[i].status];

        ctx.beginPath();
        ctx.moveTo(YCoord[i], XCoord[i]);
        ctx.lineTo((YCoord[i] + this.square_size) ,(XCoord[i] + this.square_size));
        ctx.moveTo(YCoord[i], (XCoord[i] + this.square_size));
        ctx.lineTo((YCoord[i] + this.square_size), XCoord[i]);
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
      }

      // If the computer is available:
      else {
        ctx.beginPath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(YCoord[i], XCoord[i], this.square_size, this.square_size);
        ctx.fillStyle = this.colors[this.basementComps[i].status];
        ctx.closePath();
        ctx.fillRect(YCoord[i], XCoord[i], this.square_size, this.square_size);

      }

    }

  }

  /* Draw the computers on the first level */
  firstLevelComputers() {
    
    // Prepare the drawing canvas
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");

    // Coordinates for all 39 PCs on the first floor
    // COMP #:      1    2    3    4    5   62   63   64   65   66   67   68  018  019  020  021  022  013  014  015  016  017  025  026  027  028  034  035   037   043   044   038   039   040   048   047   046   036   031
    let xCoord = [530, 530, 530, 530, 530, 585, 585, 585, 585, 585, 585, 585, 550, 550, 550, 550, 550, 513, 513, 513, 513, 513, 817, 780, 817, 780, 821, 821, 1161, 1161, 1198, 1198, 1198, 1161, 1235, 1198, 1161, 1022, 700];
    let yCoord = [940, 900, 860, 820, 780, 698, 658, 618, 578, 538, 498, 458, 368, 331, 294, 257, 220, 368, 331, 294, 257, 220, 546, 546, 509, 509, 366, 329,  483,  261,  224,  446,  335,  372,  150,  150,  150,  150, 150];
    
    // Draw each of the 42 PCs from the arrays above
    for(let i = 0; i < 39; i++) {
    
      // If the computer is occupied:
      if(this.firstFloorComps[i].status == 0 ){
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.colors[this.firstFloorComps[i].status];

        ctx.beginPath();
        ctx.moveTo(yCoord[i],xCoord[i]);
        ctx.lineTo((yCoord[i] + this.square_size),(xCoord[i] + this.square_size));
        ctx.moveTo(yCoord[i],(xCoord[i] + this.square_size));
        ctx.lineTo((yCoord[i] + this.square_size),xCoord[i]);
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
      }
      
      // If the computer is available:
      else {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(yCoord[i], xCoord[i], this.square_size, this.square_size);
        ctx.fillStyle = this.colors[this.firstFloorComps[i].status];
        ctx.closePath();
        ctx.fillRect(yCoord[i], xCoord[i], this.square_size, this.square_size);
      }
      
    }

    // Coordinates for all 6 Macs on the first floor
    // COMP #:         3    4    6    5    1    2
    let xCoordMac = [780, 817, 784, 784, 780, 817];
    let yCoordMac = [690, 690, 366, 329, 657, 657];

    // Draw each of the 6 Macs from the arrays above
    for(let i = 0; i < 6; i++) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.arc(yCoordMac[i] + (this.square_size/2), xCoordMac[i] + (this.square_size/2), this.square_size/2 , 0, Math.PI * 2, true);
      ctx.stroke();
      ctx.closePath();
      ctx.fill();
    }

  }

  /* Draw the computers on the second level */
  secondLevelComputers() {
    
    // Prepare the drawing canvas
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");

    // Coordinates for all 8 PCs on the second floor
    // COMP #:     01   02  003  004  005  006  007   08
    let xCoord = [487, 524, 561, 598, 635, 672, 709, 746];
    let yCoord = [187, 150, 187, 150, 187, 150, 187, 150];
    for(let i = 0; i < 8; i++) {
      
      // If the computer is occupied:
      if(this.secondFloorComps[i].status == 0 ){
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.colors[this.secondFloorComps[i].status];
        ctx.beginPath();

        ctx.moveTo(yCoord[i], xCoord[i]);
        ctx.lineTo((yCoord[i] + this.square_size), (xCoord[i] + this.square_size));
        ctx.moveTo(yCoord[i],(xCoord[i] + this.square_size));
        ctx.lineTo((yCoord[i] + this.square_size), xCoord[i]);
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';

      }

      // If the computer is available:
      else {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(yCoord[i], xCoord[i], this.square_size, this.square_size);

        ctx.fillStyle = this.colors[this.secondFloorComps[i].status];
        ctx.closePath();
        ctx.fillRect(yCoord[i], xCoord[i], this.square_size, this.square_size);
      }

    }

  }

  /* No computers to draw on the thrid level */
  showNoComputersAlert() {
    let alert = this.alertCtrl.create({
      title: 'No Computers!',
      subTitle: 'There are no computers on the third floor. Visit another floor for computer occupancy.',
      buttons: ['OK']
    });
    alert.present();
  }

  /* Draw the computers on the fourth level */
  fourthLevelComputers() {

    // Prepare the drawing canvas
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");

    // Coordinates for all 7 PCs on the fourth floor
    // COMP #:      10     4     6     5     2     1     9
    let xCoord = [1455, 1415, 1455, 1415, 1005, 1005, 1455];
    let yCoord = [780,   780,  820,  820,  300,  340,  500];
    
    // Draw each of the 7 PCs from the arrays above
    for(let i = 0; i < 7; i++) {
      
      // If the computer is occupied:
      if(this.fourthFloorComps[i].status == 0 ){
          ctx.lineWidth = 8;
          ctx.strokeStyle = this.colors[this.fourthFloorComps[i].status];

          ctx.beginPath();
          ctx.moveTo(yCoord[i] ,xCoord[i]);
          ctx.lineTo((yCoord[i] + this.square_size), (xCoord[i] + this.square_size));
          ctx.moveTo(yCoord[i], (xCoord[i] + this.square_size));
          ctx.lineTo((yCoord[i] + this.square_size), xCoord[i]);
          ctx.stroke();
          ctx.closePath();

          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';

      }

      // If the computer is available:
      else {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(yCoord[i], xCoord[i], this.square_size, this.square_size);
        ctx.fillStyle = this.colors[this.fourthFloorComps[i].status];
        ctx.closePath();
        ctx.fillRect(yCoord[i], xCoord[i], this.square_size, this.square_size);
      }

    }

  }

}