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
      console.log("minDecrement", minDecrement);

      if(minDecrement > 0){
        $(this).find("td:last").prev().html(minDecrement);
      }
      else {
         $(this).find("td:last").prev().prev().html("--");
         $(this).find("td:last").prev().html("ARRIVED").addClass("arrived");
         var r = setTimeout(renderSchedule, 30000);
      }
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

// Call functions
renderSchedule();
clock();
