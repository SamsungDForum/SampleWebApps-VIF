# voice-mediacontrols

## Voice TV Control Interface

**Voice TV Control only support for voice-enabled 2019 Samsung Smart TV now.**

**We will support 2018 voice-enabled TV later.**

### Supports media playback controls

Play / Pause / Resume / Stop
Fast Forward / Rewind
Skip to next / previous

#### Provides a simple and an easy way to integrate in your app

- Key event
- Passing extra Parameters to a callback function

#### Media Controls events

| Types | Description |
|-------|-------------|
|Key Events | Basic playback commands with Remote “play” , “pause”, “stop”, etc. |
|Control events with Parameters| provides a set of callbacks which are linked to the actions with parameters “Set position to  1 minute 30 seconds”|
|||

##### 1. KeyEvent

|Command|Sample voice commands | Deception |
|-------|---------------------|-----------|
|play|"play", "resume"|Plays/Resumes the media|
|pause|"pasue"|Pauses the media|
|stop|"stop"|Stops the media|
|fastword|"fast forward"|Fast forwards without duration. It needs to define default duration in the app.|
|rewind|"rewind"|Rewinds without duration. It needs to define default duration in the app.|
|Next|"next", "next item", "next episode"|Triggers the next command and plays the next media in the playlist|
|||

##### 2. Actions with Parameters details

|Command|Sample voice commands|a| |
|-|-|-|- |
|TrackPrevious|"previous" , "go to previous"|| |
|Restart|"restart"|| |
|SetRepeat|"repeat","repeat once", "repeat all" |mode|off,one,all |
|SkipBackward|"rewind to [time]|offset|time value(seconds) |
|SkipForward|"fast forward to [time]|offset|time value(seconds) |
|SetPlayPosition|"jump to [time]|absolute Position|time value(seconds) |
|SetSubtitle|"caption on", "caption off"|toggle|on, off |
||||


### Steps to implement voice media controls

1. Configure config.xml

- Companion Version 

```javascript
// Companion Version 
// (For guarantee compatibility between Bixby and Companion-app)
<metadata key="http://developer.samsung.com/tizen/metadata/bixby/companion-app/version" value="10000"/>
```

- Registering Action ( Not all of actions need to be implemented)

```javascript
// Registering Action ( Not all of actions need to be implemented)
<metadata key="http://developer.samsung.com/tizen/metadata/bixby/companion-app/action-id" value="tvMediaControl.SetSubtitle,tvMediaControl.SkipBackward,tvMediaControl.SkipForward,tvMediaControl.SetPlayPosition"/>
```

2. Initialize Voice Media Controls Interface

```javascript
function onCreate(){
   /* Initialize voice control interface. */
   tizen.bixby.initialize();
}

function onTerminate(){
   /* Release all resources. */
   tizen.bixby.deinitialize();
}

```

3. Manage Voice Media controls Actions

```javascript
// register action execution callback for a control action 
tizen.bixby.setActionExecutionListener(‘SetPlayPosition’, OnActionReceive)

// Actions callbacks
function OnActionReceive (action_id, bundle_message) {
  var action_result;
  if(action_id ==’SetPlayPosition’){
    action_result = SetPlayPosition(bundle_message[‘position’])
  }
  // retruns action result
  tizen.bixby.completeActionExecution(action_result) 
}

function SetPlayPosition(position){
    // Set Play Position with the given position variable 
}
```

4. Error handling
- Success

```json
[{
 "result_code": "SUCCESS"
}]
```

- Exception : Predefined Exception Code.

```json
[{
 "result_code": "EXCEPTION",
 "description": "Exception ",
 "user_response": {
 "responseSID":     "Exception_SetPlayPosition_position_Invalid"
 }
}]
```