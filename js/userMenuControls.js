/******************** CONTROLS/NAVIGATION ********************/
// Used as the index for the options buttons
var focusIndex = 0;
//
var menuItem = document.querySelectorAll("a")[0];

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

function itemSelected() {
  document.activeElement.click();
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
              window.location.href = 'index.html';
              break;
            case "Setting":
              break;
            case "Search":
              break;
            default:
              break;
          }
          return bSupport;
        },
        onnavigation: function (voiceNavigation) {
          var bSupport = true;
          console.log("onnavigation : " + voiceNavigation);
          switch (voiceNavigation) {
            case "NAV_PREVIOUS":
              if (menuItem) {
                navLeft();
              }
              break;
            case "NAV_NEXT":
              if (menuItem) {
                navRight();
              }
              break;
            case "NAV_LEFT":
              if (menuItem) {
                navLeft();
              }
              break;
            case "NAV_RIGHT":
              if (menuItem) {
                navRight();
              }
              break;
            case "NAV_UP":
              break;
            case "NAV_DOWN":
              break;
            case "NAV_SHOW_MORE":
              break;
            default:
              break;
          }
          return bSupport;
        },
        onselection: function (voiceSelection) {
          var bSupport = true;
          console.log("onselection : " + voiceSelection);
          switch (voiceSelection) {
            case -1:
              break;
            case 0:
              itemSelected();
              break;
            default:
              {
                if (voiceSelection) {
                  focusIndex = voiceSelection - 1;
                  document.querySelectorAll("a")[focusIndex].focus();
                  itemSelected();
                }
              }
              break;
          }
          return bSupport;
        },
      });
  } catch (err) {
	console.log("SETCALLBACK FUNCTION FAILED: " + err.message);
  }
  try {
    webapis.voiceinteraction.listen();
    console.log("LISTEN FUNCTION CALLED");
  } catch (err) {
    console.log("LISTEN FUNCTION FAILED: " + err.message);
  }
}

function enterKey() {
  switch (focusIndex) {
    case 0:
      window.location.href = 'userManualSlides.html?category=navigation';
      break;
    case 1:
      window.location.href = 'userManualSlides.html?category=selection';
      break;
    case 2:
      window.location.href = 'userManualSlides.html?category=media_controls';
      break;
    case 3:
      window.location.href = 'userManualSlides.html?category=search';
      break;
    default:
      break;
  }
}

// Navigate left
function navLeft() {
  if (focusIndex > 0) {
    focusIndex -= 1;
  }
  document.querySelectorAll("a")[focusIndex].focus();
}
// Navigate right
function navRight() {
  if (focusIndex < 3) {
    focusIndex += 1;
  }
  document.querySelectorAll("a")[focusIndex].focus();
}

function returnButton() {
  window.location.href = 'helpModule.html';
}

// Key inputs, focus and blur depending on key press from user
document.body.addEventListener('keydown', function (event) {
  console.log("Received key: " + event.keyCode);
  switch (event.keyCode) {
    case 13: // Enter
      enterKey();
      break;
    case 37: // Left
      navLeft();
      break;
    case 39: // Right
      navRight();
      break;
    case 10009: // RETURN button
      returnButton();
      break;
    default: console.log("Unhandled keycode: " + event.keyCode);
  }
});

// Initialize function
var init = function () {
  registerKeys();
  voiceInteractionInit();
  //------------------------------------------------------------------------
  menuItem.focus();
};

window.onload = init;
