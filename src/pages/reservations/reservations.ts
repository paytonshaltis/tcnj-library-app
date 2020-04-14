import { Component , InjectionToken,ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { URLSearchParams } from '@angular/http';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import xml2js from 'xml2js';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import { TimeValidator } from  '../../validators/time.validator';
import moment from 'moment';
import { FormControl } from '@angular/forms';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HttpHeaders,HttpParams} from '@angular/common/http';
import { HttpClient} from '@angular/common/http';

@IonicPage()
@Component({
  selector: 'page-reservations',
  templateUrl: 'reservations.html',
})
export class ReservationsPage {

  studyrooms: any;
  @ViewChild('ReservationSlider') signupSlider: any;

  slideOneForm: FormGroup; // First form
  slideTwoForm: FormGroup; // Second form

  studentCount = 0; // Number of students in reservation - used to validate second form (student contacts)

  submitAttempt: boolean = false; // Checks to see if entire form is valid
  nextAttempt: boolean = false; // Checks to see if first form is valid

  data:any = {};

  // Todays date
  today = moment(new Date().toISOString()).format("YYYY-MM-DD");

  // Finds the dates of the next 7 days
  sevenDays = new Date(Date.now() + 7*24*60*60*1000).toISOString();


  public items : Array<any> = [];


  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public navParams: NavParams, public http: Http,  public formBuilder: FormBuilder) {
    // First form - holds necessary information to run reservation search algorithm
    this.slideOneForm = this.formBuilder.group({
      reservationDate: ['', Validators.required], // Date of reservation
      reservationStartTime:['',Validators.compose([Validators.required])], // Start time
      reservationEndTime: ['',Validators.compose([Validators.required])], // End time
      numOfStudents: ['', Validators.compose([Validators.required, this.numOfStudent])] // Number of students in reservation
    }, {validator: TimeValidator.validateTimes});
                      // ^^ Custom validator that checks the start and end time (src/validators/time.validator.ts)

    this.slideTwoForm = this.formBuilder.group({
      students: this.formBuilder.array([ // Array of "students" (which is basically their contacts)
        this.initStudentFields() // Creates each student (with first and last name and email)
      ], Validators.compose([Validators.required, (control: FormControl) => this.validateSize(control, this.studentCount)]))
    });

    this.http = http;
  }

  ShowWifiAlert() {
    let alert = this.alertCtrl.create({
      title: 'TCNJ WiFi!',
      subTitle: 'You must be on the TCNJ WiFi to access reservation information.',
      buttons: ['OK']
    });
    alert.present();
  }

  getStudent(){
    // Gets the number of student's field value (user input) and saves it and returns it;
    // Used to limit and require the number of student, which is in the first form,
    // contacts the user to lists in the second form

    this.studentCount = this.slideOneForm.controls['numOfStudents'].value;
    return this.studentCount;
  }

  validateSize(control: FormControl, count: number ){

    // Validates the number of student contacts listed by the user and uses the
    // "Number of students" field on the first page (or parameter "count") in
    // order to require exactly that amount of student contacts (i.e. - if count
    // is 5, then 5 seperate student contacts must be submited); parameter control
    // is the array of "students"

    if(control.value == undefined || control.value == 0 ||
       count == undefined || count == 0 ){
      return {
        "didn't fill": true // Not all fields are filled in yet
      };
    }
    else if(control.value.length  == count){
      return null; // Everything is good
    }
    else if(control.value.length < count){
      return {
        'too little': true // Not enough contacts were listed
      };
    }
    else if(control.value.length  > count){
      return {
        'too many': true
        // Too many contacts were listed (cannot happen because HTML has a limit too)
        // but just in case
      };
    }
  }


  initStudentFields() : FormGroup {
    // Creates each student which is stored in an array
     return this.formBuilder.group({
        FirstName : ['', Validators.compose([Validators.required, Validators.maxLength(35)])],
        LastName : ['', Validators.compose([Validators.required, Validators.maxLength(35)])],
        Email : ['', Validators.compose([Validators.required,Validators.maxLength(70), Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')])]
     });
  }

  addNewInputField() : void {
   const control = <FormArray>this.slideTwoForm.controls.students;
   control.push(this.initStudentFields());
 }

  // Function used when user click "delete" on the second dynamic forms
  // for inputting student contact information
  removeInputField(i : number) : void {

    // Confirmation pop up of student deletion
    let alert = this.alertCtrl.create({
      title: 'CONFIRM',
      message: 'Are you sure you want to delete this student?',
      buttons: [
          {
              text: 'No',
              handler: () => {
                  console.log('Cancel clicked');
              }
          },
          {
              text: 'Yes',
              handler: () => {
                const control = <FormArray>this.slideTwoForm.controls.students;
                control.removeAt(i);
              }
          }
      ]
    })
    alert.present();

 }

 manage(val : any) : void{
   console.dir(val);
 }

  // Checks that the number of students field of the form is valid;
  // For example: the number of students field must be between 2 and 12
  numOfStudent(control: FormControl){

      if(control.value == undefined || control.value == 0){
        return {
          "didn't fill": true
        };
      }
      else if(isNaN(control.value)){
        return{
          "not a number": true
        }
      }
      else if(control.value % 1 !== 0){
        return {
           "not a whole number": true
        };
      }
      else if(control.value < 2){
         return {
             "too little": true
         };
      }
      else if(control.value == 0){
         return {
             "too little": true
         };
      }
      else if (control.value > 12){
           return {
               "too many": true
           };
       }
       else {
         return null;
       }

  }

  // Calls the PHP script that executes a C++ algorithm that returns a reservable study room or -1 if
  // no room is found to the PHP script which then is in this.data.response in the app.
  searchDB(reservation_date : number, start : number ,end : number ,num_of_students: number, today: string){


      let options2 	: any		= {date: reservation_date , start: start, end: end, student: num_of_students, today: today},
          url2      : any   = "http://knoxlablibrary.tcnj.edu/algo_wrap.php";

      this.http.post(url2, JSON.stringify(options2))
      .subscribe(data =>
      {
          this.data.response = data["_body"]; // The study room number of -1

          if (this.data.response != "-1"){ // A study room was found
            this.signupSlider.slideNext();

            this.nextAttempt = true;
          }
          else { // No study room found
            let a = this.alertCtrl.create({
              title: 'NOTICE',
              subTitle: 'There is no study room available at that time and date for your reservation group. Please choose a different time and date to find a suitable room.',
              buttons: ['OK']
            });
            a.present();
          }
      },
      (error : any) =>
      {
        alert(error);
      });
    }


  next(){ // Next button (goes forward to next form slide)

      if(this.slideOneForm.valid){

          // Data used/ sent to PHP script
          let reservation_date        : number = this.slideOneForm.controls["reservationDate"].value, // Reservation date
              start                   : number = this.slideOneForm.controls["reservationStartTime"].value, // Start time
              end                     : number = this.slideOneForm.controls["reservationEndTime"].value, // End time
              num_of_students         : number = this.slideOneForm.controls["numOfStudents"].value, // Number of students in reservation
              today_date              : string = moment(this.today, 'YYYY-MM-DD').format("YYYY-MM-DD"); // Today's date


          // Call function that sends data to PHP script that writes to database
          this.searchDB(reservation_date, start, end, num_of_students, today_date);

      }
      else if (!this.slideOneForm.valid){
        // Only lets user click to second form if the first form is valid
        let a = this.alertCtrl.create({
          title: 'NOTICE',
          subTitle: 'Please address the incorrect or empty fields before moving onto the next page!',
          buttons: ['OK']
        });
        a.present();
      }
  }

  prev(){ // Previous button (go back a form slide)
      this.signupSlider.slidePrev();
      this.nextAttempt = false;
  }

  // Writes to database in the server - send information collected from the form
  saveToDB(reservation_date : number, start : number ,end : number ,num_of_students: number, today: string, student_info: Array<string>, room: string){

    let headers 	: any		= new HttpHeaders({ 'Content-Type': 'application/json'}),
        options 	: any		= { "key" : "create", "date" : reservation_date ,"start" : start ,"end" : end ,"student" : num_of_students, "today": today, "student_info": student_info, "room": room},
        url       : any    = "http://knoxlablibrary.tcnj.edu/manage-reservations.php";

    this.http.post(url, JSON.stringify(options), headers)
    .subscribe((data : any) =>
    {
      // If the data was written to the form - alert pops up to tell user that
      // there reservation was successfully saved

      let start2 = moment(start,["HH:mm"]).format("hh:mm A");
      let end2 = moment(end,["HH:mm:ss"]).format("hh:mm A");

      let a = this.alertCtrl.create({
        title: 'SUCCESS',
        subTitle: 'Your reservation has been submitted and confirmed.',
        message: 'Below is the reservation details: <br><br><strong>Date:</strong> '+reservation_date+'  <br><strong>Start Time:</strong> '+start2+' <br><strong>End Time:</strong> '+end2+'<br><strong>Room Number:</strong> '+room+'<br><br>All reservation details will be emailed to reservation group!',
        buttons: ['OK']
      });
      a.present();

      // Sends user back to home page
      this.navCtrl.popToRoot();
    },
    (error : any) =>
    {
      let b = this.alertCtrl.create({
        title: 'ERROR',
        subTitle: 'There has been an error with your submission. Please try again later.',
        buttons: ['OK']
      });
      b.present();
      //alert(error);
    });

  }

  // Save() is called when the user clicks submit on the second part of the form
  // The 2 forms are validated and if the form is valid, the data is sent to saveToDB()
  // which will write the data to the database
  save(){
      this.submitAttempt = true;

      if(!this.slideOneForm.valid){ // Checks if the first form's fields are valid
        this.signupSlider.slideTo(0);
        let alert = this.alertCtrl.create({
          title: 'NOTICE',
          subTitle: 'Please address the incorrect or empty fields on this page before submission!',
          buttons: ['OK']
        });
        alert.present();
      }
      else if(!this.slideTwoForm.valid){ // Checks if the second form's fields are valid
          this.signupSlider.slideTo(1);
          let alert = this.alertCtrl.create({
            title: 'NOTICE',
            subTitle: 'Please address the incorrect or empty fields on this page before submission!',
            buttons: ['OK']
          });
          alert.present();
      }
      else { // If both forms are valid

          // Data used/ sent to PHP script
          let reservation_date        : number = this.slideOneForm.controls["reservationDate"].value, // Reservation date
              start                   : number = this.slideOneForm.controls["reservationStartTime"].value, // Start time
              end                     : number = this.slideOneForm.controls["reservationEndTime"].value, // End time
              num_of_students         : number = this.slideOneForm.controls["numOfStudents"].value, // Number of students in reservation
              today_date              : string = moment(this.today, 'YYYY-MM-DD').format("YYYY-MM-DD"), // Today's date
              students                : Array<string> = this.slideTwoForm.controls["students"].value, // Student array that holds email, name, etc.
              room                    : string = this.data.response;
          // Call function that sends data to PHP script that writes to database
          this.saveToDB(reservation_date, start, end, num_of_students, today_date, students, room);

      }
  }

}
