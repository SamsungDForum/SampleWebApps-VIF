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
// Pending moves to the right/left inside the queue
var pendingMove = 0;
// SetInterval variable used for onnavigation voice commands
var navigationInterval = false;
// SetTimeout variable used for onnavigation voice commands
var navigationSetTimeout = false;
// String taken from URI component
var queryString;
// Media id take from index.html
var mediaId;
// Flag that toggles the toast messages ON and OFF
var toastMessageIsOn;
// ***
var apps = [];
// Index used to indicate the vertical position of the focus
var rowIndex = 0;
// Variable to print results
var toPrint;
// Saves the objects obtained from the getMovie function
var result = [];
// Variable used to save the More Content index when the provider window is opened
var moreContentIndex = 0;

/******************** FUNCTIONS ********************/
// Register remote control keys in order for the application to react accordingly
function registerKeys() {
  var usedKeys = [
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
// Initialize voice web api
function voiceInteractionInit() {
  console.log("ENTERED voiceInteractionInit FUNCTION");
  try {
    webapis.voiceinteraction.setCallback(
      {
        onupdatestate: function () {
          console.log("AppState Called");
          // "None" - Application Default Status - None
          // "List" - The status of application showing something in list - Voice Navigation, Selection
          // "Player" - The status of application playing a content - Voice Media Control
          return "List";
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
        onnavigation: function (voiceNavigation) {
          var bSupport = true;
          console.log("onnavigation: " + voiceNavigation);
          switch (voiceNavigation) {
            case "NAV_PREVIOUS":
              console.log("NAV_PREVIOUS CALLED");
              if (providerWindowIsVisible) {
                selectedElement = document.getElementById("cancel-button");
                isFocused = (document.activeElement === selectedElement);
                if (!isFocused) {
                  navLeft();
                }
              } else {
                scrollLeft();
              }
              break;
            case "NAV_NEXT":
              console.log("NAV_NEXT CALLED");
              launch_toast();
              if (providerWindowIsVisible) {
                selectedElement = document.getElementById("cancel-button");
                isFocused = (document.activeElement === selectedElement);
                if (!isFocused) {
                  navRight();
                }
              } else {
                scrollRight();
              }
              break;
            case "NAV_LEFT":
              if (providerWindowIsVisible) {
                selectedElement = document.getElementById("cancel-button");
                isFocused = (document.activeElement === selectedElement);
                if (!isFocused) {
                  navLeft();
                }
              } else {
                navLeft();
              }
              break;
            case "NAV_RIGHT":
              console.log("NAV_RIGHT CALLED");
              if (providerWindowIsVisible) {
                selectedElement = document.getElementById("cancel-button");
                isFocused = (document.activeElement === selectedElement);
                if (!isFocused) {
                  navRight();
                }
              } else {
                navRight();
              }
              break;
            case "NAV_UP":
              if (providerWindowIsVisible) {
                selectedElement = document.getElementById("cancel-button");
                isFocused = (document.activeElement === selectedElement);
                if (isFocused) {
                  document.getElementsByClassName("provider")[focusIndex].focus();
                }
              } else {
                scrollUp();
              }
              break;
            case "NAV_DOWN":
              if (providerWindowIsVisible) {
                selectedElement = document.getElementById("cancel-button");
                isFocused = (document.activeElement === selectedElement);
                if (!isFocused) {
                  selectedElement.focus();
                }
              } else {
                scrollDown();
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
        onselection: function (voiceSelection) {
          var bSupport = true;
          console.log("onselection : " + voiceSelection);
          switch (voiceSelection) {
            case -1:
              if (providerWindowIsVisible) {
                queryString = "?para1=" + mediaId;
                queryString += "&para2=" + utterance;
                window.location.href = "player.html" + queryString;
              } else {
                videoClicked(result[result.length - 1].id);
              }
              break;
            case 0:
              var selectedElement = document.getElementById("watch-button");
              var isFocused = (document.activeElement === selectedElement);
              if (isFocused) {
                console.log("ENTERED OPENWATCHNOWWINDOW");
                openWatchNowWindow();
              } else if (providerWindowIsVisible) {
                selectedElement = document.getElementById("cancel-button");
                isFocused = (document.activeElement === selectedElement);
                if (isFocused) {
                  console.log("CLOSING WATCH NOW WINDOW");
                  closeWatchNowWindow();
                } else {
                  console.log("TOAST");
                  queryString = "?para1=" + mediaId;
                  queryString += "&para2=" + utterance;
                  window.location.href = "player.html" + queryString;
                }
              } else if (!providerWindowIsVisible) {
                if (result.length > 0) {
                  videoClicked(result[focusIndex].id);
                }
              }
              break;
            case 1:
              if (result.length > 0) {
                videoClicked(result[focusIndex].id);
              }
              break;
            default:
              {
                console.log("CALLING DEFAULT CASE");
                if (providerWindowIsVisible) {
                  if (voiceSelection >= 1) {
                    // Select the (voiceSelection)th item
                    // index of the first item is 1
                    queryString = "?para1=" + mediaId;
                    queryString += "&para2=" + utterance;
                    window.location.href = "player.html" + queryString;
                  } else {
                    bSupport = false;
                  }
                } else if (!providerWindowIsVisible) {
                  if (voiceSelection - 1 >= 0 && result.length > 0 && voiceSelection - 1 <= result.length - 1) {
                    videoClicked(result[voiceSelection - 1].id);
                  }
                }
              }
              break;
          }
          return bSupport;
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
// Display the popup window after pressing the watch now button
function openWatchNowWindow() {
  var popupContainer = document.getElementById("popup-container");
  var providers = document.getElementById("providers");
  var toPrint = "";
  var leftPosition = 23;
  moreContentIndex = focusIndex;
  focusIndex = 0;
  for (var i = 0; i < numProviders; i++) {
    toPrint += "<div class='provider' tabindex='0' onclick='openVideoPlayer()'><img class='provider-image' src='js/posters/blankP.jpg' />";
    toPrint += "<h3>Rent from $3.99</h3>";
    toPrint += "<h4>UHD</h4>";
    toPrint += "</div>";
  }
  providers.innerHTML = toPrint;
  for (var j = 1; j < apps.length; j++) {
    document.getElementsByClassName("provider")[j].style.left = leftPosition + "em";
    leftPosition += 22;
  }
  popupContainer.style.visibility = "visible";
  document.getElementsByClassName("provider")[focusIndex].focus();
  providerWindowIsVisible = true;
}
// Opens up the video player page
function openVideoPlayer() {
  queryString = "?para1=" + mediaId;
  queryString += "&para2=" + utterance;
  window.location.href = "player.html" + queryString;
}
// Hide the popup window after pressing the cancel button
function closeWatchNowWindow() {
  console.log("CLOSING WATCH NOW WINDOW");
  var popupContainer = document.getElementById("popup-container");
  var watchNowButton = document.getElementById("watch-button");
  var providers = document.getElementById("providers");
  providers.innerHTML = "";
  popupContainer.style.visibility = "hidden";
  watchNowButton.focus();
  providerWindowIsVisible = false;
  focusIndex = moreContentIndex;
}
// Fill in all the detail information for the element that was selected
function fillInfo() {
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
  for (var i = 0; i < films.length; i++) {
    if (films[i].id === parseInt(mediaId)) {
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
  detailsDiv.innerHTML = "<p>" + films[mediaIndex].year + "&nbsp;  | &nbsp; " + films[mediaIndex].duration + "&nbsp;  | &nbsp; " + films[mediaIndex].rating + "&nbsp;  | &nbsp; " + genreString + "</p>";
  // Insert director and cast
  var infoDiv = document.getElementById("info");
  var castString = films[mediaIndex].cast.join(", ");
  infoDiv.innerHTML = "<p>" + LANG_JSON_DATA.director + ": " + films[mediaIndex].director + "</p><p>" + LANG_JSON_DATA.cast + ": " + castString + "</p>";
  // Insert plot
  var descDiv = document.getElementById("description");
  descDiv.innerHTML = "<p>" + films[mediaIndex].plot + "</p>";
  apps = films[mediaIndex].app;
  document.getElementById("watch-button").style.visibility = "visible";
  document.getElementById("watch-button").focus();

  filterTypeFilms();
  toPrint = buildHTMLresult();
  printFilms();
}
// SetInterval for navRight
function newNavRight() {
  pendingMove -= 1;
  navRight();
  switch (rowIndex) {
    case 0: pendingMove = 0; break;
    case 1: if (focusIndex >= result.length - 1) { pendingMove = 0; } break;
  }
  if (pendingMove <= 0) {
    clearInterval(navigationInterval);
    navigationInterval = false;
    navigationSetTimeout = false;
  }
}
// SetInterval for navLeft
function newNavLeft() {
  pendingMove -= 1;
  navLeft();
  switch (rowIndex) {
    case 0: pendingMove = 0; break;
    case 1: if (focusIndex <= 0) { pendingMove = 0; } break;
  }
  if (pendingMove <= 0) {
    clearInterval(navigationInterval);
    navigationInterval = false;
    navigationSetTimeout = false;
  }
}
// Function for when the user presses the left button while provider window is visible
function navLeft() {
  if (providerWindowIsVisible) {
    if (focusIndex > 0 && buttonEnabled) {
      focusIndex -= 1;
      if (focusIndex > 0 && focusIndex < (apps.length - 2)) {
        pShiftRight();
      } else {
        document.getElementsByClassName("provider")[focusIndex].focus();
      }
    }
  } else {
    switch (rowIndex) {
      case 0: break;
      case 1: if (buttonEnabled) {
        focusIndex -= 1;
        if (focusIndex < 0) {
          focusIndex = 0;
        } else {
          pShiftRight();
        }
        document.getElementsByClassName("card")[focusIndex].focus();
        document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
        window.scrollTo(0, 0);
      } else {
        pendingMove += 1;
        if (navigationSetTimeout === false && navigationInterval === false) {
          navigationSetTimeout = setTimeout(function () {
            navigationInterval = setInterval(newNavLeft, 100);
          }, 1000);
        }
      }
        break;
    }
  }
}
// Function that shifts provider divs one position to the right
function pShiftRight() {
  var card, leftPosition, i;
  if (providerWindowIsVisible) {
    leftPosition = 23;
    var provider = document.getElementsByClassName("provider")[focusIndex];
    buttonEnabled = false;
    provider.style.left = leftPosition + "em";
    provider.focus();

    for (var index = 0; index < (focusIndex - 1); index++) {
      document.getElementsByClassName("provider")[index].style.left = "-21em";
    }
    if ((focusIndex - 1) >= 0) {
      document.getElementsByClassName("provider")[focusIndex - 1].style.left = "1em";
    }
    for (i = (focusIndex + 1); i < apps.length; i++) {
      leftPosition += 22;
      document.getElementsByClassName("provider")[i].style.left = leftPosition + "em";
    }
    setTimerNav = setTimeout(function () { buttonEnabled = true; }, 400);
  } else {
    var rect;
    var leftRect;
    if (rowIndex === 1) {
      rect = document.getElementsByClassName("card")[focusIndex].getBoundingClientRect();
      if (focusIndex === 0 && document.getElementsByClassName("card")[focusIndex].style.left === "88px") {
        return;
      }
      if (rect.left < 200 && focusIndex < (result.length - 2)) {
        if (focusIndex === 1) {
          // If second tile is already positioned correctly, do not shift other tiles
          leftRect = document.getElementsByClassName("card")[focusIndex].getBoundingClientRect();
          if (leftRect.left >= 88) {
            return;
          }
        }
        leftPosition = 88 + 315;
        if (focusIndex <= 0) {
          document.getElementsByClassName("card")[focusIndex].style.left = "88px";
          for (i = (focusIndex + 1); i < result.length; i++) {
            card = document.getElementsByClassName("card")[i];
            card.style.position = "absolute";
            card.style.left = leftPosition + 'px';
            leftPosition += 315;
          }
        } else {
          document.getElementsByClassName("card")[focusIndex - 1].style.left = "88px";
          for (var j = focusIndex; j < result.length; j++) {
            card = document.getElementsByClassName("card")[j];
            card.style.position = "absolute";
            card.style.left = leftPosition + 'px';
            leftPosition += 315;
          }
        }
        buttonEnabled = false;
        setTimer = setTimeout(function () { buttonEnabled = true; }, 400);
      }
    }
  }
}
// Function for when the user presses the right button while provider window is visible
function navRight() {
  if (providerWindowIsVisible) {
    if (focusIndex < apps.length - 1 && buttonEnabled) {
      focusIndex += 1;
      if (focusIndex > 1 && focusIndex < (apps.length - 1)) {
        pShiftLeft();
      } else {
        document.getElementsByClassName("provider")[focusIndex].focus();
      }
    }
  } else {
    switch (rowIndex) {
      case 0: break;
      case 1: if (buttonEnabled) {
        focusIndex += 1;
        if (result.length > 0) {
          if (result.length > 1) {
            if (focusIndex > (result.length - 1)) {
              focusIndex = result.length - 1;
              document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
            } else {
              document.getElementsByClassName("dots")[focusIndex - 1].src = "images/whiteDots.png";
              document.getElementsByClassName("card")[focusIndex].focus();
              document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
              pShiftLeft();
            }
          } else {
            focusIndex = 0;
            document.getElementsByClassName("card")[focusIndex].focus();
            document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
          }
        }
        window.scrollTo(0, 0);
      } else {
        pendingMove += 1;
        if (navigationSetTimeout === false && navigationInterval === false) {
          navigationSetTimeout = setTimeout(function () {
            navigationInterval = setInterval(newNavRight, 100);
          }, 1000);
        }
      }
        break;
    }
  }
}
// Function that shifts provider divs one position to the left
function pShiftLeft() {
  var i, card;
  if (providerWindowIsVisible) {
    var leftPosition = 23;
    var provider = document.getElementsByClassName("provider")[focusIndex];
    buttonEnabled = false;
    provider.style.left = leftPosition + "em";
    provider.focus();
    for (var index = 0; index < (focusIndex - 1); index++) {
      document.getElementsByClassName("provider")[index].style.left = "-21em";
    }
    if ((focusIndex - 1) >= 0) {
      document.getElementsByClassName("provider")[focusIndex - 1].style.left = "1em";
    }
    for (i = (focusIndex + 1); i < apps.length; i++) {
      leftPosition += 22;
      document.getElementsByClassName("provider")[i].style.left = leftPosition + "em";
    }
    setTimerNav = setTimeout(function () { buttonEnabled = true; }, 400);
  } else {
    if (rowIndex === 1) {
      // Change position to 0->focusIndex position
      var rect = document.getElementsByClassName("card")[focusIndex].getBoundingClientRect();
      if (focusIndex >= 5 && focusIndex < result.length && rect.left > 1655) {
        for (i = focusIndex; i >= 0; i--) {
          card = document.getElementsByClassName("card")[i];
          if (i !== 0) {
            card.style.position = "absolute";
            card.style.left = document.getElementsByClassName("card")[i - 1].getBoundingClientRect().x + 'px';
          } else {
            card.style.left = card.getBoundingClientRect().x - 315 + 'px';
          }
        }
        // Change position to (focusIndex+`) -> moviesLength position
        for (i = (focusIndex + 1); i < result.length; i++) {
          card = document.getElementsByClassName("card")[i];
          card.style.position = "absolute";
          if (i !== (focusIndex + 1)) {
            card.style.left = parseInt(document.getElementsByClassName("card")[i - 1].style.left, 10) + 315 + 'px';
          } else {
            card.style.left = parseInt(document.getElementsByClassName("card")[focusIndex].style.left, 10) + 315 + 'px';
          }
        }
        buttonEnabled = false;
        setTimer = setTimeout(function () { buttonEnabled = true; }, 400);
      }
    }
  }
}
// NAV_PREVIOUS behavior, cursor moves left at most 4 times at once
function scrollLeft() {
  if (!providerWindowIsVisible) {
    switch (rowIndex) {
      case 0: break;
      case 1:
        focusIndex -= 4;
        if (result.length > 0) {
          if (result.length > 1) {
            if (focusIndex < 0) {
              focusIndex += 4;
            } else {
              document.getElementsByClassName("dots")[focusIndex + 4].src = "images/whiteDots.png";
              if (focusIndex < 4) {
                focusIndex = 3;
              }
              document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
              for (var iResult = 0; iResult < (result.length); iResult++) {
                document.getElementsByClassName("card")[iResult].style.transition = "none";
              }
              previousPageShift();
            }
          } else {
            focusIndex = 0;
            document.getElementsByClassName("card")[focusIndex].focus();
            document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
          }
        }
        console.log("window scroll 0,0");
        break;
    }
  }
}
// Reposition the content elements when the Previous Page action is called
function previousPageShift() {
  var leftPosition;
  var newValue;
  var i;
  if (rowIndex === 1) {
    if (focusIndex < 4) {
      document.getElementsByClassName("card")[0].style.left = "88px";
      leftPosition = 88;
      for (i = 1; i < result.length; i++) {
        leftPosition += 315;
        document.getElementsByClassName("card")[i].style.left = leftPosition.toString() + "px";
      }
    } else if (focusIndex > 3 && focusIndex < (result.length - 1)) {
      document.getElementsByClassName("card")[focusIndex - 3].style.left = "88px";
      leftPosition = 88;
      for (i = (focusIndex - 2); i < result.length; i++) {
        leftPosition += 315;
        document.getElementsByClassName("card")[i].style.left = leftPosition.toString() + "px";
      }
      newValue = -315;
      for (i = (focusIndex - 4); i >= 0; i--) {
        document.getElementsByClassName("card")[i].style.left = newValue.toString() + "px";
      }
    }
    document.getElementsByClassName("card")[focusIndex].focus();
    for (var iResult = 0; iResult < (result.length); iResult++) {
      document.getElementsByClassName("card")[iResult].style.transition = "left 0.2s";
    }
  }
}
// NAV_NEXT behavior, cursor moves right at most 4 times at once
function scrollRight() {
  if (!providerWindowIsVisible) {
    switch (rowIndex) {
      case 0: break;
      case 1: focusIndex += 4;
        if (result.length > 0) {
          if (result.length > 1) {
            if (focusIndex > (result.length - 1)) {
              focusIndex -= 4;
            } else {
              document.getElementsByClassName("dots")[focusIndex - 4].src = "images/whiteDots.png";
              if (focusIndex === (result.length - 1)) {
                focusIndex -= 1;
              }
              document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
              for (var iResult = 0; iResult < (result.length); iResult++) {
                document.getElementsByClassName("card")[iResult].style.transition = "none";
              }
              nextPageShift();
            }
          } else {
            focusIndex = 0;
            document.getElementsByClassName("card")[focusIndex].focus();
            document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
          }
        }
        console.log("window scroll 0,0");
        window.scrollTo(0, 0);
        break;
    }
  }
}
// Reposition the content elements when the Next Page action is called
function nextPageShift() {
  var leftPosition;
  var newValue;
  var i;
  if (rowIndex === 1) {
    if (focusIndex === (result.length - 1)) {
      document.getElementsByClassName("card")[focusIndex].style.left = "88px";
      newValue = -300;
      for (i = (focusIndex - 1); i >= 0; i--) {
        document.getElementsByClassName("card")[i].style.left = newValue.toString() + "px";
      }
    }
    if (focusIndex >= 3 && focusIndex < (result.length - 1)) {
      document.getElementsByClassName("card")[focusIndex].style.left = "88px";
      leftPosition = 88;
      for (i = (focusIndex + 1); i < result.length; i++) {
        leftPosition += 315;
        document.getElementsByClassName("card")[i].style.left = leftPosition.toString() + "px";
      }
      newValue = -315;
      for (i = (focusIndex - 1); i >= 0; i--) {
        document.getElementsByClassName("card")[i].style.left = newValue.toString() + "px";
      }
    }
    document.getElementsByClassName("card")[focusIndex].focus();
    for (var iResult = 0; iResult < (result.length); iResult++) {
      document.getElementsByClassName("card")[iResult].style.transition = "left 0.2s";
    }
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
  registerKeys();
  registerEventListeners();
  console.log('init() called');
  voiceInteractionInit();
  document.getElementById("content-container").innerHTML = "<p>" + LANG_JSON_DATA['content-container'] + "</p><div id=\"providers\"></div>";
  document.getElementById("cancel-button").innerText = LANG_JSON_DATA.cancel;
  document.getElementById("watch-button").innerText = LANG_JSON_DATA.watch;
  fillInfo();
};
// Initialize event listeners for clickable elements
function registerEventListeners() {
  document.getElementById("watch-button").addEventListener("click", openWatchNowWindow);
  document.getElementById("cancel-button").addEventListener("click", closeWatchNowWindow);
}
// Remote control button listener
document.body.addEventListener('keydown', function (event) {
  switch (event.keyCode) {
    case 13: // Enter
      event.preventDefault();
      var selectedElement = document.getElementById("watch-button");
      var isFocused = (document.activeElement === selectedElement);
      if (isFocused) {
        console.log("ENTERED OPENWATCHNOWWINDOW");
        openWatchNowWindow();
      } else if (providerWindowIsVisible) {
        selectedElement = document.getElementById("cancel-button");
        isFocused = (document.activeElement === selectedElement);
        if (isFocused) {
          console.log("CLOSING WATCH NOW WINDOW");
          closeWatchNowWindow();
        } else {
          queryString = "?para1=" + mediaId;
          queryString += "&para2=" + utterance;
          window.location.href = "player.html" + queryString;
        }
      } else {
        videoClicked(result[focusIndex].id);
      }
      break;
    case 19: // Pause
      break;
    case 37: // Left
      if (providerWindowIsVisible) {
        selectedElement = document.getElementById("cancel-button");
        isFocused = (document.activeElement === selectedElement);
        if (!isFocused) {
          navLeft();
        }
      } else {
        if (buttonEnabled) {
          pendingMove = 0;
          clearInterval(navigationInterval);
          navigationInterval = false;
          navigationSetTimeout = false;
          navLeft();
        }
      }
      break;
    case 38: // Up
      if (providerWindowIsVisible) {
        selectedElement = document.getElementById("cancel-button");
        isFocused = (document.activeElement === selectedElement);
        if (isFocused) {
          document.getElementsByClassName("provider")[focusIndex].focus();
        }
      } else {
        if (buttonEnabled) {
          pendingMove = 0;
          clearInterval(navigationInterval);
          navigationInterval = false;
          navigationSetTimeout = false;
          scrollUp();
        }
      }
      break;
    case 39: // Right
      if (providerWindowIsVisible) {
        selectedElement = document.getElementById("cancel-button");
        isFocused = (document.activeElement === selectedElement);
        if (!isFocused) {
          navRight();
        }
      } else {
        if (buttonEnabled) {
          pendingMove = 0;
          clearInterval(navigationInterval);
          navigationInterval = false;
          navigationSetTimeout = false;
          navRight();
        }
      }
      break;
    case 40: // Down
      if (providerWindowIsVisible) {
        selectedElement = document.getElementById("cancel-button");
        isFocused = (document.activeElement === selectedElement);
        if (!isFocused) {
          selectedElement.focus();
        }
      } else {
        pendingMove = 0;
        clearInterval(navigationInterval);
        navigationInterval = false;
        navigationSetTimeout = false;
        scrollDown();
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
    case 403: // RED A
      console.log("SCROLL RIGHT");
      navRight();
      break;
    case 404: // GREEN B
      console.log("SCROLL LEFT");
      navLeft();
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
// Display the movies results on the page
function printFilms() {
  // If no films were found, display a text message
  if (result.length === 0) {
    document.getElementById("more-content").innerHTML = "";
  } else {
    focusIndex = 0;
    document.getElementById("more-content").innerHTML = toPrint;
    document.getElementsByClassName("card")[focusIndex].style.left = "88px";

    // Give every card a different x coordinate for the top results container
    if (result.length > 1) {
      leftPositionCounter = 88 + 315;
      for (var i = 1; i < result.length; i++) {
        var card = document.getElementsByClassName("card")[i].style;
        card.position = "absolute";
        card.left = leftPositionCounter + 'px';
        leftPositionCounter += 315;
      }
    }
    // Focus on the first result
    // document.getElementsByClassName("card")[focusIndex].focus();
    // document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
  }
}
// Build the HTML syntax that will display the Media Content cards
function buildHTMLresult() {
  var inputArray = result;
  var toPrint = "";
  var startH;
  var midH = ")' title='Media Content' tabindex='0'>";
  var vod;
  startH = "<div class='card' onclick='videoClicked(";
  vod = "<div class='vod' hidden><img class='dots' src='images/whiteDots.png' /></div>";
  const imgStart = "<img class='poster' src='";
  const altStart = "' alt='";
  const imgEnd = "'>";
  const endH = "</div>";
  const startTitle = "<div class='title'>";
  const endDiv = "</div>";

  for (var i = 0; i < result.length; i++) {
    toPrint += startH;
    toPrint += inputArray[i].id;
    toPrint += midH;
    toPrint += imgStart;
    toPrint += String(inputArray[i].url);
    toPrint += altStart;
    toPrint += String(inputArray[i].title);
    toPrint += imgEnd;
    toPrint += startTitle;
    toPrint += String(inputArray[i].title);
    toPrint += vod;
    toPrint += endDiv;
    toPrint += endH;
  }
  return toPrint;
}
// Content was selected with a mouse click
function videoClicked(id) {
  var queryString;
  queryString = "?para1=" + id;
  queryString += "&para2=" + utterance;
  window.location.href = "details.html" + queryString;
}
// Scroll down the result rows
function scrollDown() {
  if (rowIndex <= 0) {
    focusIndex = moreContentIndex;
  }
  rowIndex = 1;
  // Animate result containers depending on the position of the current and previous focus
  switch (rowIndex) {
    case 0:
      window.scrollTo(0, 0);
      document.getElementById("watch-button").focus();
      break;
    case 1:
      document.getElementsByClassName("card")[focusIndex].focus();
      document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
      break;
  }
}
// Scroll up the result rows
function scrollUp() {
  if (rowIndex > 0) {
    rowIndex -= 1;
    moreContentIndex = focusIndex;
  }
  // Animate result containers depending on the position of the current and previous focus
  switch (rowIndex) {
    case 0:
      window.scrollTo(0, 0);
      document.getElementById("watch-button").focus();
      document.getElementsByClassName("dots")[focusIndex].src = "images/whiteDots.png";
      break;
    case 1:
      window.scrollTo(0, 0);
      if (scrolledUp === false) {
        scrolledUp = true;
      }
      document.getElementsByClassName("card")[focusIndex].focus();
      document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
      break;
  }
}
// Filter by genre movie/tv show
function filterTypeFilms() {
  films.forEach(function (arrayItem) {
    var genreArray = arrayItem.genre;
    for (var j = 0; j < films[mediaIndex].genre.length; j++) {
      var filmGenre = films[mediaIndex].genre[j];
      for (var i = 0; i < genreArray.length; i++) {
        if ((genreArray[i].toLowerCase().includes(filmGenre.toLowerCase()) && filmGenre.length > 1 && arrayItem.id !== films[mediaIndex].id)) {
          result.push(arrayItem);
          break;
        }
      }
    }
  });
  // Filter to remove duplicates
  if (result.length > 1) {
    for (var preIndex = 0; preIndex < result.length; preIndex++) {
      for (var postIndex = (preIndex + 1); postIndex < result.length; postIndex++) {
        if (preIndex !== postIndex) {
          if (result[preIndex].id === result[postIndex].id) {
            result.splice(postIndex, 1);
            postIndex--;
          }
        }
      }
    }
  }
  if (result.length < 1) {
    result = films;
  }
  if (result.length > 10) {
    result.length = 10;
  }
}
// Initialize script
window.onload = init;
