// Initialize Firebase
var config = {
  apiKey: "AIzaSyCXsIPuG2JGhZgUKHGVGQhANmGKmLf6Do4",
  authDomain: "trainscheduler-8542f.firebaseapp.com",
  databaseURL: "https://trainscheduler-8542f.firebaseio.com",
  projectId: "trainscheduler-8542f",
  storageBucket: "",
  messagingSenderId: "399639131431"
};
firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();
var ref = firebase.database().ref();
// var firebase = require('firebase');
// var firebaseui = require('firebaseui');

// Capture Button Click
$("#addtrain").on("click", function(event) {
  event.preventDefault();

  // Capture User Inputs and store them into variables
  var train_name = $("#trainNameInput").val().trim();
  var destination = $("#destinationInput").val().trim();
  var first_train_time = $("#firstTrainTimeInput").val().trim();
  var frequency = $("#frequencyInput").val().trim();

  console.log(train_name);
  console.log(destination);
  console.log(first_train_time);
  console.log(frequency);

  ref.push({
    train_name: train_name,
    destination: destination,
    first_train_time: first_train_time,
    frequency: frequency
  });

  $("#trainNameInput").val("");
  $("#destinationInput").val("");
  $("#firstTrainTimeInput").val("");
  $("#frequencyInput").val("");

  renderSchedule();

});

$(document.body).on("click", ".cell-trash", function() {
  var row = $(this).parent();
  var rowKey = row.attr("data-key");

  var confirmDelete = confirm("Are you sure you want to delete this item?");

  if(confirmDelete){
    row.remove();
    ref.child(rowKey).remove();
  }
});

function renderSchedule() {
  $("#trainTableBody").empty();
  var count = 0;

  ref.on("child_added", function(childSnapshot) {
    count++;
    var key = childSnapshot.key;
    var firstTrainTime = moment(childSnapshot.val().first_train_time, "HH:mm");
    var frequencyMinute = parseInt(childSnapshot.val().frequency);
    var minutesPast = moment(firstTrainTime).diff(moment(), "minutes");
    var nextTrain;
    var minutesAway;

    console.log(childSnapshot.key);
    console.log("first time", firstTrainTime);
    console.log("minutesPast", minutesPast);

    if (minutesPast > 0) {
      nextTrain = moment(childSnapshot.val().first_train_time, "HH:mm").format("hh:mm A");
      minutesAway = Math.floor((moment(nextTrain, "hh:mm A").unix() - moment().unix()) / 60);
    } else {
      nextTrain = moment(childSnapshot.val().first_train_time, "HH:mm").add(Math.ceil(Math.abs(minutesPast/frequencyMinute)) * frequencyMinute, "minutes").format("hh:mm A");
      minutesAway = Math.abs(Math.floor((moment().unix() - moment(nextTrain, "hh:mm A").unix()) / 60));
    }

    console.log("nextTrain", nextTrain);
    console.log("minutesAway", minutesAway);

    var html = "";
    html += "<tr class='train-row' id=" + count + " data-key=" + key + "><td>" +
      childSnapshot.val().train_name +
      "</td><td>" +
      childSnapshot.val().destination +
      "</td><td>" +
      childSnapshot.val().frequency +
      "</td><td>" +
      nextTrain +
      "</td><td>" +
      minutesAway +
      "</td><td class='cell-trash'><span class='fa fa-trash-o' aria-hidden='true'></span></td></tr>";

    $("#trainTable").append(html);
    // Handle the errors
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

}

function clock() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);

  $("#showTime").text(h + ":" + m + ":" + s);

  if (s === "00") {
    $('#trainTableBody tr').each(function() {
      var min = $(this).find("td:last").prev().html();
      var minDecrement = min - 1;

      if(minDecrement > 0){
        $(this).find("td:last").prev().html(minDecrement);
      } else {
         $(this).find("td:last").prev().prev().html("--");
         $(this).find("td:last").prev().html("ARRIVED").addClass("arrived");
       }
       //setTimeout(renderSchedule, 60000);
    });
  }


  var t = setTimeout(clock, 1000);
}

function checkTime(i) {
  if (i < 10) {
    i = "0" + i
  }; // add zero in front of numbers < 10
  return i;
}



// $(function() {
//
//   function revert() {
//     $("#trainTableBody .editfield").each(function() {
//       var $td = $(this).closest('td');
//       $td.empty();
//       $td.text($td.data('oldText'));
//       $td.data('editing', false);
//
//       // canceled
//       console.log('Edit canceled.');
//     });
//   }
//
//   function save($input) {
//     var val = $input.val();
//     var $td = $input.closest('td');
//     $td.empty();
//     $td.text(val);
//     $td.data('editing', false);
//
//     // send json or whatever
//     console.log('Value changed');
//   }
//
//
//   $('#trainTableBody td').on('keyup', 'input.editfield', function(e) {
//     if (e.which == 13) {
//       // save
//       $input = $(e.target);
//       save($input);
//     } else if (e.which == 27) {
//       // revert
//       revert();
//     }
//   });
//
//   $("#trainTableBody td").click(function(e) {
//
//     // consuem event
//     e.preventDefault();
//     e.stopImmediatePropagation();
//
//     $td = $(this);
//
//     // if already editing, do nothing.
//     if ($td.data('editing')) return;
//     // mark as editing
//     $td.data('editing', true);
//
//     // get old text
//     var txt = $td.text();
//
//     // store old text
//     $td.data('oldText', txt);
//
//     // make input
//     var $input = $('<input type="text" class="editfield">');
//     $input.val(txt);
//
//     // clean td and add the input
//     $td.empty();
//     $td.append($input);
//   });
//
//
//   $(document).click(function(e) {
//     revert();
//   });
// });

// Call functions
renderSchedule();
clock();
