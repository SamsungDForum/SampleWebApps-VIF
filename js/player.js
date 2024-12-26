/******************** GLOBAL VARIABLES ********************/
// Video player
var player;
// Current play time of video
var timeElapsed = document.getElementById('time-elapsed');
// Total play time of video
var duration = document.getElementById('duration');
// List of video links that will stream on the media player
var vid = ["videos/video1.mp4", "videos/video2.mp4", "videos/video3.mp4"];
// Position index of current player control button
var controlIndex = 0;
// Position index of current selected playlist video
var playIndex = 0;
// Index of currently playing video from the playlist
var currentlyPlaying = 0;
// Flag to check if the cursor is focused on the media controls
var cursorOnControls = false;
// Flag to check if the video is being rewinded
var rewinding = false;
// Flag to check if the video is being fast forwarded
var fforwarding = false;
// Size of playlist
const sizeOfPlaylist = 3;
// Number of control buttons in the media player
const sizeOfControls = 6;
// Flag for showing rewind tooltip
var showRewindTooltip = true;
// Flag for showing fastforward tooltip
var showFFTooltip = true;
// SetTimeout for the rewind tooltip
var rewindTooltipTimer;
// SetTimeout for the fast forward tooltip
var ffTooltipTimer;
// Variable used for the toast appearance
var setTimer;
// Media utterance that comes from details.html
var utterance;
// Media id that comes from details.html
var mediaId;
// Flag that toggles the toast messages ON and OFF
var toastMessageIsOn;

/******************** FUNCTIONS ********************/
// Register remote control keys in order for the application to react accordingly
function registerKeys() {
  var usedKeys = [
    "Exit",
    "MediaPause",
    "MediaPlay",
    "MediaPlayPause",
    "MediaFastForward",
    "MediaRewind",
    "MediaStop",
    "MediaTrackNext",
    "MediaTrackPrevious",
    "ColorF0Red",
    "ColorF1Green",
    "ColorF2Yellow",
    "ColorF3Blue"
  ];
  usedKeys.forEach(
    function (keyName) {
      try {
        tizen.tvinputdevice.registerKey(keyName);
      } catch (error) {
        console.log("Failed to register " + keyName + ": " + error);
      }
    }
  );
}
// Initialize player
function startplayer() {
  player = document.getElementById("video_player");
  player.controls = false;
  player.addEventListener('timeupdate', updateTimeElapsed);
  saveMediaInfo();
  console.log("PLAYER HAS STARTED");
}
// Save the media info for when the RETURN action is used
function saveMediaInfo() {
  var queryString = decodeURIComponent(window.location.search);
  console.log(queryString);
  var parameters = queryString.split("&");
  utterance = parameters[1].slice(6);
  console.log(utterance);
  mediaId = parameters[0].substring(7);
}
// Update the current video time that has elapsed
function updateTimeElapsed() {
  const time = formatTime(Math.round(player.currentTime));
  timeElapsed.innerHTML = time.minutes + ":" + time.seconds;
  timeElapsed.setAttribute('datetime', time.minutes + "m " + time.seconds + "s");
}
// Play or pause the current video
function playPause_vid() {
  console.log("VIDEO IS PAUSED: " + player.paused);
  rewinding = false;
  fforwarding = false;
  if (player.paused) {
    if (cursorOnControls) {
      if (controlIndex === 3) {
        playPauseB.src = "images/pause_selected.png";
      } else {
        playPauseB.src = "images/pause.png";
      }
    } else {
      playPauseB.src = "images/pause.png";
    }
    player.playbackRate = 1.0;
    player.play();
    console.log("PLAYING");
  } else {
    if (cursorOnControls && controlIndex === 3) {
      playPauseB.src = "images/play_selected.png";
    } else {
      playPauseB.src = "images/play.png";
    }
    player.pause();
    console.log("PAUSED");
  }
  const videoDuration = Math.round(player.duration);
  const time = formatTime(videoDuration);
  var minutes = String(time.minutes);
  var seconds = String(time.seconds);
  duration.innerHTML = minutes + ":" + seconds;
  duration.setAttribute('datetime', minutes + "m " + seconds + "s");
}
// Stop the video
function stop_vid() {
  rewinding = false;
  fforwarding = false;
  player.pause();
  player.currentTime = 0;
  playPauseB.src = "images/play.png";
  console.log("PLAYER STOPPED");
}
// Load and play the previous video on the playlist, if the current video is the first one on the playlist, it will reload and replay
function previous_vid() {
  rewinding = false;
  fforwarding = false;
  if (currentlyPlaying - 1 < 0) {
    currentlyPlaying = 0;
    playIndex = 0;
    player.src = vid[0];
  } else {
    currentlyPlaying--;
    playIndex = currentlyPlaying;
    player.src = vid[playIndex];
  }
  player.onloadedmetadata = function () {
    console.log('metadata loaded!');
    console.log(player.duration);
    playPauseB.src = "images/play_selected.png";
    playPause_vid();
  };
  console.log("PREVIOUS VIDEO LOADED");
}
// Load and play the next video on the playlist, if the video is the last one on the playlist, it will reload and replay
function next_vid() {
  rewinding = false;
  fforwarding = false;
  if (currentlyPlaying + 1 >= sizeOfPlaylist) {
    currentlyPlaying = sizeOfPlaylist - 1;
    playIndex = currentlyPlaying;
    player.src = vid[sizeOfPlaylist - 1];
  } else {
    currentlyPlaying++;
    playIndex = currentlyPlaying;
    player.src = vid[playIndex];
  }
  player.onloadedmetadata = function () {
    console.log('metadata loaded!');
    console.log(player.duration);
    playPauseB.src = "images/play_selected.png";
    playPause_vid();
  };
  console.log("NEXT VIDEO LOADED");
}
// Video will rewind n seconds, if the current play time is less than n seconds, the video will start from the beginning
function skipBackward(offsetSeconds) {
  rewinding = false;
  fforwarding = false;
  if (offsetSeconds === undefined) {
    if (player.currentTime < 10) {
      player.currentTime = 0;
    } else {
      player.currentTime -= 10;
    }
  } else {
    if (player.currentTime < offsetSeconds) {
      player.currentTime = 0;
    } else {
      player.currentTime -= offsetSeconds;
    }
  }
  console.log("SKIPPED BACKWARDS");
}
// Video will fastforward n seconds, if the current play time is less than n until total play time, the video will stop playing
function skipForward(offsetSeconds) {
  rewinding = false;
  fforwarding = false;
  if (offsetSeconds === undefined) {
    if (player.currentTime > (player.duration - 10)) {
      stop_vid();
    } else {
      player.currentTime += 10;
    }
  } else {
    if (player.currentTime > (player.duration - offsetSeconds)) {
      stop_vid();
    } else {
      player.currentTime += offsetSeconds;
    }
  }
  console.log("SKIPPED FORWARD");
}
// Set the absolute play position in seconds
function setPlayPosition(position) {
  if (position === undefined) {
    document.getElementById("desc").innerHTML = "<p>Undefined play position.</p>";
    launch_toast();
  } else {
    player.currentTime = position;
    document.getElementById("desc").innerHTML = "<p>Setting play position to " + position + " seconds</p>";
    launch_toast();
  }
}
// The current video will play from the beginning
function reload_vid() {
  console.log("RELOAD FUNCTION CALLED");
  rewinding = false;
  fforwarding = false;
  player.currentTime = 0;
}
// Initializer for the playlist
function initializePlaylist() {
  playIndex = 0;
  console.log("PLAYLIST INITIALIZED");
}
// Update visual cursor when the user presses a navigation button on the remote control while focused on the media control buttons
function controlsCursorChange() {
  console.log(controlIndex);
  for (var i = 0; i < sizeOfControls; i++) {
    if (i === 1) { i = i + 1; }
    switch (document.getElementById("control" + String(i)).getAttribute("src")) {
      case "images/play_selected.png": document.getElementById("control" + String(i)).src = "images/play.png"; break;
      case "images/pause_selected.png": document.getElementById("control" + String(i)).src = "images/pause.png"; break;
      case "images/previous_selected.png": document.getElementById("control" + String(i)).src = "images/previous.png"; break;
      case "images/skipbackward_selected.png": document.getElementById("control" + String(i)).src = "images/skipbackward.png"; break;
      case "images/skipforward_selected.png": document.getElementById("control" + String(i)).src = "images/skipforward.png"; break;
      case "images/next_selected.png": document.getElementById("control" + String(i)).src = "images/next.png"; break;
      default: break;
    }
  }
  switch (controlIndex) {
    case 0: document.getElementById("control" + String(controlIndex)).src = "images/previous_selected.png"; break;
    case 2: document.getElementById("control" + String(controlIndex)).src = "images/skipbackward_selected.png";
      if (!showRewindTooltip) { clearTimeout(rewindTooltipTimer); var x = document.getElementById("rewindTooltip"); x.className = x.className.replace("showRewind", ""); x.style.display = "none"; x.style.visibility = "hidden"; showRewindTooltip = true; }
      break;
    case 3: if (document.getElementById("control" + String(controlIndex)).getAttribute("src") === "images/play.png") {
      document.getElementById("control" + String(controlIndex)).src = "images/play_selected.png";
    } else {
      document.getElementById("control" + String(controlIndex)).src = "images/pause_selected.png";
    } break;
    case 4: document.getElementById("control" + String(controlIndex)).src = "images/skipforward_selected.png";
      if (!showFFTooltip) { clearTimeout(ffTooltipTimer); var v = document.getElementById("ffTooltip"); v.className = v.className.replace("showFF", ""); v.style.display = "none"; v.style.visibility = "hidden"; showFFTooltip = true; }
      break;
    case 5: document.getElementById("control" + String(controlIndex)).src = "images/next_selected.png"; break;
  }
}
// Behavior for when the user selects a video from the playlist
function videoSelected() {
  player.src = vid[playIndex];
  currentlyPlaying = playIndex;
  player.onloadedmetadata = function () {
    console.log('metadata loaded!');
    console.log(player.duration);
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
function clearPlaylistBorders() {
  controlIndex = 3;
  if (player.paused) {
    document.getElementById("control" + String(controlIndex)).src = "images/play_selected.png";
  } else {
    document.getElementById("control" + String(controlIndex)).src = "images/pause_selected.png";
  }
}
// Update the visual appearance of the control buttons
function clearControlBorders() {
  for (var i = 0; i < sizeOfControls; i++) {
    switch (document.getElementById("control" + String(i)).getAttribute("src")) {
      case "images/play_selected.png": document.getElementById("control" + String(i)).src = "images/play.png"; break;
      case "images/pause_selected.png": document.getElementById("control" + String(i)).src = "images/pause.png"; break;
      case "images/previous_selected.png": document.getElementById("control" + String(i)).src = "images/previous.png"; break;
      case "images/skipbackward_selected.png": document.getElementById("control" + String(i)).src = "images/skipbackward.png"; break;
      case "images/skipforward_selected.png": document.getElementById("control" + String(i)).src = "images/skipforward.png"; break;
      case "images/next_selected.png": document.getElementById("control" + String(i)).src = "images/next.png"; break;
    }
  }
}
// Handle the player behavior based on the control button that has been clicked
function controlClicked() {
  switch (controlIndex) {
    case 0: previous_vid(); break;
    case 2: skipBackward(); break;
    case 3: if (playPauseB.src.substr(playPauseB.src.length - 24) === "images/play_selected.png") {
      playPauseB.src = "images/play_selected.png"; playPause_vid();
    } else {
      playPause_vid();
    }
      break;
    case 4: skipForward(); break;
    case 5: next_vid(); break;
  }
}
// Initialize voice web api
function voiceInteractionInit() {
  console.log("ENTERED voiceInteractionInit FUNCTION");
  var version = "0.0.0";
  try {
    version = webapis.voiceinteraction.getVersion();
  }
  catch (e) {
    console.log("exception [" + e.code + "] name: " + e.name + " message: " + e.message);
  }
  try {
    webapis.voiceinteraction.setCallback(
      {
        onupdatestate: function () {
          console.log("AppState Called");
          // "None" - Application Default Status - None
          // "List" - The status of application showing something in list - Voice Navigation, Selection
          // "Player" - The status of application playing a content - Voice Media Control
          return "Player";
        },
        onchangeappstate: function (state) {
          console.log("onchangeappstate : " + state);
          var bSupport = true;
          switch (state) {
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
        onnavigation: function (vn) {
          var bSupport = true;
          console.log("OnNavigation [" + vn + "]");
          switch (vn) {
            case "NAV_PREVIOUS":
              console.log("NAV_PREVIOUS CALLED");
              document.getElementById("desc").innerHTML = "<p>Previous</p>";
              launch_toast();
              previous_vid();
              break;
            case "NAV_NEXT":
              console.log("NAV_NEXT CALLED");
              document.getElementById("desc").innerHTML = "<p>Next</p>";
              launch_toast();
              next_vid();
              break;
            case "NAV_LEFT":
              console.log("NAV_LEFT CALLED");
              document.getElementById("desc").innerHTML = "<p>Move Left</p>";
              launch_toast();
              if (cursorOnControls) {
                if (controlIndex - 1 < 0) {
                  controlIndex = sizeOfControls - 1;
                } else {
                  controlIndex--;
                }
                controlsCursorChange();
              } else {
                if (playIndex - 1 < 0) {
                  playIndex = sizeOfPlaylist - 1;
                } else {
                  playIndex--;
                }
              }
              break;
            case "NAV_RIGHT":
              console.log("NAV_RIGHT CALLED");
              document.getElementById("desc").innerHTML = "<p>Move Right</p>";
              launch_toast();
              if (cursorOnControls) {
                if (controlIndex + 1 >= sizeOfControls) {
                  controlIndex = 0;
                } else {
                  controlIndex++;
                }
                controlsCursorChange();
              } else {
                if (playIndex + 1 >= sizeOfPlaylist) {
                  playIndex = 0;
                } else {
                  playIndex++;
                }
              }
              break;
            case "NAV_UP":
              console.log("NAV_UP CALLED");
              document.getElementById("desc").innerHTML = "<p>Move Up</p>";
              launch_toast();
              if (!cursorOnControls) {
                cursorOnControls = true;
                clearPlaylistBorders();
              }
              break;
            case "NAV_DOWN":
              console.log("NAV_DOWN CALLED");
              document.getElementById("desc").innerHTML = "<p>Move Down</p>";
              launch_toast();
              cursorOnControls = false;
              clearControlBorders();
              break;
            case "NAV_SHOW_MORE":
              document.getElementById("desc").innerHTML = "<p>This function is unavailable on this page.</p>";
              launch_toast();
              break;
            default:
              console.log("DEFAULT CALLED");
              document.getElementById("desc").innerHTML = "<p>DEFAULT CALLED</p>";
              launch_toast();
              bSupport = false;
              break;
          }
          return bSupport;
        },
        onchangeprevioustrack: function () {
          console.log("OnChangePreviousTrack");
          document.getElementById("desc").innerHTML = "<p>Previous Video</p>";
          launch_toast();
          previous_vid();
          return true;
        },
        onchangenexttrack: function () {
          console.log("OnChangeNextTrack");
          document.getElementById("desc").innerHTML = "<p>Next Video</p>";
          launch_toast();
          next_vid();
          return true;
        },
        onrestart: function () { // "Restart"
          console.log("onrestart FUNCTION CALLED");
          document.getElementById("desc").innerHTML = "<p>Restart</p>";
          launch_toast();
          reload_vid();
          return true;
        },
        onplay: function () { // "Play"
          console.log("onplay FUNCTION CALLED");
          document.getElementById("desc").innerHTML = "<p>Play</p>";
          launch_toast();
          playPause_vid();
          return true;
        },
        onstop: function () { // "Stop"
          console.log("onstop FUNCTION CALLED");
          document.getElementById("desc").innerHTML = "<p>Stop</p>";
          launch_toast();
          stop_vid();
          return true;
        },
        onchangesubtitlemode: function (mode) {
          console.log("OnChangeSubtitleMode");
          switch (mode) {
            case "MEDIA_FUNCTION_ON":
              console.log("Function ON");
              document.getElementById("desc").innerHTML = "<p>Subtitles are now ON</p>";
              launch_toast();
              break;
            default:
              console.log("Function OFF");
              document.getElementById("desc").innerHTML = "<p>Subtitles are now OFF</p>";
              launch_toast();
              break;
          }
          return true;
        },
        onsetplayposition: function (position) {
          console.log("OnSetPlayPosition : " + position);
          setPlayPosition(position);
          return true;
        },
        onfastforward: function () {
          // TV Default Action: Generates the Remote Control Key, "MediaFastForward".
          console.log("onfastforward called");
          document.getElementById("desc").innerHTML = "<p>Fastforward</p>";
          launch_toast();
          skipForward();
          return true;
        },
        onrewind: function () {
          // TV Default Action: Generates the Remote Control Key, "MediaRewind".
          console.log("onrewind called");
          document.getElementById("desc").innerHTML = "<p>Rewind</p>";
          launch_toast();
          skipBackward();
          return true;
        },
        onskipforward: function (offsetSeconds) { // "Skip forward"
          console.log("onskipforward FUNCTION CALLED");
          document.getElementById("desc").innerHTML = "<p>Skip forward by " + offsetSeconds + " seconds</p>";
          launch_toast();
          skipForward(offsetSeconds);
          return true;
        },
        onskipbackward: function (offsetSeconds) { // "Skip backward"
          console.log("onskipbackward FUNCTION CALLED");
          document.getElementById("desc").innerHTML = "<p>Skip backwards by " + offsetSeconds + " seconds</p>";
          launch_toast();
          skipBackward(offsetSeconds);
          return true;
        },
        onpause: function () { // "Pause"
          console.log("onpause FUNCTION CALLED");
          document.getElementById("desc").innerHTML = "<p>Pause</p>";
          launch_toast();
          player.pause();
          return true;
        },
        onchangeshufflemode: function (mode) {
          console.log("onchangeshufflemode");
          switch (mode) {
            case "MEDIA_FUNCTION_ON":
              console.log("Shuffle Mode ON");
              document.getElementById("desc").innerHTML = "<p>Shuffle Mode ON</p>";
              launch_toast();
              break;
            default:
              console.log("Shuffle Mode OFF");
              document.getElementById("desc").innerHTML = "<p>Shuffle Mode OFF</p>";
              launch_toast();
              break;
          }
          return true;
        },
        onchangescreenfitmode: function (mode) {
          console.log("OnChangeScreenFitMode");
          switch (mode) {
            case "MEDIA_FUNCTION_ON":
              console.log("Screen Fit Mode ON");
              document.getElementById("desc").innerHTML = "<p>Screen Fit Mode ON</p>";
              launch_toast();
              break;
            default:
              console.log("Screen Fit Mode OFF");
              document.getElementById("desc").innerHTML = "<p>Screen Fit Mode OFF</p>";
              launch_toast();
              break;
          }
          return true;
        },
        onzoom: function (zoom) {
          console.log("OnZoom");
          switch (zoom) {
            case "MEDIA_ZOOM_IN":
              console.log("Zoom IN");
              document.getElementById("desc").innerHTML = "<p>Zoom IN</p>";
              launch_toast();
              break;
            default:
              console.log("Zoom OUT");
              document.getElementById("desc").innerHTML = "<p>Zoom OUT</p>";
              launch_toast();
              break;
          }
          return true;
        },
        onrotate: function (direction) {
          console.log("OnRotate");
          switch (direction) {
            case "MEDIA_ROTATE_LEFT":
              console.log("Rotate Left");
              document.getElementById("desc").innerHTML = "<p>Rotate Left</p>";
              launch_toast();
              break;
            default:
              console.log("Rotate Right");
              document.getElementById("desc").innerHTML = "<p>Rotate Right</p>";
              launch_toast();
              break;
          }
          return true;
        },
        onchange360mode: function (mode) {
          console.log("OnChange360Mode");
          switch (mode) {
            case "MEDIA_FUNCTION_ON":
              console.log("360 Mode ON");
              document.getElementById("desc").innerHTML = "<p>360 Mode ON</p>";
              launch_toast();
              break;
            default:
              console.log("360 Mode OFF");
              document.getElementById("desc").innerHTML = "<p>360 Mode OFF</p>";
              launch_toast();
              break;
          }
          return true;
        },
        onchangerepeatmode: function (mode) {
          console.log("OnChangeRepeatMode");
          switch (mode) {
            case "MEDIA_REPEAT_ONE":
              console.log("MEDIA REPEAT ONE");
              document.getElementById("desc").innerHTML = "<p>Media Repeat ONE</p>";
              launch_toast();
              break;
            case "MEDIA_REPEAT_ALL":
              console.log("MEDIA REPEAT ALL");
              document.getElementById("desc").innerHTML = "<p>Media Repeat ALL</p>";
              launch_toast();
              break;
            default:
              console.log("MEDIA REPEAT OFF");
              document.getElementById("desc").innerHTML = "<p>Media Repeat OFF</p>";
              launch_toast();
              break;
          }
          return true;
        },
        onadditiontolist: function (list) {
          console.log("ON ADDITION TO LIST: " + list);
          if (String(list) === "LIST_PREFERENCE") {
            document.getElementById("desc").innerHTML = "<p><strong>ACTION:</strong> onadditiontolist<br><strong>PARAMETERS:</strong> " + list + " LIKE</p>";
          } else {
            document.getElementById("desc").innerHTML = "<p><strong>ACTION:</strong> onadditiontolist<br><strong>PARAMETERS:</strong> " + list + "</p>";
          }
          launch_toast();
          return true;
        },
        onremovalfromlist: function (list) {
          console.log("ON REMOVAL FROM LIST: " + list);
          if (String(list) === "LIST_PREFERENCE") {
            document.getElementById("desc").innerHTML = "<p><strong>ACTION:</strong> onremovalfromlist<br><strong>PARAMETERS:</strong> " + list + " DISLIKE</p>";
          } else {
            document.getElementById("desc").innerHTML = "<p><strong>ACTION:</strong> onremovalfromlist<br><strong>PARAMETERS:</strong> " + list + "</p>";
          }
          launch_toast();
          return true;
        },
        onplaylist: function (list) {
          console.log("ON PLAY LIST: " + list);
          document.getElementById("desc").innerHTML = "<p><strong>ACTION:</strong> onplaylist<br><strong>PARAMETERS:</strong> " + list + "</p>";
          launch_toast();
          return true;
        },
        onbrowselist: function (list) {
          console.log("ON BROWSE LIST: " + list);
          document.getElementById("desc").innerHTML = "<p><strong>ACTION:</strong> onbrowselist<br><strong>PARAMETERS:</strong> " + list + "</p>";
          launch_toast();
          return true;
        }
      });
  } catch (err) {
    console.log("TRY CATCH FOR CALLBACKS: " + err.message);
    document.getElementById("desc").innerHTML = "<p>" + err.message + "</p>";
    launch_toast();
  }
  try {
    webapis.voiceinteraction.listen();
    console.log("LISTEN FUNCTION CALLED");
  } catch (err) {
    console.log("TRY CATCH FOR LISTEN FUNCTION: " + err.message);
    document.getElementById("desc").innerHTML = "<p>" + err.message + "</p>";
    launch_toast();
  }
}
// Initialize function
var init = function () {
  if (localStorage.getItem("vToastMessageIsOn") === null) {
    toastMessageIsOn = true;
  } else {
    if (localStorage.getItem("vToastMessageIsOn") === "false") {
      toastMessageIsOn = false;
    } else {
      toastMessageIsOn = true;
    }
  }
  console.log('init() called');
  voiceInteractionInit();
  initializePlaylist();
  registerKeys();
  startplayer();
  registerEventListeners();
};
// Initialize event listeners for clickable elements
function registerEventListeners() {
  document.getElementById("control0").addEventListener("click", previous_vid);
  document.getElementById("control2").addEventListener("click", function () { skipBackward(10); });
  document.getElementById("control3").addEventListener("click", playPause_vid);
  document.getElementById("control4").addEventListener("click", function () { skipForward(10); });
  document.getElementById("control5").addEventListener("click", next_vid);
}
// Add button listeners
var playPauseB = document.getElementById("control3");
document.body.addEventListener('keydown', function (event) {
  console.log("KEYCODE: " + event.keyCode);
  switch (event.keyCode) {
    case 13: // Enter
      console.log("ENTER PRESSED");
      if (cursorOnControls) {
        controlClicked();
      } else {
        videoSelected();
      }
      break;
    case 19: // Pause
      playPause_vid();
      break;
    case 37: // Left
      if (cursorOnControls) {
        if (controlIndex - 1 < 0) {
          controlIndex = sizeOfControls - 1;
        } else {
          controlIndex--;
        }
        if (controlIndex === 1) { controlIndex = controlIndex - 1; }
      } else {
        playIndex = 1;
        cursorOnControls = true;
      }
      controlsCursorChange();
      break;
    case 38: // Up
      playIndex = 1;
      cursorOnControls = true;
      controlsCursorChange();
      break;
    case 39: // Right
      if (cursorOnControls) {
        if (controlIndex + 1 >= sizeOfControls) {
          controlIndex = 0;
        } else {
          controlIndex++;
        }
        if (controlIndex === 1) { controlIndex = controlIndex + 1; }
      } else {
        playIndex = 1;
        cursorOnControls = true;
      }
      controlsCursorChange();
      break;
    case 40: // Down
      playIndex = 1;
      cursorOnControls = true;
      controlsCursorChange();
      break;
    case 415: // MediaPlay
      document.getElementById("desc").innerHTML = "<p>MediaPlay keycode FUNCTION CALLED</p>";
      launch_toast();
      playPause_vid();
      break;
    case 71: // Play
      document.getElementById("desc").innerHTML = "<p>KeyCode 71 PLAY FUNCTION CALLED</p>";
      launch_toast();
      playPause_vid();
      break;
    case 119: // Volume Mute
      break;
    case 120: // Volume Down
      break;
    case 121: // Volume Up
      break;
    case 403: // RED A
      break;
    case 404: // GREEN B
      break;
    case 405: // YELLOW C
      console.log("TOGGLE TOAST MESSAGE");
      toggleToastMessage();
      break;
    case 412: // Backward
      skipBackward();
      break;
    case 413: // Stop
      stop_vid();
      break;
    case 415: // MediaPlay
      document.getElementById("desc").innerHTML = "<p>KeyCode 415 PLAY FUNCTION CALLED</p>";
      launch_toast();
      break;
    case 417: // Fast Forward
      skipForward();
      break;
    case 65376: // Done
      break;
    case 65385: // Cancel
      break;
    case 10009: // RETURN button
      var queryString = "?para1=" + mediaId;
      queryString += "&para2=" + utterance;
      window.location.href = "details.html" + queryString;
      break;
    case 10232: // MediaTrackPrevious
      previous_vid();
      break;
    case 10233: // MediaTrackNext
      next_vid();
      break;
    case 10252: // Media PlayPause
      document.getElementById("desc").innerHTML = "<p>KeyCode 10252 PLAYPAUSE FUNCTION CALLED</p>";
      launch_toast();
      break;
    case 10182: // EXIT
      event.preventDefault();
      if (confirm("Exit Application?")) {
        window.tizen.application.getCurrentApplication().exit();
      }
      break;
    case "XF86Exit": // EXIT
      event.preventDefault();
      if (confirm(LANG_JSON_DATA.exit - confirm)) {
        window.tizen.application.getCurrentApplication().exit();
      }
      break;
    default: console.log("Unhandled keycode: " + event.keyCode);
  }
});
// Toggle ON or OFF the toast messages
function toggleToastMessage() {
  if (toastMessageIsOn) {
    document.getElementById("desc").innerHTML = "<p>Toast messages: OFF</p>";
    toastMessageIsOn = false;
  } else {
    document.getElementById("desc").innerHTML = "<p>Toast messages: ON</p>";
    toastMessageIsOn = true;
  }
  localStorage.setItem("vToastMessageIsOn", toastMessageIsOn);
  var toastElement = document.getElementById("toast");
  if (toastElement.classList.contains("show")) {
    toastElement.className.replace("show", "");
    void toastElement.offsetWidth;
    clearTimeout(setTimer);
  }
  toastElement.className = "show";
  setTimer = setTimeout(function () { toastElement.className = toastElement.className.replace("show", ""); }, 5000);
}
// Hide and display toast message when using search via voice
function launch_toast() {
  if (toastMessageIsOn) {
    var toastElement = document.getElementById("toast");
    if (toastElement.classList.contains("show")) {
      toastElement.className.replace("show", "");
      void toastElement.offsetWidth;
      clearTimeout(setTimer);
    }
    toastElement.className = "show";
    setTimer = setTimeout(function () { toastElement.className = toastElement.className.replace("show", ""); }, 5000);
  }
}
// Initialize script
window.onload = init;
