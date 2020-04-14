import { Component } from '@angular/core';
import { ActionSheetController, NavParams } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { File } from '@ionic-native/file';
import { Platform } from 'ionic-angular';

@Component({
  selector: 'page-maps',
  templateUrl: 'maps.html'
})
export class MapsPage {

  plans: Array<string> = [];
  plan_names: Array<string> = ["Lower Level", "First", "Second", "Third", "Fourth"];
  images = [];
  img_src = "";

  /*
    Obtain URI of each map and add to array.
    Add name of each map to second array.
  */
  constructor(public actionSheetCtrl: ActionSheetController, public navParams: NavParams, private photoViewer: PhotoViewer, private file: File, public platform: Platform) {
    for(let i = 0; i < 5; i++) {
      let plan_uri = "assets/floor_plans/".concat(i.toString(), "_words.png");
      this.plans.push(plan_uri);
      if(i > 0)
        this.plan_names[i] = this.plan_names[i] + " Level";
      this.images.push(this.createImage(this.plans[i], this.plan_names[i]));
    }

    this.photoViewer = photoViewer;

  }


  /*
    When view loads, open the menu of floor options.
  */
  ionViewDidLoad() {
    this.openActionSheet();
  }

  /*
    Opens a menu with all of the floor options available. All of the buttons
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

  // Returns converted canvas image
  getSrc(){
    return this.img_src;
  }

  /*
    Sets the values within the HTML elements on the page, placing the name of the
    floor, the floor plan image, and finally, the alt text of the image.
  */

  /*
  showFloor(floor_number: number) {
    // Set title of page
    document.getElementById("floor_name").innerHTML = this.plan_names[floor_number];

    // Create then adjusts the height and width of the canvas elements
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let img = this.images[floor_number];
    canvas.height = img.height;
    canvas.width = img.width;

    // Draws image onto canvas
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img,0,0);

  } */

  showImg(){

    //alert("hello");
    //this.photoViewer.show('https://www.gannett-cdn.com/-mm-/421fa88894207f6fd125837bfbea3a215d8338a7/c=972-205-2409-1017/local/-/media/2016/10/18/USATODAY/USATODAY/636124053572235005-101816orange-cat-thinkstock.jpg?width=3200&height=1680&fit=crop');

/*
    var options = {
      share: true, // default is false
      closeButton: false, // iOS only: default is true
      copyToReference: true // iOS only: default is false
    };

  if (this.platform.is('cordova') && this.platform.is('android')) {
      this.file.readAsDataURL(this.file.applicationDirectory + "www/assets/floor_plans/", this.img_src)
      .then((dataURL:string) => {
        this.photoViewer.show(dataURL, "", {share: false})
      })
      .catch(
        (err)=>{alert("err: "+err)
      });
    } else if (this.platform.is('cordova') && this.platform.is('ios')) {
      this.photoViewer.show(this.file.applicationDirectory + "www/assets/floor_plans/"+ this.img_src,"",options);
    }  */

  }

  showFloor(floor_number: number) {
    // Set title of page
    document.getElementById("floor_name").innerHTML = this.plan_names[floor_number];

    // Create then adjusts the height and width of the canvas elements
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let img = this.images[floor_number];
    canvas.height = img.height;
    canvas.width = img.width;

    // Draws image onto canvas
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img,0,0);


    // Save canvas converted image
    this.img_src = canvas.toDataURL();

    // Make the canvas disappear :o
    canvas.height = 0;
    canvas.width = 0;


    // Create a context from the canvas, which it moves and rotates before drawing the floor plan onto it
    //ctx.translate(canvas.width,0);
    //ctx.rotate(90*Math.PI/270);
  }
}
