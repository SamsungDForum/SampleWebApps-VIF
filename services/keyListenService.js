"use strict";

angular.module("angular-app").service("keyListen", keyListen);

keyListen.$inject = ["$rootScope"]; 

function keyListen($rootScope) {
  document.addEventListener("keyup", KeyCode);
  registerKeys();
  function KeyCode(event) {
    var code = event.keyCode;

    var keyCodes = {
      38:     'up',
      40:     'down',
      39:     'right',
      37:     'left',
      13:     'enter',
      8:      'back',
      10009:  'back',
      415:    'play',
      413:    'stop',
      417:    'ffoward',
      412:    'backward',
      19:     'pause',
      10233:  'nextItem'
    }

    if(keyCodes[code]){
      //console.log("key: ", code);
      $rootScope.$broadcast("navKeys", keyCodes[code]);
    }
  }
}

function registerKeys() {
  var usedKeys = [
    "MediaPause",
    "MediaPlay",
    "MediaPlayPause",
    "MediaFastForward",
    "MediaRewind",
    "MediaStop",
    "MediaTrackNext"
  ];

  usedKeys.forEach(
  	function (keyName) {
  	    tizen.tvinputdevice.registerKey(keyName);
  	}
  );
}