/* jshint undef: false*/

/******************** GLOBAL VARIABLES ********************/
// Variable used for the toast appearance
var setTimer;
// Variable used for the navigation delay
var setTimerNav;
// Index value of current selected media
var mediaIndex = 0;
// Saved utterance from the user
var utterance;
// Number of providers for selected content 
var numProviders = 5;
// Index for provider element selection
var focusIndex = 0;
// Flag to indicate if provider window is showing
var providerWindowIsVisible = false;
// Flag for disabling button pressing during navigation transition
var buttonEnabled = true;
// String taken from URI component
var queryString;
// Media id take from index.html
var mediaId;
// Flag that toggles the toast messages ON and OFF
var toastMessageIsOn;
// ***
var apps = [];

/******************** FUNCTIONS ********************/
// Register remote control keys in order for the application to react accordingly
function registerKeys(){
	var usedKeys = [
	    "Exit",
	    "ColorF0Red",
	    "ColorF1Green",
	    "ColorF2Yellow",
	    "ColorF3Blue"
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
// Initialize voice web api
function voiceInteractionInit(){
	console.log("ENTERED voiceInteractionInit FUNCTION");
	var version = "0.0.0";
	try{
		version = webapis.voiceinteraction.getVersion();
	}
	catch(e){
		console.log("exception [" + e.code + "] name: " + e.name + " message: " + e.message);
	}
	try{
		webapis.voiceinteraction.setCallback(
			{
			onupdatestate: function(){
				console.log("AppState Called");
				// "None" - Application Default Status - None
				// "List" - The status of application showing something in list - Voice Navigation, Selection
				// "Player" - The status of application playing a content - Voice Media Control
			    return "List";
			},
			onchangeappstate: function(state){
				console.log("onchangeappstate : " + state);
				var bSupport = true;
				switch(state){
					case "Home":
						document.getElementById("desc").innerHTML = "<p>App state changed to: Home</p>";
						launch_toast();
				    	window.location.href = "index.html";
						break;
					case "Setting":
						document.getElementById("desc").innerHTML = "<p>App state changed to: Setting</p>";
						launch_toast();
						break;
					case "Search":
						document.getElementById("desc").innerHTML = "<p>App state changed to: Search</p>";
						launch_toast();
						break;	
					default:
						bSupport = false;
						break;
			     }
			     return bSupport;
			},
			onnavigation : function (voiceNavigation) {
				var bSupport = true;
				console.log("onnavigation: " + voiceNavigation);
				switch(voiceNavigation) {
					case "NAV_PREVIOUS":
						console.log("NAV_PREVIOUS CALLED");
						if(providerWindowIsVisible){
							selectedElement = document.getElementById("cancel-button");
							isFocused = (document.activeElement === selectedElement);
							if(!isFocused){
								navLeft();
							}
						}
						break;
					case "NAV_NEXT":
						console.log("NAV_NEXT CALLED");
						if(providerWindowIsVisible){
							selectedElement = document.getElementById("cancel-button");
							isFocused = (document.activeElement === selectedElement);
							if(!isFocused){
								navRight();
							}
						}
						break;
					case "NAV_LEFT":
						if(providerWindowIsVisible){
							selectedElement = document.getElementById("cancel-button");
							isFocused = (document.activeElement === selectedElement);
							if(!isFocused){
								navLeft();
							}
						}
						break;
					case "NAV_RIGHT":
						if(providerWindowIsVisible){
							selectedElement = document.getElementById("cancel-button");
							isFocused = (document.activeElement === selectedElement);
							if(!isFocused){
								navRight();
							}
						}
						break;
					case "NAV_UP":
						if(providerWindowIsVisible){
							selectedElement = document.getElementById("cancel-button");
							isFocused = (document.activeElement === selectedElement);
							if(isFocused){
								document.getElementsByClassName("provider")[focusIndex].focus();
							}	
						}
						break;
					case "NAV_DOWN":
						if(providerWindowIsVisible){
							selectedElement = document.getElementById("cancel-button");
							isFocused = (document.activeElement === selectedElement);	
							if(!isFocused){
								selectedElement.focus();
							}
						}
						break;
					case "NAV_SHOW_MORE":
						console.log("NAV_SHOW_MORE CALLED");
						document.getElementById("desc").innerHTML = "<p>THIS APP DOES NOT UTILIZE THE SHOW MORE FEATURE</p>";
						launch_toast();
			            break;
					default:
						console.log("DEFAULT CALLED");
						document.getElementById("desc").innerHTML = "<p>NO VALID ACTION WAS CALLED</p>";
						launch_toast();
						bSupport = false;
						break;
				}
				return bSupport;
			},
			onselection: function(voiceSelection){
				var bSupport = true;
				console.log("onselection : " + voiceSelection);
				switch(voiceSelection){
					case -1:
						if(providerWindowIsVisible){
							queryString = "?para1=" + mediaId;
							queryString += "&para2=" + utterance;
							window.location.href = "player.html" + queryString;
						}
						break;
					case 0:
						var selectedElement = document.getElementById("watch-button");
						var isFocused = (document.activeElement === selectedElement);
						if(isFocused){
							console.log("ENTERED OPENWATCHNOWWINDOW");
							openWatchNowWindow();	
						} else if(providerWindowIsVisible){
							selectedElement = document.getElementById("cancel-button");
							isFocused = (document.activeElement === selectedElement);
							if(isFocused){
								console.log("CLOSING WATCH NOW WINDOW");
								closeWatchNowWindow();	
							} else {
								console.log("TOAST");
								queryString = "?para1=" + mediaId;
								queryString += "&para2=" + utterance;
								window.location.href = "player.html" + queryString;
							}
						}
						break;
					default:
					{
						console.log("CALLING DEFAULT CASE");
						if(providerWindowIsVisible){
							if(voiceSelection >= 1){
								// Select the (voiceSelection)th item
								// index of the first item is 1
								queryString = "?para1=" + mediaId;
								queryString += "&para2=" + utterance;
								window.location.href = "player.html" + queryString;
							} else {
								bSupport = false;
							}
						}
					}
					break;
				}
				return bSupport;
			}
		});
	} catch(err){
		console.log("TRY CATCH FOR CALLBACKS: " + err.message);
		document.getElementById("desc").innerHTML = "<p>" + err.message + "</p>";
		launch_toast();
	}
	try{
		webapis.voiceinteraction.listen();
		console.log("LISTEN FUNCTION CALLED");
	} catch(err){
		console.log("TRY CATCH FOR LISTEN FUNCTION: " + err.message);
		document.getElementById("desc").innerHTML = "<p>" + err.message + "</p>";
		launch_toast();
	}
}
// Display the popup window after pressing the watch now button
function openWatchNowWindow(){
	var popupContainer = document.getElementById("popup-container");
	var providers = document.getElementById("providers");
	var toPrint = "";
	var leftPosition = 23;
	focusIndex = 0;
	for(var i=0; i<numProviders; i++){
		toPrint += "<div class='provider' tabindex='0' onclick='openVideoPlayer()'><img class='provider-image' src='js/posters/blankP.jpg' />";
		toPrint += "<h2>Provider Title</h2>";
		toPrint += "<h3>Rent from $3.99(HD)</h3>";
		toPrint += "</div>";
	}
	providers.innerHTML = toPrint;
	for(var j=1; j<apps.length; j++){
		document.getElementsByClassName("provider")[j].style.left = leftPosition + "em";
		leftPosition += 22;
	}
	popupContainer.style.visibility = "visible";
	document.getElementsByClassName("provider")[focusIndex].focus();
	providerWindowIsVisible = true;
}
// Opens up the video player page
function openVideoPlayer(){
	queryString = "?para1=" + mediaId;
	queryString += "&para2=" + utterance;
	window.location.href = "player.html" + queryString;
}
// Hide the popup window after pressing the cancel button
function closeWatchNowWindow(){
	console.log("CLOSING WATCH NOW WINDOW");
	var popupContainer = document.getElementById("popup-container");
	var watchNowButton = document.getElementById("watch-button");
	var providers = document.getElementById("providers");
	providers.innerHTML = "";
	popupContainer.style.visibility = "hidden";
	watchNowButton.focus();
	providerWindowIsVisible = false;
}
// Fill in all the detail information for the element that was selected
function fillInfo(){
	queryString = decodeURIComponent(window.location.search);
	console.log(queryString);
	var parameters = queryString.split("&");
	utterance = parameters[1].slice(6);
	console.log(utterance);
	mediaId = parameters[0].substring(7);
    console.log("Chosen media id: " + mediaId);
    var titleDiv = document.getElementById("title");
    console.log("Films length: " + films.length);
    // Get index position of content
    for(var i=0; i<films.length; i++){
    	if(films[i].id === parseInt(mediaId)){
    		console.log("FILMS ID: " + films[i].id);
    		console.log("MEDIA ID: " + mediaId);
    		mediaIndex = i;
    		break;
    	}
    }
    titleDiv.innerHTML = "<h1>" + films[mediaIndex].title + "</h1>";
    // Insert poster
    var posterDiv = document.getElementById("poster-container");
    posterDiv.innerHTML = "<img id='poster' src='" + films[mediaIndex].url + "' />";
    // Insert details
    var detailsDiv = document.getElementById("details");
    var genreString = films[mediaIndex].genre.join(", ");
    detailsDiv.innerHTML = "<p>" + films[mediaIndex].year + " | " + films[mediaIndex].duration + " | " + films[mediaIndex].rating + " | " + genreString + "</p>";
    // Insert director and cast
    var infoDiv = document.getElementById("info");
    var castString = films[mediaIndex].cast.join(", ");
    infoDiv.innerHTML = "<p>"+LANG_JSON_DATA.director+": " + films[mediaIndex].director + "</p><p>"+LANG_JSON_DATA.cast+": " + castString + "</p>";
    // Insert plot
    var descDiv = document.getElementById("description");
    descDiv.innerHTML = "<p>" + films[mediaIndex].plot + "</p>";
    var available = document.getElementById("available");
    available.innerHTML = "<p>"+LANG_JSON_DATA['available-on']+": "+films[mediaIndex].app.join(", ") + "</p>";
    apps = films[mediaIndex].app;
    //<p>Available on: Amazon Prime Video | Apple TV | FandangoNOW | Google Play Movies & TV | VUDU</p>
    document.getElementById("available").style.visibility = "visible";
    document.getElementById("watch-button").style.visibility = "visible";
    document.getElementById("watch-button").focus();
}
// Function for when the user presses the left button while provider window is visible
function navLeft(){
	if(focusIndex > 0 && buttonEnabled){
		focusIndex -= 1;
		if(focusIndex > 0 && focusIndex < (apps.length-2)){
			pShiftRight();	
		} else {
			document.getElementsByClassName("provider")[focusIndex].focus();
		}
	}
}
// Function that shifts provider divs one position to the right
function pShiftRight(){
	var leftPosition = 23;
	buttonEnabled = false;
	document.getElementsByClassName("provider")[focusIndex].style.left = leftPosition + "em";
	document.getElementsByClassName("provider")[focusIndex].focus();
	for(var index=0; index<(focusIndex-1); index++){
		document.getElementsByClassName("provider")[index].style.left = "-25em";
	}
	if((focusIndex-1) >= 0){
		document.getElementsByClassName("provider")[focusIndex-1].style.left = "1em";
	}
	for(var i=(focusIndex+1); i<apps.length; i++){
		leftPosition += 22;
		document.getElementsByClassName("provider")[i].style.left = leftPosition + "em";
	}
	setTimerNav = setTimeout(function(){ buttonEnabled = true; }, 250);
}
// Function for when the user presses the right button while provider window is visible
function navRight(){
	if(focusIndex < apps.length-1 && buttonEnabled){
		focusIndex += 1;
		if(focusIndex > 1 && focusIndex < (apps.length-1)){
			pShiftLeft();	
		} else {
			document.getElementsByClassName("provider")[focusIndex].focus();
		}
	}
}
// Function that shifts provider divs one position to the left
function pShiftLeft(){
	var leftPosition = 23;
	buttonEnabled = false;
	document.getElementsByClassName("provider")[focusIndex].style.left = leftPosition + "em";
	document.getElementsByClassName("provider")[focusIndex].focus();
	for(var index=0; index<(focusIndex-1); index++){
		document.getElementsByClassName("provider")[index].style.left = "-25em";
	}
	if((focusIndex-1) >= 0){
		document.getElementsByClassName("provider")[focusIndex-1].style.left = "1em";
	}
	for(var i=(focusIndex+1); i<apps.length; i++){
		leftPosition += 22;
		document.getElementsByClassName("provider")[i].style.left = leftPosition + "em";
	}
	setTimerNav = setTimeout(function(){ buttonEnabled = true; }, 250);
}
// Initialize function
var init = function () {
	if(localStorage.getItem("vToastMessageIsOn") === null){
		toastMessageIsOn = true;
	} else {
		if(localStorage.getItem("vToastMessageIsOn") === "false"){
			toastMessageIsOn = false;
		} else {
			toastMessageIsOn = true;
		}
	}
	registerKeys();
	registerEventListeners();
    console.log('init() called');
    voiceInteractionInit();
    document.getElementById("content-container").innerHTML = "<p>"+LANG_JSON_DATA['content-container']+"</p><div id=\"providers\"></div>";
    document.getElementById("cancel-button").innerText = LANG_JSON_DATA['cancel'];
    document.getElementById("watch-button").innerText = LANG_JSON_DATA['watch'];
    fillInfo();
};
// Initialize event listeners for clickable elements
function registerEventListeners(){
	document.getElementById("watch-button").addEventListener("click", openWatchNowWindow);
	document.getElementById("cancel-button").addEventListener("click", closeWatchNowWindow);
}
// Remote control button listener
document.body.addEventListener('keydown', function(event) {
	switch (event.keyCode) {
		case 13: // Enter
			event.preventDefault();
			var selectedElement = document.getElementById("watch-button");
			var isFocused = (document.activeElement === selectedElement);
			if(isFocused){
				console.log("ENTERED OPENWATCHNOWWINDOW");
				openWatchNowWindow();
			} else if(providerWindowIsVisible){
				selectedElement = document.getElementById("cancel-button");
				isFocused = (document.activeElement === selectedElement);
				if(isFocused){
					console.log("CLOSING WATCH NOW WINDOW");
					closeWatchNowWindow();
				} else {
					queryString = "?para1=" + mediaId;
					queryString += "&para2=" + utterance;
					window.location.href = "player.html" + queryString;
				}
			}
	        break;
		case 19: // Pause
			
			break;
		case 37: // Left 
			if(providerWindowIsVisible){
				selectedElement = document.getElementById("cancel-button");
				isFocused = (document.activeElement === selectedElement);
				if(!isFocused){
					navLeft();
				}
			}
			break;
		case 38: // Up 
			if(providerWindowIsVisible){
				selectedElement = document.getElementById("cancel-button");
				isFocused = (document.activeElement === selectedElement);
				if(isFocused){
					document.getElementsByClassName("provider")[focusIndex].focus();
				}	
			}
			break;
		case 39: // Right
			if(providerWindowIsVisible){
				selectedElement = document.getElementById("cancel-button");
				isFocused = (document.activeElement === selectedElement);
				if(!isFocused){
					navRight();
				}
			}
			break;
		case 40: // Down
			if(providerWindowIsVisible){
				selectedElement = document.getElementById("cancel-button");
				isFocused = (document.activeElement === selectedElement);	
				if(!isFocused){
					selectedElement.focus();
				}
			}
			break;
		case 71: // Play
			
			break;	
		case 119: // Volume Mute
			
			break;
		case 120: // Volume Down
		
			break;
		case 121: // Volume Up
			
			break;
		case 412: // Backward
			
			break;
		case 413: // Stop
			
			break;
		case 415: // Play
			
			break;
		case 417: // Fast Forward
			
			break;
		case 405: // YELLOW C
			console.log("TOGGLE TOAST MESSAGE");
			toggleToastMessage();
			break;
		case 65376: // Done
			
			break;	
	    case 65385: // Cancel
	    	
	    	break;
	    case 10009: // RETURN button
	    	queryString = "?para1=" + utterance;
	    	window.location.href = "index.html" + queryString;
	    	break;	
	    case 10232: // Previous
	
	    	break;
	    case 10233: // Next 

	    	break; 
	    case 10252:
	    	
	    	break;
	    case 10182: // EXIT
	    	event.preventDefault();
	    	if(confirm(LANG_JSON_DATA['exit-confirm'])){
	    		window.tizen.application.getCurrentApplication().exit();
	    	}
	    	break;
	    case "XF86Exit": // EXIT
	    	event.preventDefault();
	    	if(confirm(LANG_JSON_DATA['exit-confirm'])){
	    		window.tizen.application.getCurrentApplication().exit();
	    	}
	    	break;
	    default: console.log("Unhandled keycode: " + event.keyCode);
	}
});
// Toggle ON or OFF the toast messages
function toggleToastMessage(){
	if(toastMessageIsOn){
		document.getElementById("desc").innerHTML = "<p>Toast messages: OFF</p>";
		toastMessageIsOn = false;
	} else {
		document.getElementById("desc").innerHTML = "<p>Toast messages: ON</p>";
		toastMessageIsOn = true;
	}
	localStorage.setItem("vToastMessageIsOn", toastMessageIsOn);
	var toastElement = document.getElementById("toast");
    if(toastElement.classList.contains("show")){
    	toastElement.className.replace("show", "");
    	void toastElement.offsetWidth;
    	clearTimeout(setTimer);
    	toastElement.className = "show";
    	setTimer = setTimeout(function(){ toastElement.className = toastElement.className.replace("show", ""); }, 5000);
    } else {
    	toastElement.className = "show";
    	setTimer = setTimeout(function(){ toastElement.className = toastElement.className.replace("show", ""); }, 5000);
    }
}
// Hide and display toast message when using search via voice
function launch_toast(){
	if(toastMessageIsOn){
		var toastElement = document.getElementById("toast");
	    if(toastElement.classList.contains("show")){
	    	toastElement.className.replace("show", "");
	    	void toastElement.offsetWidth;
	    	clearTimeout(setTimer);
	    	toastElement.className = "show";
	    	setTimer = setTimeout(function(){ toastElement.className = toastElement.className.replace("show", ""); }, 5000);
	    } else {
	    	toastElement.className = "show";
	    	setTimer = setTimeout(function(){ toastElement.className = toastElement.className.replace("show", ""); }, 5000);
	    }	
	}
}
// Initialize script
window.onload = init;