import { Component } from '@angular/core';
import { ActionSheetController, NavParams, AlertController } from 'ionic-angular';
import { KeyPage } from '../key/key';

@Component({
  selector: 'page-printers',
  templateUrl: 'printers.html'
})

export class PrintersPage {

  keyPage = KeyPage;

  plans: Array<string> = [];
  plan_names: Array<string> = ["Lower Level", "First", "Second", "Third", "Fourth"];
  images = [];
  square_size = 45;
  printer_color = "#b97cf9";
  img_src = "";

  /*
    Obtain URI of each map and add to array. Add name of each map to second array.
    Create the images of the floor plans.
  */
  constructor(public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController) {
    for(let i = 0; i < 5; i++) {
      let plan_uri = "assets/floor_plans/".concat(i.toString(), "_words.png");
      this.plans.push(plan_uri);
      if(i > 0)
        this.plan_names[i] = this.plan_names[i] + " Level";
      this.images.push(this.createImage(this.plans[i], this.plan_names[i]));
    }


    let icon = new Image();
    icon.src = 'assets/icon/printer_icon.png';
    this.images.push(icon);
  }

  /*
    When view loads, open the menu of floor options.
  */
  ionViewDidLoad() {
    this.openActionSheet();
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
  to draw printers onto the floor plan, based on the floor number.
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
        this.lowerLevelPrinters();
        break;
      case 1:
        this.firstLevelPrinters();
        break;
      case 2:
        this.secondLevelPrinters();
        break;
      case 3:
        this.showAlert();
        break;
      case 4:
        this.fourthLevelPrinters();
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
    Draw printer rectangles that are 40x40, coordinates entered manually
  */
  lowerLevelPrinters() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");
  //  ctx.strokeStyle = this.printer_color;
    ctx.fillStyle = this.printer_color;

  //  ctx.lineWidth = 8;

  //  let x = 800;
  //  let y = 600;

    ctx.fillRect(795, 595, this.images[5].height + 10, this.images[5].width + 10);
    ctx.drawImage(this.images[5], 800, 600);

    ctx.fillRect(1395, 1225, this.images[5].height + 10, this.images[5].width + 10);
    ctx.drawImage(this.images[5], 1400, 1230);

    /*ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x,y + 45);
    ctx.lineTo(x + 45,y + 45);
    ctx.lineTo(x + 45, y);
    ctx.lineTo(x - 4,y);
    ctx.moveTo(x,y)
    ctx.stroke();

    ctx.lineTo(x + 45, y + 45);
    ctx.moveTo(x + 45, y);
    ctx.lineTo(x,y + 45);
    ctx.stroke();
    ctx.closePath();*/

/*  x = 1400;
    y = 1230;

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x,y + 45);
    ctx.lineTo(x + 45,y+ 45);
    ctx.lineTo(x + 45, y);
    ctx.lineTo(x - 4,y);
    ctx.moveTo(x,y)
    ctx.stroke();

    ctx.lineTo(x + 45, y + 45);
    ctx.moveTo(x + 45,y);
    ctx.lineTo(x,y+ 45);
    ctx.stroke();
    ctx.closePath();*/

    //ctx.fillRect(800, 600, this.square_size + 4, this.square_size);
    //ctx.fillRect(1405, 1230, this.square_size , this.square_size + 4);
  }

  /*
    Draw printer rectangles that are 40x40, coordinates entered manually
  */
  firstLevelPrinters() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = this.printer_color;

    ctx.fillRect(145, 580, this.images[5].height + 10, this.images[5].width + 10);
    ctx.drawImage(this.images[5], 150, 585);

    ctx.fillRect(145, 490, this.images[5].height + 10, this.images[5].width + 10);
    ctx.drawImage(this.images[5], 150, 495);

    ctx.fillRect(145, 1055, this.images[5].height + 10, this.images[5].width + 10);
    ctx.drawImage(this.images[5], 150, 1060);

    ctx.fillRect(845, 1075, this.images[5].height + 10, this.images[5].width + 10);
    ctx.drawImage(this.images[5], 850, 1080);

    ctx.fillRect(705, 1265, this.images[5].height + 10, this.images[5].width + 10);
    ctx.drawImage(this.images[5], 710, 1270);

    //ctx.strokeStyle = this.printer_color;

    //ctx.lineWidth = 8;
    /*let x = 150;
    let y = 585;

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x,y + 45);
    ctx.lineTo(x + 45,y+ 45);
    ctx.lineTo(x + 45, y);
    ctx.lineTo(x - 4,y);
    ctx.moveTo(x,y)
    ctx.stroke();

    ctx.closePath();

    x = 150;
    y = 495;

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x,y + 45);
    ctx.lineTo(x + 45,y+ 45);
    ctx.lineTo(x + 45, y);
    ctx.lineTo(x - 4,y);
    ctx.moveTo(x,y)
    ctx.stroke();

    ctx.closePath();

    x = 150;
    y = 1060;

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x,y + 45);
    ctx.lineTo(x + 45,y+ 45);
    ctx.lineTo(x + 45, y);
    ctx.lineTo(x - 4,y);
    ctx.moveTo(x,y)
    ctx.stroke();

    ctx.closePath();

    x = 850;
    y = 1080;

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x,y + 45);
    ctx.lineTo(x + 45,y+ 45);
    ctx.lineTo(x + 45, y);
    ctx.lineTo(x - 4,y);
    ctx.moveTo(x,y)
    ctx.stroke();

    ctx.closePath();

    x = 710;
    y = 1275;

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x,y + 45);
    ctx.lineTo(x + 45,y+ 45);
    ctx.lineTo(x + 45, y);
    ctx.lineTo(x - 4,y);
    ctx.moveTo(x,y)
    ctx.stroke();

    ctx.closePath();*/

  //  ctx.fillRect(160, 570, this.square_size, this.square_size);
  //  ctx.fillRect(160, 480, this.square_size, this.square_size);
  //  ctx.fillRect(160, 1060, this.square_size, this.square_size);
  //  ctx.fillRect(860, 1105, this.square_size, this.square_size);
  //  ctx.fillRect(710, 1290, this.square_size, this.square_size);
  }

  /*
    Draw printer rectangles that are 40x40, coordinates entered manually
  */
  secondLevelPrinters() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");
    //ctx.strokeStyle = this.printer_color;
    ctx.fillStyle = this.printer_color;

    ctx.fillRect(465, 805, this.images[5].height + 10, this.images[5].width + 10);
    ctx.drawImage(this.images[5], 470, 810);

/*
    ctx.lineWidth = 8;
    let x = 470;
    let y = 810;

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x,y + 45);
    ctx.lineTo(x + 45,y+ 45);
    ctx.lineTo(x + 45, y);
    ctx.lineTo(x - 4,y);
    ctx.moveTo(x,y)
    ctx.stroke();

    ctx.lineTo(x + 45, y + 45);
    ctx.moveTo(x + 45,y);
    ctx.lineTo(x,y+ 45);
    ctx.stroke();
    ctx.closePath();*/
    //ctx.fillRect(420, 790, this.square_size, this.square_size);
  }

  /*
    Pop an alert to the user informing them that there are no printers.
  */
  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'No printers!',
      subTitle: 'There are no printers on the third floor.',
      buttons: ['OK']
    });
    alert.present();
  }

  /*
    Draw printer rectangles that are 40x40, coordinates entered manually
  */
  fourthLevelPrinters() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = this.printer_color;
    //ctx.strokeStyle = this.printer_color;

    //ctx.lineWidth = 8;
    //let x = 420;
    //let y = 1390;

    ctx.fillRect(415, 1385, this.images[5].height + 10, this.images[5].width + 10);
    ctx.drawImage(this.images[5], 420, 1390);

    /*
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x,y + 45);
    ctx.lineTo(x + 45,y+ 45);
    ctx.lineTo(x + 45, y);
    ctx.lineTo(x - 4,y);
    ctx.moveTo(x,y)
    ctx.stroke();

    ctx.lineTo(x + 45, y + 45);
    ctx.moveTo(x + 45,y);
    ctx.lineTo(x,y+ 45);
    ctx.stroke();
    ctx.closePath();*/

    //ctx.fillRect(420, 1390, this.square_size, this.square_size);
  }

}
