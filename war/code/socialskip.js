//How the interactions are saved into the base
//Gobackward->gb:
//GoForward->gf:
//play->p:
//pause->a:

//Once the player is ready, it wil call onYouTubePlayerReady
function onYouTubePlayerReady() 
{
	ytplayer = document.getElementById("myytplayer");

// Once the player SWF is loaded, cueVideoByUrl function loads a particular YouTube video,
// the unique element for the current video is Z09ythJT9Wk
//	ytplayer.cueVideoByUrl("http://www.youtube.com/v/Z09ythJT9Wk",0);
	ytplayer.cueVideoByUrl($("#videourl").val(), 0);
	ytplayer.playVideo(); // Starts the video

	setInterval(updatePlayerInfo, 250); //Every 250ms searches for updates on player's information
	updatePlayerInfo(); 

//The Events section below identifies the different events that the player might fire. 
//The listener is a string that specifies the function that will execute when the specified event fires.
	ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
	ytplayer.addEventListener("onError", "onPlayerError"); 
}

//This function counts down 5 minutes,which is the time restriction for user navigation
function closeW() 
{ 
	$(".pbutton").hide("slow"); // Hide the players buttons
	ytplayer.stopVideo(); // This command stops video's playing state
	alert("5 minutes have passed"); // This is the alert message for the user
	window.close();   	
}

function FirstwooYay ( )
{
//This function fires if the user presses the link to enable the buttons
	setTimeout("ytplayer.pauseVideo();",100); //This goes to 100ms of video and pauses it

	ytplayer.seekTo(0, true); // Go to the beginning of the video
	
	$(".pbutton").show(1500); // The buttons are visible now with a little effect
	$("#counter").show("slow"); // The counter also

	display(); // This function appears the timer with the countdown
// This makes visible the form with the instruction for the user
	$("#ifrS").show();
	$("#start").hide("slow"); // The previous link is not available anymore
	$("#instructions").hide(); // Hide the instructions 
// The alert message, which informs about the end of the available time, will pop up
	window.setTimeout("closeW()", duration * 60 * 1000);
}

function display() // function for the countdown timer
{ 
	if (milisec <= 0) { 
		milisec = 9; 
		seconds -= 1; 
	} 
	if (seconds<=-1) { 
		milisec = 0; 
		seconds += 1; 
	} 
	else 
		milisec -= 1; 
	$("#counter").val("Remain Time:" + seconds + "." + milisec); 
	setTimeout("display()", 100);
}
	
function playpause() //Function for the Play/Pause button 
{ 
	if ($("#playbutton").hasClass("pause")) { //an brisketai se katastash Pause
		ytplayer.unMute(); // Video has volume
		ytplayer.playVideo(); // Video starts
		var time= ytplayer.getCurrentTime(); // Collects the current second for the database
		var today = new Date(); // Get the current time
		//Matches the time with the button that has been used and save them on text1
		$("#text1").val($("#text1").val() + " 3 " + Math.round(time) + " " + today.getTime());
		$("#playbutton").attr("src", "/images/pause-button-40.png");
	}
	else {
		ytplayer.pauseVideo(); // Pause video
		var time= ytplayer.getCurrentTime(); // Collects the current second for the database
		var today = new Date(); // Get the current time
		// Matches the time with the button that has been used
		$("#text1").val($("#text1").val() + " 4 " + Math.round(time) + " " + today.getTime()); 
		$("#playbutton").attr("src", "/images/play-button-40.png");
	}
	$("#playbutton").toggleClass("pause"); // Allagh katastasis apo Play->Pause h Pause->Play
}		
         
function gobackward() //Function for the  goBackward button 
{ 
	ytplayer.unMute();

	var time= ytplayer.getCurrentTime(); // Collects the current second for the database
	var today = new Date(); // Get the current time
//If the current time of the video's playing state is bigger than 30 seconds then goes back 30 sec
	if (time > jump) {   
		ytplayer.seekTo(time-jump, true);
	}
	else { //Otherwise go at the beginning of the video and start the video's playing state 
		ytplayer.seekTo(0,true);
		ytplayer.playVideo();
	}
	// Matches the time with the button that has been used and save them on text1
	$("#text1").val($("#text1").val() + " 1 " + Math.round(time) + " " + today.getTime());
}

function goforward() //Function for the Goforward button 
{ 
	ytplayer.unMute();

	var time= ytplayer.getCurrentTime(); // Collects the current second for the database
	var duration = ytplayer.getDuration(); // Gets video's duration
	var today = new Date(); // Get the current time
	time += jump; //Raises by 30 time variable	
	if( time <= duration ) { //Checks is the time variable is smaller than duration  
		ytplayer.seekTo(time, true); //If it does not overtake the duration, the playing second changes
	}
	else { 
		ytplayer.seekTo(duration,true); // Goes at the end of video
		ytplayer.playVideo();
	}
	time = time - jump; // This is the correct time that this button has been used
	// Matches the time with the button that has been used and save them on text1
	$("#text1").val($("#text1").val() + " 2 " + Math.round(time) + " " + today.getTime());
}   		

/*
* Polling the player for information
*/

function toTime(secs) //This function converts video time from milliseconds to seconds 
{ 
	var t = new Date(0,0,0);
	t.setSeconds(secs);

	return t.toTimeString().substr(3,5);
}

function updateHTML(elmId, value) // Update a particular HTML element with a new value
{ 
	document.getElementById(elmId).innerHTML = toTime(value);
}

function onPlayerError(errorCode) // This function is called when an error is thrown by the player
{
	alert("An error occured of type:" + errorCode);
}

function onPlayerStateChange(newState) // This function is called when the player changes state
{
  updateHTML("playerState", newState);
}

// Display information about the current state of the player
function updatePlayerInfo() {
// Also check that at least one function exists since when IE unloads the
// page, it will destroy the SWF before clearing the interval.
	if(ytplayer && ytplayer.getDuration) {
		var total = ytplayer.getDuration();
		var ctime = ytplayer.getCurrentTime();
		
		updateHTML("videoDuration", total);
		updateHTML("videoCurrentTime", ctime);
		drawSeekBar(ctime / total * seekbar_res);
//		updateHTML("bytesTotal", ytplayer.getVideoBytesTotal());
//		updateHTML("startBytes", ytplayer.getVideoStartBytes());
//		updateHTML("bytesLoaded", ytplayer.getVideoBytesLoaded());
	}
}

function temp() //This Function is fired when user presses submit
{ 
	window.onbeforeunload=null;
}

/* Seekbar code by Petros Gasteratos */

var seekbar_res = 200;

function drawSeekBar(value) {
	var seekbar = document.getElementById("seekbar");
	var seekpos = document.getElementById("seekpos");

	if (seekbar != null && seekpos != null) {
		barWidth = seekbar.offsetWidth;        
		seekpos.style.width = value / seekbar_res * barWidth;
	}
}

function updateSeekBar(e) {
	var seekbar = document.getElementById("seekbar");
	var seekpos = document.getElementById("seekpos");      
	var today = new Date(); // Get the current time
	
	if (seekbar != null && seekpos != null) {
    //seekbar x
		var element = seekbar;
		var seekbarX = element.offsetLeft;
		
		while((element = element.offsetParent) && element != null)
			seekbarX += element.offsetLeft;
		clickX = e.x - seekbarX;
		barWidth = seekbar.offsetWidth;        
		drawSeekBar(clickX / barWidth * seekbar_res);
		var duration=ytplayer.getDuration();
		var seekto = clickX / barWidth * duration;
		ytplayer.seekTo(seekto, true);
    //store the new playback position
		$("#text1").val($("#text1").val() + " 5 " + Math.round(seekto) + " " + today.getTime());
	}
}