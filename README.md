# voice-mediacontrols

## Voice TV Control Interface

**Voice TV Control only support for voice-enabled 2019 Samsung Smart TV now.**

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
|Key Events | Basic playback commands with Remote "play" , "pause", "stop", etc. |
|Control events with Parameters| provides a set of callbacks which are linked to the actions with parameters "Set position to  1 minute 30 seconds"|

##### 1. KeyEvent

|Command|Sample voice commands | Deception |
|-------|---------------------|-----------|
|play|"play", "resume"|Plays/Resumes the media|
|pause|"pasue"|Pauses the media|
|stop|"stop"|Stops the media|
|fastword|"fast forward"|Fast forwards without duration. It needs to define default duration in the app.|
|rewind|"rewind"|Rewinds without duration. It needs to define default duration in the app.|


##### 2. Actions with Parameters details

|Command|Sample voice commands|Parameter Name|Parameter Value|
|-|-|-|- |
|Next|"next", "next item", "next episode"|Triggers the next command and plays the next media in the playlist|
|TrackPrevious|"previous" , "go to previous"|| |
|Restart|"restart"|| |
|SetRepeat|"repeat","repeat once", "repeat all" |mode|off,one,all |
|SkipBackward|"rewind to 30 seconds"|offset|time value(seconds) |
|SkipForward|"fast forward to 30 seconds"|offset|time value(seconds) |
|SetPlayPosition|"jump to 1 minute 30 seconds|position|time value(seconds) |
|SetSubtitle|"caption on", "caption off"|toggle|on, off |

### Steps to implement voice media controls

1. Configure config.xml

- Companion Version 

```javascript
// Companion Version 
// (For guarantee compatibility between Bixby and Companion-app)
<metadata key="http://developer.samsung.com/tizen/metadata/bixby/companion-app/version" value="10000"/>
<metadata key="http://developer.samsung.com/tizen/metadata/bixby/sdk/version" value="v1.0-beta.1.4"/>
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
   webapis.bixby.initialize();
}

function onTerminate(){
   /* Release all resources. */
   webapis.bixby.deinitialize();
}

```

3. Manage Voice Media controls Actions

```javascript
// register action execution callback for a control action 
webapis.bixby.setActionExecutionListener(‘SetPlayPosition’, OnActionReceive)

// Actions callbacks
function OnActionReceive (action_id, bundle_message) {
  var action_result;
  if(action_id ==’SetPlayPosition’){
    action_result = SetPlayPosition(bundle_message[‘position’])
  }
  // retruns action result
  webapis.bixby.completeActionExecution(action_result) 
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
|Exception Id|Predefined Exception Response|
|-|-|
|Exception_SkipBackward_offset_Invalid|Actually, I can't seem to go back by that much.<br> 재생할 수 없는 위치네요.|
|Exception_SkipForward_offset_Invalid|Actually, I can't seem to go forward by that much. <br>재생할 수 없는 위치네요.|
|Exception_SetPlayPosition_position_Invalid|	Seems like this video runs for #{HH:MM:SS}. <br> 이 영상의 재생 시간은 #{HH:MM:SS}입니다.|
|Exception_SetSubtitle_on_Unsupported|I'm afraid I can't do that. <br>지원되지 않는 기능이에요.|
|Exception_SetSubtitle_Off_Unsupported|I'm afraid I can't do that. <br>지원되지 않는 기능이에요.|
|Exception_SetShuffle_on_Unsupported|I'm afraid I can't do that. <br>지원되지 않는 기능이에요.|
|Exception_SetShuffle_off_Unsupported|I'm afraid I can't do that. <br>지원되지 않는 기능이에요.|
|Exception_SetScreenFit_on_Unsupported|I'm afraid I can't do that.<br>지원되지 않는 기능이에요.|
|Exception_SetScreenFit_off_Unsupported|I'm afraid I can't do that. <br>지원되지 않는 기능이에요.|
|Exception_SetZoom_in_Unsupported|I'm afraid I can't do that.<br>지원되지 않는 기능이에요.|
|Exception_SetZoom_out_Unsupported|I'm afraid I can't do that.<br>지원되지 않는 기능이에요.|
|Exception_SetZoom_in_Max|Seems like we aren't able to zoom in any more.<br>가장 크게 확대한 상태예요.|
|Exception_SetZoom_out_Min|Seems like we aren't able to zoom out any more.<br>가장 작게 축소한 상태예요.|
|Exception_SetRepeat_all_Unsupported|I'm afraid I can't do that.<br>지원되지 않는 기능이에요.
|Exception_SetRepeat_one_Unsupported|I'm afraid I can't do that. <br>지원되지 않는 기능이에요.|
|Exception_SetRepeat_off_Unsupported|I'm afraid I can't do that. <br>지원되지 않는 기능이에요.|
|Exception_ContinueWatching_Unspported|I'm afraid I can't do that.<br>지원되지 않는 기능이에요.|

