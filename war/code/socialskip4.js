//How the interactions are saved into the base
//Gobackward->gb:
//GoForward->gf:
//play->p:
//pause->a:

//Once the player is ready, it will call this function 
var testing;
var sliding = false;

function onPlayerReady(event) 
{
	event.target.playVideo(); // Starts the video
	updatehandler = setTimeout(updatePlayerInfo, 200); //Every 200ms searches for updates on player's information
}

//This function counts down 5 minutes,which is the time restriction for user navigation
function closeW() 
{ 
	player.stopVideo(); // This command stops video's playing state
	player.clearVideo();
	$("#pbuttons input[type='button']").button('disable');
	$("#seekbar").slider('disable');
	alert(duration + " minutes have passed"); // This is the alert message for the user
	window.close();   	
}

function FirstwooYay ( )
{
//This function fires if the user presses the link to enable the buttons
//	setTimeout("ytplayer.pauseVideo();",100); //This goes to 100ms of video and pauses it

	if (!testing) {
		player.seekTo(0, true); // Go to the beginning of the video
		player.playVideo();
		testing = true;
		$("#pbuttons input[type='button']").button('enable');
		$("#seekbar").slider('enable');
		$("#seekbar").attr('max', player.getDuration());
		$("#seekbar").on('slidestart', function(event) {
			sliding = true;
		})
	    $("#seekbar").on('slidestop', updateSeekBar);
// The alert message, which informs about the end of the available time, will pop up
		window.setTimeout("closeW()", duration * 60 * 1000);
	}
}

function playpause() //Function for the Play/Pause button 
{ 
	if (player.getPlayerState() == YT.PlayerState.PAUSED) { //an brisketai se katastash Pause
		player.unMute(); // Video has volume
		player.playVideo(); // Video starts
		var time= player.getCurrentTime(); // Collects the current second for the database
		var today = new Date(); // Get the current time
		//Matches the time with the button that has been used and save them on text1
		$("#text1").val($("#text1").val() + " 3 " + Math.round(time) + " " + today.getTime());
	    $("#playbutton").buttonMarkup({icon: "sagisoc-pause", corners: false, shadow: false});
	    $("#playbutton").val("Playing");
	}
	else if (player.getPlayerState() == YT.PlayerState.PLAYING) {
		player.pauseVideo(); // Pause video
		var time= player.getCurrentTime(); // Collects the current second for the database
		var today = new Date(); // Get the current time
		// Matches the time with the button that has been used
		$("#text1").val($("#text1").val() + " 4 " + Math.round(time) + " " + today.getTime()); 
	    $("#playbutton").buttonMarkup({icon: "arrow-r", corners: false, shadow: false});
	    $("#playbutton").val("Paused");
	}
    $("#playbutton").button('refresh');
}		
         
function gobackward() //Function for the  goBackward button 
{ 
	player.unMute();

	var time= player.getCurrentTime(); // Collects the current second for the database
	var today = new Date(); // Get the current time
//If the current time of the video's playing state is bigger than 30 seconds then goes back 30 sec
	if (time > jump) {   
		player.seekTo(time-jump, true);
	}
	else { //Otherwise go at the beginning of the video and start the video's playing state 
		player.seekTo(0,true);
		player.playVideo();
	}
	// Matches the time with the button that has been used and save them on text1
	$("#text1").val($("#text1").val() + " 1 " + Math.round(time) + " " + today.getTime());
}

function goforward() //Function for the Goforward button 
{ 
	player.unMute();

	var time = player.getCurrentTime(); // Collects the current second for the database
	var duration = player.getDuration(); // Gets video's duration
	var today = new Date(); // Get the current time
	time += jump; //Raises by 30 time variable	
	if( time <= duration ) { //Checks is the time variable is smaller than duration  
		player.seekTo(time, true); //If it does not overtake the duration, the playing second changes
	}
	else { 
		player.seekTo(duration,true); // Goes at the end of video
		player.playVideo();
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

function onPlayerError(errorCode) // This function is called when an error is thrown by the player
{
	alert("An error occured of type:" + errorCode);
}

function onPlayerStateChange(event) // This function is called when the player changes state
{
  updateHTML("playerState", newState);
}

// Display information about the current state of the player
function updatePlayerInfo() {
	var total = player.getDuration();
	var ctime = player.getCurrentTime();	
	var info = toTime(total) + '/' + toTime(ctime);

	if (testing) {
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
		info += " Ramaining Time: " + seconds + "." + milisec;
		if (!sliding) {
			$("#seekbar").val(Math.round(ctime));
			$("#seekbar").slider('refresh');
		}
	}
	$("#videoheader .ui-btn-text").html("Video Player: " + info);
	updatehandler = setTimeout(updatePlayerInfo, 200);
}

function temp() //This Function is fired when user presses submit
{ 
	window.onbeforeunload=null;
}

function updateSeekBar(event) {
	var ctime = Math.round(player.getCurrentTime());
	var seekto = parseInt($("#seekbar").val());
	var today = new Date(); // Get the current time
	
	player.seekTo(seekto, true);
    //store the new playback position
	$("#text1").val($("#text1").val() + " 5 " + Math.round(seekto) + " " + today.getTime());
	sliding = false;
//	updatehandler = setTimeout(updatePlayerInfo, 200);
//	updatePlayerInfo();
}