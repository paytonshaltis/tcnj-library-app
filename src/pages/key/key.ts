import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-key',
  templateUrl: 'key.html'
})
export class KeyPage {

  /*
    Set color and size constants for drawing the rectangles.
  */

  occupied = "red";    // red
  unoccupied = "#00FF00";  // green
  reserved = "#ffbb00";
  printer = "#b97cf9";     // blue
  square_size = 100;
  mac = "#ffbb00";


  constructor(public navCtrl: NavController, public navParams: NavParams) {

  }

  /*
    When view loads, draw the squares.
  */
  ionViewDidLoad() {

    this.drawOccupiedSquare();
    this.drawUnoccupiedSquare();
    //this.drawReservedSquare();
    this.drawOccupiedCompSquare();
    this.drawUnoccupiedCompSquare();
    this.drawOccupiedMac();
    this.drawUnoccupiedMac();
    this.drawPrinterSquare();
  }

  /*
    Draws a red square into the first canvas element.
  */
  drawOccupiedSquare() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas1');
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = this.occupied;
    ctx.lineWidth = 10;

    ctx.beginPath();
    ctx.moveTo(4,4);
    ctx.lineTo(4,104);
    ctx.lineTo(104,104);
    ctx.lineTo(104,4);
    ctx.lineTo(0,4);
    ctx.moveTo(4,4)
    ctx.stroke();

    ctx.lineTo(104,104);
    ctx.moveTo(104,4);
    ctx.lineTo(4,104);
    ctx.stroke();
    ctx.closePath();

  //  ctx.fillRect(0, 0, this.square_size, this.square_size);
  }

  /*
    Draws a green square into the second canvas element.
  */
  drawUnoccupiedSquare() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas2');
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = this.unoccupied;
    ctx.lineWidth = 10;

    ctx.beginPath();
    ctx.moveTo(4,4);
    ctx.lineTo(4,104);
    ctx.lineTo(104,104);
    ctx.lineTo(104,4);
    ctx.lineTo(0,4);
    ctx.stroke();
    ctx.closePath();
  }

  /*drawReservedSquare(){
    let canvas = <HTMLCanvasElement>document.getElementById('canvas3');
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = this.reserved;
    ctx.lineWidth = 10;

    ctx.beginPath();
    ctx.moveTo(4,4);
    ctx.lineTo(4,104);
    ctx.lineTo(104,104);
    ctx.lineTo(104,4);
    ctx.lineTo(0,4);
    ctx.stroke();

    ctx.moveTo(79,4);
    ctx.lineTo(104,29);
    ctx.moveTo(104,54);
    ctx.lineTo(54,4)
    ctx.moveTo(29,4);
    ctx.lineTo(104,79)
    ctx.moveTo(104,104);
    ctx.lineTo(4,4)
    ctx.moveTo(4,29);
    ctx.lineTo(79,104);
    ctx.moveTo(54,104);
    ctx.lineTo(4,54)
    ctx.moveTo(4,79);
    ctx.lineTo(29,104)

    ctx.stroke();

    ctx.closePath();


  }*/
  drawOccupiedCompSquare() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas4');
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = this.occupied;

    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(4,4)
    ctx.lineTo(104,104);
    ctx.moveTo(104,4);
    ctx.lineTo(4,104);
    ctx.stroke();
    ctx.closePath();

  }

  drawUnoccupiedCompSquare() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas5');
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = this.unoccupied;
    ctx.fillRect(0, 0, this.square_size, this.square_size);
  }

  drawOccupiedMac() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas6');
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = this.occupied;
    ctx.beginPath();
    ctx.arc((this.square_size/2),(this.square_size/2), this.square_size/2 , 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
    ctx.fill();
  }

  drawUnoccupiedMac() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas8');
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = this.unoccupied;
    ctx.beginPath();
    ctx.arc((this.square_size/2),(this.square_size/2), this.square_size/2 , 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
    ctx.fill();
  }

  drawPrinterSquare() {
    let canvas = <HTMLCanvasElement>document.getElementById('canvas7');
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = this.printer;

    ctx.fillRect(0, 0, this.square_size, this.square_size);


    let print = new Image();
    print.src = 'assets/icon/printer_icon.png';
    print.onload = function() {
      ctx.drawImage(print, 5, 5,90,90);
    };

  }


}
