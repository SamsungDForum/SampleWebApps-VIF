/******************** GLOBAL VARIABLES ********************/
// Used as the index for the options buttons
var focusIndex = 0;
//max number
var topIndex = 2;
//focus/select menu option
var optionSelected;
//Flag : enter FAQ
var flagFAQ = 0;

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
              break;
            case "NAV_NEXT":
              break;
            case "NAV_LEFT":
              if (!document.getElementById("questions")) {
                navLeft();
              }
              break;
            case "NAV_RIGHT":
              if (!document.getElementById("questions")) {
                navRight();
              }
              break;
            case "NAV_UP":
              if (document.getElementById("questions")) {
                navUp();
              }
              break;
            case "NAV_DOWN":
              if (document.getElementById("questions")) {
                navDown();
              }
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
                if (voiceSelection >= 1) {
                  if ((voiceSelection - 1) <= topIndex) {
                    focusIndex = (voiceSelection - 1);
                  }
                  if (!document.getElementById("questions")) {
                    document.querySelectorAll("td")[focusIndex].focus();
                  } else {
                    document.querySelectorAll("li")[focusIndex].focus();
                  }
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

// Key inputs, focus and blur depending on key press from user
document.body.addEventListener('keydown', function (event) {
  console.log("Received key: " + event.keyCode);
  switch (event.keyCode) {
    case 13: // Enter
      console.log("ENTER RECEIVED!");
      itemSelected();
      break;
    case 37: // Left
      if (!document.getElementById("questions")) {
        navLeft();
      }
      break;
    case 38: // Up
      if (document.getElementById("questions")) {
        navUp();
      }
      break;
    case 39: // Right
      if (!document.getElementById("questions")) {
        navRight();
      }
      break;
    case 40: // Down
      if (document.getElementById("questions")) {
    	  navDown();
      }
      break;
    case 403: // RED A
      console.log("SCROLL RIGHT");
      break;
    case 404: // GREEN B
      console.log("SCROLL LEFT");
      break;
    case 405: // YELLOW C
      console.log("TOGGLE TOAST MESSAGE");
      break;
    case 406: // BLUE D
      console.log("SHOW MORE");
      break;
    case 65376: // Done
      focusIndex = 0;
      break;
    case 65385: // Cancel
      break;
    case 10009: // RETURN button
      if (optionSelected) {
        if (!flagFAQ) {
          window.location.href = 'helpModule.html';
        } else {
          window.location.href = 'helpModule.html?option=faq';
        }
      } else {
        window.location.href = 'index.html';
      }
      break;
    default: console.log("Unhandled keycode: " + event.keyCode);
  }
});
// Navigate left
function navLeft() {
  if (focusIndex > 0) {
    focusIndex -= 1;
  }
  document.querySelectorAll("td")[focusIndex].focus();
}
// Navigate right
function navRight() {
  if (focusIndex < topIndex) {
    focusIndex += 1;
  }
  document.querySelectorAll("td")[focusIndex].focus();
}
// Navigate down - FAQ Option
function navDown() {
  if (focusIndex < topIndex) {
    focusIndex += 1;
  }
  document.querySelectorAll("li")[focusIndex].focus();
}
// Navigate up - FAQ Option
function navUp() {
  if (focusIndex > 0) {
    focusIndex -= 1;
  }
  document.querySelectorAll("li")[focusIndex].focus();
}
//Option selected to main menu
function selectedOption() {
  var print_HTML;
  switch (optionSelected) {
    case 'userManual':
      window.location.href = 'userManualMenu.html';
      break;
    case 'remoteControl':
      print_HTML = '<table><thead><tr><th colspan="2">Remote Control</th></tr></thead><tbody><tr id="menu-control"><td tabindex="0" autofocus><div id="circle"><img id="img_circle" src="images/voice-control-white.png"></div><br><br><p>Use the <img src="images/microphone-button.png"> button to search.</p></td><td tabindex="1"><div id="circle"><img src="images/remote-control-white.png"></div><br><br><p>Select the search bar and use the buttons to search.</p></td></tr></tbody></table>';
      topIndex = 1;
      printHTML(print_HTML);
      document.querySelectorAll("td")[0].focus();
      break;
    case 'faq':
      var list_questions = '';
      for (var i = 0; i < list_faq.length; i++) {
        list_questions = list_questions.concat('<li tabindex="'+ i +'"><p>'+list_faq[i].question+'</p></li><hr>');
      }
      print_HTML = '<table id="faq"><thead><tr><th>FAQ</th></tr></thead><tbody><tr><td><ul id="questions">'+list_questions+ '</ul></td></tr></tbody></table>';
      topIndex = 3;
      printHTML(print_HTML);
      document.querySelectorAll("li")[0].focus();
      click_questions();
      break;
    default:
      print_HTML = '<table><thead><tr><th colspan="3">Help Module</th></tr></thead><tbody><tr id="options"><td tabindex="0" autofocus><div id="circle"><img src="images/handbook-white.png" ></div><br><br><a>User Manual</a></td><td tabindex="1"><div id="circle"><img src="images/remote-control-white.png" ></div><br><br><a>Remote Control</a></td><td tabindex="2"><div id="circle"><img src="images/faq-white.png"></div><br><br><a>FAQ</a></td></tr></tbody></table>';
      printHTML(print_HTML);
      document.querySelectorAll("td")[0].focus();
      click_options();
      break;
  }
}
//Print new page
function printHTML(print_HTML) {
  document.getElementById("container").innerHTML = print_HTML;
}
// Select item information
function itemSelected() {
  document.activeElement.click();
}
// To navigate to page selected
function click_options() {
  document.getElementById("options").onclick = function () {
    for (var i = 0; i <= topIndex; i++) {
      if (document.activeElement === document.querySelectorAll("td")[i]) {
        switch (i) {
          case 0:
            window.location.href = '?option=userManual';
            break;
          case 1:
            window.location.href = '?option=remoteControl';
            break;
          case 2:
            window.location.href = '?option=faq';
            break;
        }
        break;
      }
    }
  };
}
// To navigate to page selected
function click_questions() {
  document.getElementById("questions").onclick = function () {
    for (var i = 0; i <= topIndex; i++) {
      if (document.activeElement === document.querySelectorAll("li")[i]) {
        document.getElementById("questions").innerHTML = '<li><p>' + list_faq[i].question + '</p></li><hr><li id="textAnswer"><p>' + list_faq[i].answer + '</p></li>';
        document.querySelectorAll("li")[0].focus();
        flagFAQ = 1;
      }
    }
  };
}
// Initialize function
var init = function () {
  registerKeys();
  voiceInteractionInit();
  //------------------------------------------------------------------------
  // Select parameter ("option")
  optionSelected = location.search.split('option=')[1];
  selectedOption();

};

window.onload = init;
