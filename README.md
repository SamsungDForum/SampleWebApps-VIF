# TV Media Player using voice media controls from the TV Media Controls in app sdk
## Supports remote control functions as well as Bixby voice recognition

### How To...

### Steps to implement TV Media Controls

1. Configure config.xml.
  - Include the following lines in your config.xml:
```
<tizen:metadata key="http://developer.samsung.com/tizen/metadata/bixby/companion-app/version" value="10000"/>
<tizen:metadata key="http://developer.samsung.com/tizen/metadata/bixby/companion-app/action-id" value="tvMediaControl.Restart,tvMediaControl.TrackNext,tvMediaControl.TrackPrevious,tvMediaControl.SkipBackward,tvMediaControl.SkipForward,tvMediaControl.SetPlayPosition,tvMediaControl.SetSubtitle,tvMediaControl.SetShuffle,tvMediaControl.SetScreenFit,tvMediaControl.Screenfit,tvMediaControl.SetSubtitle,tvMediaControl.SetZoom,tvMediaControl.Rotate,tvMediaControl.Set360Mode,tvMediaControl.ContinueWatching,tvMediaControl.SetRepeat,tvMediaControl.TrackPrevious,tvLauncher.Open"/>
<tizen:metadata key="http://developer.samsung.com/tizen/metadata/bixby/companion-app/capsule id" value="tvMediaControl"/>
<tizen:metadata key="http://developer.samsung.com/tizen/metadata/bixby/sdk/version" value="v1.0 beta.1.4"/>
<tizen:privilege name="http://tizen.org/privilege/internet"/>
<tizen:privilege name="http://tizen.org/privilege/tv.inputdevice"/>
```
**NOTE: It is not necessary to include ALL the control actions inside the value="" field, simply include the control actions that will be used in your application.**

2. Initialize connection to Bixby client.
```
webapis.bixby.initialize();
```

3. Register key events for the essential control actions.
```
var usedKeys = [
	    "MediaPause",
	    "MediaPlay",
	    "MediaPlayPause",
	    "MediaFastForward",
	    "MediaRewind",
	    "MediaStop"
	];
	usedKeys.forEach(
	  	function (keyName) {
	  		try {
	  			tizen.tvinputdevice.registerKey(keyName);
	  	    	} catch(error) {
	  	        	console.log("Failed to register " + keyName + ": " + error);
	  	    	}
	  	}
	);
```
**NOTE: MediaPlayPause is used for remote controls that come with a single button for both the play and pause functions.**

4. Setup the listeners.
```
webapis.bixby.setActionExecutionListener(<CONTROL ACTION>, <FUNCTION>);
```
For every non essential control action, an action listener will be required. For example:
```
webapis.bixby.setActionExecutionListener("tvMediaControl.Restart", reload_vid);
webapis.bixby.setActionExecutionListener("tvMediaControl.TrackNext", next_vid);
webapis.bixby.setActionExecutionListener("tvMediaControl.TrackPrevious", previous_vid);
```

5. Handle the key events in your application. For example:
```
case 10009: //RETURN button
	    	webapis.bixby.deinitialize();
    		tizen.application.getCurrentApplication().exit();
    		break;	
```

6. Deinitialize Bixby when closing application.
```
webapis.bixby.deinitialize();
```

7. Response for when the action execution is completed.
```
function OncompleteActionExecution(action_handler, resultCode) {
	console.log("OnCompleteActionExcution");
	console.log(JSON.stringify(resultCode));
	webapis.bixby.completeActionExecution(action_handler, JSON.stringify(resultCode));
}
```
