import { FormControl, FormGroup } from '@angular/forms';
import moment from 'moment';

//                  0 is Sunday ... 7 is Saturday
//                Sunday   Monday   Tuesday  Wednesday  Thursday   Friday  Saturday
let openHours = ["11:00", "07:30" , "07:30" , "07:30" , "07:30" , "07:30", "10:00"];
let closeHours = ["23:00", "00:00" , "00:00" , "00:00" , "00:00", "18:00", "19:00"];

export class TimeValidator{ // Validates the start and end time in the form

  static validateTimes(group: FormGroup){

     let start = group.get("reservationStartTime").value;
     let end = group.get("reservationEndTime").value;
     let day = group.get("reservationDate").value;

     var d = moment(day).day(); // Day of week - 0 is Sunday

     if(!isNaN(d)){

        // Start time & end times - just converted to be used to
        // find duration in hours and minutes
       var start2 = moment(start,'HH:mm');
       var end2 = moment(end,'HH:mm');

       var total = moment.duration(end2.diff(start2)); // Total time between start and end
       let hours = Number(total.asHours()); // Number of hours between start and end
       let minutes = Number(total.asMinutes()%60); // Number of minutes between start and end (minus the full hours)

       var s = moment(start,'HH:mm').format('HH:mm'); // Start time - just converted to be compared to array
       var e = moment(end,'HH:mm').format('HH:mm'); // End time - just converted to be compared to array


       if(start == undefined || end == undefined || isNaN(d) ){
         return {
           "not time": true // Start and end fields arent't fully filled in yet
         };
       }
       else if((s < openHours[d] && s != "00:00") || (s > closeHours[d] && closeHours[d] != "00:00")){
         return{
             "closed": true // Library is closed during start time
         };
       }
       else if((e < openHours[d] && e != "00:00") || (e > closeHours[d] && e == "00:00")){
         return{
             "closed": true // Library is closed during end time
         };
       }
       else if((s >= e && e != "00:00" && s != "00:00")|| s== "00:00" ){
         return{
             "end before start": true // The start time is after the end time
         };
       }
      else if((e == "00:00" && s < "21:00") || (e != "00:00" &&
              (hours > 3 || (hours == 3 && minutes != 0)))){
         return{
             "hit max time": true // Reservation is longer than 3 hours
         };
       }
       else {
         return null; // Start and End times are valid
       }
    }
  }
}
