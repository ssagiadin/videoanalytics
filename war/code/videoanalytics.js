// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var players = {};
// var url = "http://localhost:8888/researcher_videos?callback=?";
// var purl = "http://localhost:8888/process_action";
var url = "http://sagivideo.appspot.com/researcher_videos?callback=?";
var purl = "http://sagivideo.appspot.com/process_action";
var slide = 0x01; // Buttons - Slider bit mask
var play = 0x02; // Play button bit mask
var forward = 0x04; // Forward button bit mask
var backward = 0x08; // Backward button bit mask
var jump = 0x3F << 4; // Jump duration bit mask (6 bits 0-63 seconds)
var interaction = 0xFF << 10; // Total interaction time bit mask (8 bits 0-255 minutes)
var SEEK_START = '0';
var SEEK_CUR = 'curpos';
var SEEK_END = 'duration';

function createPlayer($elem, analysisid, videoinfo) {
	var pos = videoinfo[1].lastIndexOf('/');
	pos = ((pos == -1) ? 0 : pos + 1);
	var params = { height: videoinfo[4], 
						width: videoinfo[5],
						videoId: videoinfo[1].substr(pos),
						events: {
							'onReady': onPlayerReady
              		}
              	 };
	var controls = parseInt(videoinfo[3]);
	var elemid = 'va' + analysisid;
	
	if ($elem.attr('data-videoanalysis') == 'true') {
		$elem.wrap('<div data-expid="' + analysisid + '" width="' + videoinfo[5] + '" />');
		createMarkup($elem, analysisid, videoinfo);
		params.playerVars = { 'controls': 0, 'disablekb': 1 };
	}
	$elem.removeAttr('data-expid');
	$elem.removeAttr('data-videoanalysis');
	$elem.attr('id', elemid);
	players[analysisid] = new YT.Player(elemid, params);
	players[analysisid].sagivideo_id = analysisid;
	players[analysisid].sagivideo_controls = controls;
	players[analysisid].sagivideo_prev = 0;
}

function onPlayerReady(event) 
{
	var analysisid = event.target.sagivideo_id;
	var controls = event.target.sagivideo_controls;
	var step = (controls & jump) >>> 4;
	var $toolbar = $("#va" + analysisid + "_toolbar");
	
	$( "#va" + analysisid + "_start" ).button({
			text: false,
			icons: {
				primary: "ui-icon-seek-start"
			}
	}).click( function() { seek(analysisid, 0, SEEK_START) } );
	$( "#va" + analysisid + "_back" ).button({
			text: false,
			icons: {
				primary: "ui-icon-seek-prev"
			}
	}).click( function() { seek(analysisid, -step, SEEK_CUR) } );
	$( "#va" + analysisid + "_play" ).button({
			text: false,
			icons: {
				primary: "ui-icon-play"
			}
		})
		.click(function() {
			var options;
			if ( $( this ).text() === "play" ) {
				options = {
					label: "pause",
					icons: {
						primary: "ui-icon-pause"
					}
				};
			} else {
				options = {
					label: "play",
					icons: {
						primary: "ui-icon-play"
					}
				};
			}
			$( this ).button( "option", options );
			playpause(analysisid);
		});
		$( "#va" + analysisid + "_forward" ).button({
			text: false,
			icons: {
				primary: "ui-icon-seek-next"
			}
		}).click( function() { seek(analysisid, step, SEEK_CUR) } );
		$( "#va" + analysisid + "_end" ).button({
			text: false,
			icons: {
				primary: "ui-icon-seek-end"
			}
		}).click( function() { seek(analysisid, 0, SEEK_END) } );
		$( "#va" + analysisid + "_counter" ).button({ 
			disabled: true,
			label: '00:00/00:00'
		});
		$( "#va" + analysisid + "_slider" ).slider({
			min: 0,
			value: 0,
			stop: function( event, ui ) {
				seek(analysisid, ui.value, SEEK_START);
			}
		});
		$toolbar.show().position({
			my: "center top",
			at: "center bottom",
			of: "#va" + analysisid,
			collision: "none"
		});
		var toolbarheight = $toolbar.outerHeight();
		var divheight = $toolbar.parent().height();
		$toolbar.parent().height(divheight + toolbarheight);
		event.target.sagivideo_ready = true;
//	updatehandler = setTimeout(updatePlayerInfo, 200); //Every 200ms searches for updates on player's information
}

function createMarkup($elem, analysisid, videoinfo) {
	var controls = parseInt(videoinfo[3]);
	var barid = "va" + analysisid + "_toolbar";
	var html = ['<div id="' + barid + '" class="ui-widget-header ui-corner-all" style="padding: 4px; display: inline-block; font-size: 55%">'];
	
	if (controls & slide) {
		var sliderwidth = parseInt(videoinfo[5]) * 0.5;
		html.push('<button id="va' + analysisid + '_play">play</button>');
		html.push('<div id="va' + analysisid + '_slider" style="display: inline-block; width: ' + sliderwidth + 'px; margin: 0 0.5em" ></div>');
	} else {
		html.push('<button id="va' + analysisid + '_start">go to beginning</button>');
		html.push('<button id="va' + analysisid + '_back">backward</button>');
		html.push('<button id="va' + analysisid + '_play">play</button>');
		html.push('<button id="va' + analysisid + '_forward">forward</button>');
		html.push('<button id="va' + analysisid + '_end">go to end</button>')
	}
	html.push('<button id="va' + analysisid + '_counter"></button>');
	html.push('</div>');
	$elem.after(html.join('\n'));
	$("#" + barid).hide();
}

function playpause(eid)
{
	var p = players[eid];	
	var time = Math.round(p.getCurrentTime()); // Collects the current second for the database
	var today = new Date(); // Get the current time
	var action = { expid : eid,  vtime : time, ctime : today.getTime() };
	
	if (p.getPlayerState() == 	YT.PlayerState.PAUSED) { //an brisketai se katastash Pause
		p.unMute(); // Video has volume
		p.playVideo(); // Video starts
		action['code'] = 3;
		$.post(purl, action);
	} else if (p.getPlayerState() == YT.PlayerState.PLAYING) {
		p.pauseVideo(); // Pause video
		action['code'] = 4;
		$.post(purl, action);
	} else if (p.getPlayerState() == YT.PlayerState.CUED) {
		p.unMute(); // Video has volume
		p.playVideo(); // Video starts
	}
}

function seek(eid, dist, origin)
{
	var p = players[eid];
	var curpos = Math.round(p.getCurrentTime()); // Collects the current second for the database
	var duration = p.getDuration(); // Gets video's duration
	var today = new Date(); // Get the current time
	var newpos;
	
	p.unMute();
	newpos = eval(origin);
	newpos += dist;
	if (newpos < 0) {
		newpos = 0;
	} else if (newpos > duration) {
		newpos = duration;
	}
	var act = (curpos > newpos) ? 1 : 2; 
	p.seekTo(newpos, true);
	compval = curpos << 16;
	compval = compval | newpos;
	var action = { expid : eid, code : act, vtime : compval, ctime : today.getTime() };
	$.post(purl, action);		
}

function toTime(secs) //This function converts video time from milliseconds to seconds 
{ 
	var t = new Date(0,0,0);
	t.setSeconds(secs);

	return t.toTimeString().substr(3,5);
}

function isEmptyObject(obj) {
  for(var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }
  return true;
}

function updatePlayersInfo() {
	if (!isEmptyObject(players)) {
		for (x in players) {
			var p = players[x];
			if (p.sagivideo_ready) {
				var cur = Math.round(p.getCurrentTime());
				if (p.sagivideo_prev != cur) {
					var duration = p.getDuration();
					var counter = toTime(cur) + '/' + toTime(duration);
					$("#va" + p.sagivideo_id + "_counter").button("option", "label", counter);
					$("#va" + p.sagivideo_id + "_slider").slider("option", "max", duration);
					$("#va" + p.sagivideo_id + "_slider").slider("value", cur);
					p.sagivideo_prev = cur;
				}
			}
		}
	}
	updateHandler = setTimeout(updatePlayersInfo, 1000);
}

// Replace the 'ytplayer' element with an <iframe> and
// YouTube player after the API code downloads.
function onYouTubePlayerAPIReady() {
	$('[data-videoanalysis]').each(function () {
		var $elem = $(this);
		var analysisid = $elem.attr('data-expid');
		
		$.getJSON(url, { expid : analysisid }, function (data) {
			if ('string' == typeof(data)) {
				$.getJSON(url, { expid : analysisid }, function (data) {
					if ('string' == typeof(data)) {
						alert('Error retrieving video info.');
					} else {
						createPlayer($elem, analysisid, data);
					}
				});
			} else {
				createPlayer($elem, analysisid, data);
			}		
		});
	});
}

$(document).ready(function() {
	updateHandler = setTimeout(updatePlayersInfo, 1000);
});