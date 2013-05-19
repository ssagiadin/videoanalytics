function closeIt() //It is fired when user tries to leave the page without using submit button 
{ 
  return "You have not pressed the Submit and Exit button. Please, press Cancel (Stay on this page) " + 
         "to press Submit and Exit button?";
}

window.onbeforeunload = closeIt;

// parametres for the countdown timer		
var milisec=0; 
var seconds; 
var duration;
var jump;

$(document).ready(function() {
	duration = parseInt($("#interaction").val());
	jump = parseInt($("#jump").val());
	seconds = duration * 60;
	$("#seekbar").hide();
  });
