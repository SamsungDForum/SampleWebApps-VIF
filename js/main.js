/******************** GLOBAL VARIABLES ********************/
var player; // Video player
var playPauseB = document.getElementById("control0"); // PlayPause button
var volume = document.getElementById("control9"); // Mute button
var timeElapsed = document.getElementById('time-elapsed'); // Current play time of video
var duration = document.getElementById('duration'); // Total play time of video
// List of video links that will stream on the media player
var vid =["http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"];
var controlIndex = 0; // Position index of current player control button
var playIndex = 0; // Position index of current selected playlist video
var currentlyPlaying = 0; // Index of currently playing video from the playlist
var cursorOnControls = false; // Flag to check if the cursor is focused on the media controls
var rewinding = false; // Flag to check if the video is being rewinded
var fforwarding = false; // Flag to check if the video is being fast forwarded
const sizeOfPlaylist = 5; // Size of playlist
const sizeOfControls = 10; // Number of control buttons in the media player
var showRewindTooltip = true; // Flag for showing rewind tooltip
var showFFTooltip = true; // Flag for showing fastforward tooltip
var rewindTooltipTimer; // SetTimeout for the rewind tooltip
var ffTooltipTimer; // SetTimeout for the fast forward tooltip
/* Variables for Deeplink commands */
var cmd_Restart = 'tvMediaControl.Restart';
var cmd_TrackNext = 'tvMediaControl.TrackNext';
var cmd_TrackPrevious = 'tvMediaControl.TrackPrevious';
var cmd_SkipForward = 'tvMediaControl.SkipForward';
var cmd_SkipBackward = 'tvMediaControl.SkipBackward';
var cmd_SetPlayPosition = 'tvMediaControl.SetPlayPosition';

/******************** FUNCTIONS ********************/
// Register remote control keys in order for the application to react accordingly
function registerKeys(){
	var usedKeys = [
	    "MediaPause",
	    "MediaPlay",
	    "MediaPlayPause",
	    "MediaFastForward",
	    "MediaRewind",
	    "MediaStop",
	    "MediaTrackNext",
	    "MediaTrackPrevious"
	];
	usedKeys.forEach(
	  	function (keyName){
	  		try {
	  			tizen.tvinputdevice.registerKey(keyName);
	  	    } catch(error) {
	  	        console.log("Failed to register " + keyName + ": " + error);
	  	    }
	  	}
	);
}
// Initialize bixby, the media player and Deeplink listeners
function startplayer(){
	webapis.bixby.initialize();
	registerKeys();
	// Register all the deep link actions that your app requires
	webapis.bixby.setActionExecutionListener(cmd_Restart, reload_vid);
	webapis.bixby.setActionExecutionListener(cmd_TrackNext, next_vid);
	webapis.bixby.setActionExecutionListener(cmd_TrackPrevious, previous_vid);
	webapis.bixby.setActionExecutionListener(cmd_SkipForward, skipForward);
	webapis.bixby.setActionExecutionListener(cmd_SkipBackward, skipBackward);
	webapis.bixby.setActionExecutionListener(cmd_SetPlayPosition, setPlayPosition);
	player = document.getElementById("video_player");
	player.controls = false;
	player.addEventListener('timeupdate', updateTimeElapsed);
	console.log("PLAYER HAS STARTED");
}
// Update the current video time that has elapsed 
function updateTimeElapsed() {
	const time = formatTime(Math.round(player.currentTime));
	timeElapsed.innerHTML = time.minutes + ":" + time.seconds;
	timeElapsed.setAttribute('datetime', time.minutes + "m " + time.seconds + "s");
}
// Play or pause the current video
function playPause_vid(){
	console.log(playPauseB.src.substr(playPauseB.src.length - 24));
	rewinding = false;
	fforwarding = false;
	if(playPauseB.src.substr(playPauseB.src.length - 24) === "images/play_selected.jpg"){
		if(cursorOnControls){
			if(controlIndex === 0){
				playPauseB.src = "images/pause_selected.jpg";
			} else {
				playPauseB.src = "images/pause.jpg";
			}
		} else {
			playPauseB.src = "images/pause.jpg";
		}
		player.playbackRate = 1.0;
		player.play();
		console.log("PLAYING");
	} else {
		playPauseB.src = "images/play_selected.jpg";
		player.pause();
		console.log("STOP");
	}
	const videoDuration = Math.round(player.duration);
	const time = formatTime(videoDuration);
	var minutes = String(time.minutes);
	var seconds = String(time.seconds);
	duration.innerHTML = minutes + ":" + seconds;
	duration.setAttribute('datetime', minutes + "m " + seconds + "s");
}
// Stop the video
function stop_vid(){
	rewinding = false;
	fforwarding = false;
	player.pause();
	player.currentTime = 0;
	playPauseB.src = "images/play.jpg";
	console.log("PLAYER STOPPED");
}
// Load and play the previous video on the playlist, if the current video is the first one on the playlist, it will reload and replay
function previous_vid(action_id){
	// Action Complete Result - "success", "fail", "notSupported"
	var resultCode = [{"result_code":"SUCCESS"}];
	rewinding = false;
	fforwarding = false;
	if(currentlyPlaying-1 < 0){
		currentlyPlaying = 0;
		playIndex = 0;
		player.src = vid[0];
	} else {
		currentlyPlaying--;
		playIndex = currentlyPlaying;
		player.src = vid[playIndex];
	}
	player.onloadedmetadata = function() {
		  console.log('metadata loaded!');
		  console.log(player.duration);
		  playPauseB.src = "images/play_selected.jpg";
		  playPause_vid();
		};
	OncompleteActionExecution(action_id, resultCode);
	console.log("PREVIOUS VIDEO LOADED");
}
// Load and play the next video on the playlist, if the video is the last one on the playlist, it will reload and replay
function next_vid(action_id){
	// Action Complete Result - "success", "fail", "notSupported"
	var resultCode = [{"result_code":"SUCCESS"}];
	rewinding = false;
	fforwarding = false;
	if(currentlyPlaying+1 >= sizeOfPlaylist){
		currentlyPlaying = sizeOfPlaylist-1;
		playIndex = currentlyPlaying;
		player.src = vid[sizeOfPlaylist-1];
	} else {
		currentlyPlaying++;
		playIndex = currentlyPlaying;
		player.src = vid[playIndex];
	}
	player.onloadedmetadata = function() {
		  console.log('metadata loaded!');
		  console.log(player.duration);
		  playPauseB.src = "images/play_selected.jpg";
		  playPause_vid();
		};
	OncompleteActionExecution(action_id, resultCode);
	console.log("NEXT VIDEO LOADED");
}
// Video will rewind by 'offset' seconds or by 10 seconds if there is no offset
function skipBackward(action_id, bundle_message){
	// Action Complete Result - "success", "fail", "notSupported"
	var resultCode = [{"result_code":"SUCCESS"}];
	rewinding = false;
	fforwarding = false;
	if(typeof bundle_message !== "undefined"){
		if(bundle_message.hasOwnProperty("offset")){
			if(player.currentTime < bundle_message.offset){
				player.currentTime = 0;
			} else {
				player.currentTime -= parseFloat(bundle_message.offset); // Added parseFloat since this line would not work without it	
			}	
		}
	} else {
		if(player.currentTime < 10){
			player.currentTime = 0;
		} else {
			player.currentTime -= 10;	
		}	
	}
	OncompleteActionExecution(action_id, resultCode);
	console.log("SKIPPED BACKWARDS BY: " + bundle_message.offset);
}
// Video will fastforward by 'offset' seconds or by 10 seconds if there is no offset 
function skipForward(action_id, bundle_message){
	// Action Complete Result - "success", "fail", "notSupported"
	var resultCode = [{"result_code":"SUCCESS"}];
	rewinding = false;
	fforwarding = false;
	if(typeof bundle_message !== "undefined"){
		if(bundle_message.hasOwnProperty("offset")){
			if(player.currentTime > (player.duration - bundle_message.offset)){
				stop_vid();
			} else {
				player.currentTime += parseFloat(bundle_message.offset); // Added parseFloat since this line would not work without it
			}
		}	
	} else {
		if(player.currentTime > (player.duration - 10)){
			stop_vid();
		} else {
			player.currentTime += 10;
		}	
	}
	OncompleteActionExecution(action_id, resultCode);
	console.log("SKIPPED FORWARD BY: " + bundle_message.offset);
}
// Set the new play position of the video
function setPlayPosition(action_id, bundle_message){
	var resultCode = [{"result_code":"SUCCESS"}];
	if(bundle_message.position !== undefined){
		rewinding = false;
		fforwarding = false;
		if(player.duration > bundle_message.position){
			player.currentTime = bundle_message.position;
		}
	}
	OncompleteActionExecution(action_id, resultCode);
	console.log("SET PLAY POSITION: " + bundle_message.position);
}
// The video will continuously rewind until it reaches current time 00:00 or if the user presses another player control button
function rewind_vid(){
	fforwarding = false;
	var rewindInterval;
	if(rewinding){
		rewinding = false;
		clearInterval(rewindInterval);
		player.play();
		player.playbackRate = 1.0;
		playPauseB.src = "images/pause.jpg";
	} else {
		rewinding = true;
		playPauseB.src = "images/play.jpg";
		player.pause();
		rewindInterval = setInterval(function(){
			if(rewinding && player.currentTime > 0){
				player.currentTime -= 2;
			} else {
				rewinding = false;
				player.play();
				clearInterval(rewindInterval);
			}	
		}, 500);
	}
	console.log("REWINDING");
}
// The current video will fast forward 3x the normal speed
function forward_vid(){
	rewinding = false;
	var fforwardingInterval;
	if(fforwarding){
		fforwarding = false;
		clearInterval(fforwardingInterval);
		player.play();
		player.playbackRate = 1.0;
		playPauseB.src = "images/pause.jpg";
	} else {
		fforwarding = true;
		playPauseB.src = "images/play.jpg";
		player.pause();
		fforwardingInterval = setInterval(function(){
			if(fforwarding && player.currentTime < player.duration-4){
				player.currentTime += 2;
			} else {
				fforwarding = false;
				player.currentTime = player.duration;
				player.pause();
				clearInterval(fforwardingInterval);
			}
		}, 500);
	}
	console.log("FAST FORWARD");
}
// The current video will play from the beginning
function reload_vid(action_id){
	// Action Complete Result - "success", "fail", "notSupported"
	var resultCode = [{"result_code":"SUCCESS"}];
	console.log("RELOAD FUNCTION CALLED");
	rewinding = false;
	fforwarding = false;
	player.currentTime = 0;
	OncompleteActionExecution(action_id, resultCode);
}
// The current video volume will be muted or unmuted
function mute(){
	console.log(volume.src.substr(volume.src.length - 26));
	if(volume.src.substr(volume.src.length - 26) === "images/volume_selected.jpg"){
		volume.src = "images/mute_selected.jpg";
		player.muted = true;
	} else {
		volume.src = "images/volume_selected.jpg";
		player.muted = false;
	}
	console.log("MUTED");
}
// Initializer for the playlist
function initializePlaylist(){
	playIndex = 0;
	var selector = document.getElementsByClassName('video');
	selector[playIndex].style.borderBottom = "4px solid #fff";
	console.log("PLAYLIST INITIALIZED");
}
// Update visual cursor when the user presses a navigation button on the remote control while focused on the playlist
function playlistCursorChange(){
	var selector = document.getElementsByClassName('video');
	for(var i=0; i<sizeOfPlaylist; i++){
		selector[i].style.borderBottom = "4px solid transparent";
	}
	selector[playIndex].style.borderBottom = "4px solid #fff";
}
// Update visual cursor when the user presses a navigation button on the remote control while focused on the media control buttons
function controlsCursorChange(){
	console.log(controlIndex);
	for(var i=0; i<sizeOfControls; i++){
		switch(document.getElementById("control"+String(i)).getAttribute("src")){
			case "images/play_selected.jpg": document.getElementById("control"+String(i)).src = "images/play.jpg"; break;
			case "images/pause_selected.jpg": document.getElementById("control"+String(i)).src = "images/pause.jpg"; break;
			case "images/stop_selected.jpg": document.getElementById("control"+String(i)).src = "images/stop.jpg"; break;
			case "images/previous_selected.jpg": document.getElementById("control"+String(i)).src = "images/previous.jpg"; break;
			case "images/skipbackward_selected.jpg": document.getElementById("control"+String(i)).src = "images/skipbackward.jpg"; break;
			case "images/rewind_selected.jpg": document.getElementById("control"+String(i)).src = "images/rewind.jpg"; break;
			case "images/fastforward_selected.jpg": document.getElementById("control"+String(i)).src = "images/fastforward.jpg"; break;
			case "images/skipforward_selected.jpg": document.getElementById("control"+String(i)).src = "images/skipforward.jpg"; break;
			case "images/next_selected.jpg": document.getElementById("control"+String(i)).src = "images/next.jpg"; break;
			case "images/reload_selected.jpg": document.getElementById("control"+String(i)).src = "images/reload.jpg"; break;
			case "images/volume_selected.jpg": document.getElementById("control"+String(i)).src = "images/volume.jpg"; break;
			case "images/mute_selected.jpg": document.getElementById("control"+String(i)).src = "images/mute.jpg"; break;
		}
	}
	switch(controlIndex){
		case 0: if(document.getElementById("control"+String(controlIndex)).getAttribute("src") === "images/play.jpg"){
					document.getElementById("control"+String(controlIndex)).src = "images/play_selected.jpg";
				} else {
					document.getElementById("control"+String(controlIndex)).src = "images/pause_selected.jpg";
				} break;
		case 1: document.getElementById("control"+String(controlIndex)).src = "images/stop_selected.jpg"; break;
		case 2: document.getElementById("control"+String(controlIndex)).src = "images/previous_selected.jpg"; break;
		case 3: document.getElementById("control"+String(controlIndex)).src = "images/skipbackward_selected.jpg"; 
				if(!showRewindTooltip){ clearTimeout(rewindTooltipTimer); var x = document.getElementById("rewindTooltip"); x.className = x.className.replace("showRewind", ""); x.style.display = "none"; x.style.visibility = "hidden"; showRewindTooltip = true; }
				break;
		case 4: document.getElementById("control"+String(controlIndex)).src = "images/rewind_selected.jpg"; 
				if(showRewindTooltip){ showRewindTooltip = false; rewindTooltip(); } 
				if(!showFFTooltip){ clearTimeout(ffTooltipTimer); var y = document.getElementById("ffTooltip"); y.className = y.className.replace("showFF", "");	y.style.display = "none"; y.style.visibility = "hidden"; showFFTooltip = true; }
				break;
		case 5: document.getElementById("control"+String(controlIndex)).src = "images/fastforward_selected.jpg"; 
				if(showFFTooltip){ showFFTooltip = false; ffTooltip(); } 
				if(!showRewindTooltip){ clearTimeout(rewindTooltipTimer); var w = document.getElementById("rewindTooltip"); w.className = w.className.replace("showRewind", ""); w.style.display = "none"; w.style.visibility = "hidden"; showRewindTooltip = true; }
				break;
		case 6: document.getElementById("control"+String(controlIndex)).src = "images/skipforward_selected.jpg";
				if(!showFFTooltip){ clearTimeout(ffTooltipTimer); var v = document.getElementById("ffTooltip"); v.className = v.className.replace("showFF", ""); v.style.display = "none"; v.style.visibility = "hidden"; showFFTooltip = true; }
				break;
		case 7: document.getElementById("control"+String(controlIndex)).src = "images/next_selected.jpg"; break;
		case 8: document.getElementById("control"+String(controlIndex)).src = "images/reload_selected.jpg"; break;
		case 9: if(document.getElementById("control"+String(controlIndex)).getAttribute("src") === "images/volume.jpg"){
					document.getElementById("control"+String(controlIndex)).src = "images/volume_selected.jpg";
				} else {
					document.getElementById("control"+String(controlIndex)).src = "images/mute_selected.jpg";
				} break;
	}
}
// Behavior for when the user selects a video from the playlist
function videoClicked(){
	player.src = vid[playIndex];
	currentlyPlaying = playIndex;
	player.onloadedmetadata = function() {
		  console.log('metadata loaded!');
		  console.log(player.duration);
		  playPauseB.src = "images/play_selected.jpg";
		  playPause_vid();
		};
	console.log("VIDEO CLICKED");
}
// Format the time in order to visually display it
function formatTime(timeInSeconds) {
	const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
	return {
		minutes: result.substr(3, 2),
		seconds: result.substr(6, 2),
	};
}
// Update playlist visual appearance
function clearPlaylistBorders(){
	var selector = document.getElementsByClassName('video');
	for(var i=0; i<sizeOfPlaylist; i++){
		selector[i].style.borderBottom = "4px solid transparent";
	}
	controlIndex = 0;
	if(player.paused){
		document.getElementById("control"+String(controlIndex)).src = "images/play_selected.jpg";	
	} else {
		document.getElementById("control"+String(controlIndex)).src = "images/pause_selected.jpg";
	}
}
// Update the visual appearance of the control buttons
function clearControlBorders(){
	for(var i=0; i<sizeOfControls; i++){
		switch(document.getElementById("control"+String(i)).getAttribute("src")){
			case "images/play_selected.jpg":	document.getElementById("control"+String(i)).src = "images/play.jpg"; break;
			case "images/pause_selected.jpg": 	document.getElementById("control"+String(i)).src = "images/pause.jpg"; break;
			case "images/stop_selected.jpg":	document.getElementById("control"+String(i)).src = "images/stop.jpg"; break;
			case "images/previous_selected.jpg":	document.getElementById("control"+String(i)).src = "images/previous.jpg"; break;
			case "images/skipbackward_selected.jpg":	document.getElementById("control"+String(i)).src = "images/skipbackward.jpg"; break;
			case "images/rewind_selected.jpg":	document.getElementById("control"+String(i)).src = "images/rewind.jpg"; break;
			case "images/fastforward_selected.jpg":	document.getElementById("control"+String(i)).src = "images/fastforward.jpg"; break;
			case "images/skipforward_selected.jpg":	document.getElementById("control"+String(i)).src = "images/skipforward.jpg"; break;
			case "images/next_selected.jpg":	document.getElementById("control"+String(i)).src = "images/next.jpg"; break;
			case "images/reload_selected.jpg":	document.getElementById("control"+String(i)).src = "images/reload.jpg"; break;
			case "images/volume_selected.jpg":	document.getElementById("control"+String(i)).src = "images/volume.jpg"; break;
			case "images/mute_selected.jpg":	document.getElementById("control"+String(i)).src = "images/mute.jpg"; break;
		}
	}
	var selector = document.getElementsByClassName('video');
	selector[playIndex].style.borderBottom = "4px solid #fff";
	
}
// Handle the player behavior based on the control button that has been clicked
function controlClicked(){
	switch(controlIndex){
		case 0: playPause_vid(); break;
		case 1: stop_vid(); break;
		case 2: previous_vid(); break;
		case 3: skipBackward(); break;
		case 4: rewind_vid(); break;
		case 5: forward_vid(); break;
		case 6: skipForward(); break;
		case 7: next_vid(); break;
		case 8: reload_vid(); break;
		case 9: mute(); break;
	}
}
// Tooltip message function
function rewindTooltip() {
	// Get the rewindTooltip DIV
	var x = document.getElementById("rewindTooltip");
	// Add the "showRewind" class to DIV
	x.className = "showRewind";
	x.style.display = "block";
	x.style.visibility = "visible";
	// After 5 seconds, remove the showRewind class from DIV
	rewindTooltipTimer = setTimeout(function(){ 
		x.className = x.className.replace("showRewind", ""); 
		x.style.display = "none";
		x.style.visibility = "hidden";
		showRewindTooltip = true;
	}, 5000);
	console.log("SHOWING REWIND TOOLTIP");
}
function ffTooltip() {
	// Get the ffTooltip DIV
	var x = document.getElementById("ffTooltip");
	// Add the "showFF" class to DIV
	x.className = "showFF";
	x.style.display = "block";
	x.style.visibility = "visible";
	// After 5 seconds, remove the showFF class from DIV
	ffTooltipTimer = setTimeout(function(){ 
		x.className = x.className.replace("showFF", ""); 
		x.style.display = "none";
		x.style.visibility = "hidden";
		showFFTooltip = true;
	}, 5000);
	console.log("SHOWING FF TOOLTIP");
}
// Initialize function
var init = function () {
    console.log('init() called');
    initializePlaylist();
    startplayer();
};

// Remote control button listener
document.body.addEventListener('keydown', function(event) {
	switch (event.keyCode) {
		case 13: // Enter
			console.log("ENTER PRESSED");
			if(cursorOnControls){
				controlClicked();
			} else {
				videoClicked();
			}
	        break;
		case 19: // Pause
			playPause_vid();
			break;
		case 37: // Left 
			if(cursorOnControls){
				if(controlIndex-1 < 0){
					controlIndex = sizeOfControls-1;
				} else {
					controlIndex--;
				}
				controlsCursorChange();
			} else {
				if(playIndex-1 < 0){
					playIndex = sizeOfPlaylist-1;
				} else {
					playIndex--;
				}
				playlistCursorChange();
			}
			break;
		case 38: // Up 
			if(!cursorOnControls){
				cursorOnControls = true;
				clearPlaylistBorders();
			}
			break;
		case 39: // Right
			if(cursorOnControls){
				if(controlIndex+1 >= sizeOfControls){
					controlIndex = 0;
				} else {
					controlIndex++;
				}
				controlsCursorChange();
			} else {
				if(playIndex+1 >= sizeOfPlaylist){
					playIndex = 0;
				} else {
					playIndex++;
				}
				playlistCursorChange();
			}
			break;
		case 40: // Down
			cursorOnControls = false;
			clearControlBorders();
			break;
		case 71: // Play
			videoClicked();
			break;	
		case 119: // Volume Mute
			
			break;
		case 120: // Volume Down
		
			break;
		case 121: // Volume Up
			
			break;
		case 412: // Backward
			skipBackward();
			break;
		case 413: // Stop
			stop_vid();
			break;
		case 415: // Play
			playPause_vid();
			break;
		case 417: // Fast Forward
			skipForward();
			break;
		case 65376: // Done
			
			break;	
	    case 65385: // Cancel
	    	
	    	break;
	    case 10009: //RETURN button
	    	webapis.bixby.deinitialize();
    		tizen.application.getCurrentApplication().exit();
    		break;	
	    case 10232:
	    	previous_vid();
	    	break;
	    case 10233: // Next Item
	    	next_vid();
	    	break; 
	    case 10252:
	    	playPause_vid();
	    	break;
	}
});
// On complete action handler
function OncompleteActionExecution(action_id, resultCode) {
	console.log("OnCompleteActionExcution");
	console.log(JSON.stringify(resultCode));
	webapis.bixby.completeActionExecution(action_id, JSON.stringify(resultCode));
}
// Initialize script
window.onload = init;