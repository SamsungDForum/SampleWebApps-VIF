"use strict";

angular
  .module('angular-app')

  .controller('VideoController', function($scope, $location, $timeout) {
    
    tizen.bixby.initialize();

    var cmd_SetScreenFit          = 'tvMediaControl.SetScreenFit';
    var cmd_SkipForward           = 'tvMediaControl.SkipForward';
    var cmd_SkipBackward          = 'tvMediaControl.SkipBackward';
    var cmd_SetSubtitle           = 'tvMediaControl.SetSubtitle';
    var cmd_Restart               = 'tvMediaControl.Restart';
    var cmd_SetRepeat             = 'tvMediaControl.SetRepeat';
    var cmd_TrackPrevious         = 'tvMediaControl.TrackPrevious';    

    tizen.bixby.setAppStateRequestListener(OnAppStateRequestListener);
    tizen.bixby.setActionExecutionListener(cmd_SetScreenFit, SetScreenFitListener);
    tizen.bixby.setActionExecutionListener(cmd_SkipForward, SkipForwardListener);
    tizen.bixby.setActionExecutionListener(cmd_SkipBackward, SkipBackwardListener);
    tizen.bixby.setActionExecutionListener(cmd_SetSubtitle, SetSubtitleListener);
    tizen.bixby.setActionExecutionListener(cmd_Restart, RestartListener);
    tizen.bixby.setActionExecutionListener(cmd_SetRepeat, SetRepeatListener);
    tizen.bixby.setActionExecutionListener(cmd_TrackPrevious, PlayPreviousItemListener);
    
    
    var vm                    = this;
    var player                = document.getElementById('av-player');
    var isFullScreen          = false;
    var isProvisioned         = false;        //URL is setted
    var playerURL             = null;         //URL is not selected yet
    var subtitleURL           = '';
    var repeatMode            = false;

    vm.level                  = 1;             //focus on video list
    vm.videoList_index        = 0;             //first video
    vm.mediaControl_index     = 1;             //focus on play content icon
    vm.isPlaying              = false;         //Choose the current state icon in the player buttons
    vm.isLoading              = false;         //Display the loading image when buffering
    vm.PlayTime               = "00:00:00";
    vm.currentPlayTime        = "00:00:00";

    vm.currentProgress = {
      width: "0%"
    };

    var listener = {
      onbufferingstart: function() {
        console.log("Buffering start.");
        vm.isLoading = true;
        vm.isPlaying = false;
        $scope.$apply();
      },
      onbufferingprogress: function(percent) {
        // console.log("Buffering progress data : " + percent);
      },
      onbufferingcomplete: function() {
        console.log("Buffering complete.");
        vm.isLoading = false;
        vm.isPlaying = true;
        $scope.$apply();
      },
      oncurrentplaytime: function(currentTime) {
        vm.currentPlayTime = CalculateCurrentTime(currentTime);
        ProgressbarIncrement(currentTime, webapis.avplay.getDuration());
        $scope.$apply();
        // console.log("Current playtime: " + calculateTime(currentTime));
      },
      onevent: function(eventType, eventData) {
        // console.log("event type: " + eventType + ", data: " + eventData);
      },
      ondrmevent: function(drmEvent, drmData) {
        console.log("DRM callback: " + drmEvent + ", data: " + drmData);
      },
      onstreamcompleted: function() {
        StopVideoBehavior("[Stream completed]");
        if (repeatMode === false) {
          vm.level = 1;
          $scope.$apply();
        }
        else {
          PlayVideo(playerURL, webapis.avplay.getState());
        }
      },
      onerror: function(eventType) {
        console.log("event type error : " + eventType);
      }
    };
    
    var playerCoords = {
      x:      460,
      y:      90,
      width:  1000,
      height: 556
    };

    $scope.$on("$destroy", $scope.$on("navKeys", navKeys));

    function navKeys(event, move) {

      var CurrentPlayerState = webapis.avplay.getState();
      var GlobalObject = document.getElementsByClassName("focus");

      switch (move) {
        case "up":
          if (isFullScreen === false) {
            if (isProvisioned == true) {
              if (vm.level > 0) {
                vm.level--;
              }
              $scope.$apply();
            }
          }
          break;
        case "down":
          if (isFullScreen === false) {
            if (vm.level < 1) {
              vm.level++;
              vm.mediaControl_index = 1;
            }
            $scope.$apply();
          }
          break;
        case "right":
          if (isFullScreen === false) {
            if (vm.level == 0) {
              if (vm.mediaControl_index < 3) {
                vm.mediaControl_index++;
              }
            } else {
              if (vm.videoList_index < 4) {
                vm.videoList_index++;
              }
            }
            $scope.$apply();
          }
          break;
        case "left":
          if (isFullScreen === false) {
            if (vm.level == 0) {
              if (vm.mediaControl_index > 0) {
                vm.mediaControl_index--;
              }
            } else {
              if (vm.videoList_index > 0) {
                vm.videoList_index--;
              }
            }
            $scope.$apply();
          }
          break;
        case "enter":
          EnterButtonBehavior(GlobalObject, CurrentPlayerState);
          break;
        case "play":
          PlayVideo(playerURL,CurrentPlayerState);
          break;
        case "stop":
          StopVideoBehavior("[STOP PRESS]");
          break;
        case "ffoward":
          JumpForward(5);
          break;
        case "backward":
          JumpBackward(5);
          break;
        case "nextItem":
          GoToNextItem("PlayNextItemListener");
          break;
        case "pause":
          vm.isPlaying = false;
          $scope.$apply();
          webapis.avplay.pause();
          break;
        case "back":
          if(isFullScreen === true){
            SetFullScreen(false);
          }
          if (
            CurrentPlayerState == "PAUSED" ||
            CurrentPlayerState == "STOPED" ||
            CurrentPlayerState == "PLAYING"
          ) {
            StopVideoBehavior("[RETURNING TO PREVIOUS MENU]");
          }
          $timeout(function() {
            $location.path("/");
          });
          break;
        default:
          break;
      }
    }
        
    function SetURL(id) {
      switch (id) {
        case "vid0":
          playerURL = "http://your_video1.mp4";
          subtitleURL = '';
          break;
        case "vid1":
          playerURL = "http://your_video2.mp4";
          subtitleURL = '';
          break;
        case "vid2":
          playerURL = "http://your_video3.mp4";
          subtitleURL  = '';
          break;
        case "vid3":
          playerURL = "http://your_video4.mp4";
          subtitleURL = '';
          break;
        case "vid4":
          playerURL = "http://your_video5.mp4";
          subtitleURL = '';
          break;
        default:
          break;
      }
    }
    
    function ProgressbarIncrement(current, total) {
      var value = (current * 100) / total;
      vm.currentProgress.width = value + "%";
      $scope.$apply();
    }

    function PlayVideo(url,playerState) {
      if (playerState === null) {
        return;
      } 
      else if (playerState === "PAUSED") {
        webapis.avplay.play();
        vm.isPlaying = true;
        $scope.$apply();
      } 
      else {
        webapis.avplay.close();
        webapis.avplay.open(url);
        SetFullScreen(false);
        vm.isLoading = true;
        $scope.$apply();
        webapis.avplay.setListener(listener);
        webapis.avplay.prepareAsync(function() {
          webapis.avplay.play();
          vm.PlayTime = CalculateCurrentTime(webapis.avplay.getDuration());
        });
      }
    }

    function EnterButtonBehavior(globalClass, playerState) {
      var currentId = globalClass[0].id;

      if (isFullScreen === true) {
        SetFullScreen(false);
      } else if (vm.level == 0) {
        if ((playerState == "NONE" || playerState == "IDLE") && currentId == "play") {
          PlayVideo(playerURL, subtitleURL);
        } else if (playerState == "PLAYING") {
          if (currentId == "play") {
            vm.isPlaying = false;
            $scope.$apply();
            webapis.avplay.pause();
          }
          if (currentId == "full") {
            SetFullScreen(true);
          }
          if (currentId == "backward") {
            JumpBackward(5);
          }
          if (currentId == "foward") {
            JumpForward(5);
          }
        } else if (playerState == "PAUSED" && currentId == "play") {
          vm.isPlaying = true;
          $scope.$apply();
          webapis.avplay.play();
        }
      } else {
        if (playerState == "PLAYING" || playerState == "PAUSED") {
          StopVideoBehavior();
        }
        SetURL(currentId);
        if (vm.level > 0) {
          vm.level--;
          isProvisioned = true;
          $scope.$apply();
        }
      }
    }

    function StopVideoBehavior(message) {
      console.log(message);
      SetFullScreen(false);
      SetSubtitle('off');
      webapis.avplay.stop();
      vm.isPlaying = false;
      vm.PlayTime = "00:00:00";
      vm.currentPlayTime = "00:00:00";
      vm.currentProgress.width = "0%";
      $scope.$apply();
    }

    function CalculateCurrentTime(milisecs) {
      var Hours = Math.floor(milisecs / 3600000);
      var Mins = Math.floor((milisecs - Hours * 3600000) / 60000);
      var Secs = Math.floor((milisecs - Hours * 3600000 - Mins * 60000) / 1000);
      if (Hours < 10) {
        Hours = "0" + Hours;
      }
      if (Mins < 10) {
        Mins = "0" + Mins;
      }
      if (Secs < 10) {
        Secs = "0" + Secs;
      }
      return Hours + ":" + Mins + ":" + Secs;
    }

    function SecsToMilisecs(secs){
      return secs * 1000;
    }
    
    function SetFullScreen(state){
      if(state === true){
        console.log("To FullScreen");
        player.classList.add('full-player');
        isFullScreen = true;
        webapis.avplay.setDisplayRect(0, 0, 1920, 1080);
      }
      else{
        console.log("To Normal Screen");
        player.classList.remove('full-player');
        isFullScreen = false;
        webapis.avplay.setDisplayRect(
          playerCoords.x,
          playerCoords.y,
          playerCoords.width,
          playerCoords.height
        );

      }
    }

    function JumpForward(secs){
      vm.isLoading = true;
      vm.isPlaying = false;
      $scope.$apply();
      var time = SecsToMilisecs(secs);
      console.log('Forward : ',time);
      webapis.avplay.jumpForward(time);
    }

    function JumpBackward(secs){
      vm.isLoading = true;
      vm.isPlaying = false;
      $scope.$apply();
      var time = SecsToMilisecs(secs);
      console.log('BackWard : ',time);
      webapis.avplay.jumpBackward(time);

    }

    function SetSubtitle(status) {
      var subtitle = document.getElementById("subtitle");

      if (status === 'on') {
        var strings = ["This is a sample of a player subtitle", "it was called by Bixby to be displayed on screen...", "until you decide to turn off again.", "..."];
        subtitle.innerHTML = strings[0];
      } else {
        subtitle.innerHTML = '';
      }
    }

    function GoToPreviousItem(message) {
      var CurrentPlayerState = webapis.avplay.getState();
      var videoId = 'vid';

      if (vm.videoList_index > 0) vm.videoList_index--;
      else if (vm.videoList_index === 0) vm.videoList_index = 4;

      $scope.$apply();
      SetURL(videoId + vm.videoList_index);
      StopVideoBehavior(message);
      PlayVideo(playerURL, CurrentPlayerState);
    }

    function GoToNextItem(message) {
      var CurrentPlayerState = webapis.avplay.getState();
      var videoId = 'vid';

      if (vm.videoList_index < 4) vm.videoList_index++;
      else if (vm.videoList_index === 4) vm.videoList_index = 0;

      $scope.$apply();
      SetURL(videoId + vm.videoList_index);
      StopVideoBehavior(message);
      PlayVideo(playerURL, CurrentPlayerState);
    }

    //BIXBY

    function SetScreenFitListener(action_handler, bundle_message) {
      var resultCode = [{ result_code: "SUCCESS" }]; // "success", "fail", "notSupported"
      var cmd = bundle_message["toggle"];
      console.log("SetScreenFitListener : toggle : " + cmd);

      if (cmd === "on") SetFullScreen(true);
      else if (cmd === "off") SetFullScreen(false);

      OncompleteActionExecution(action_handler, resultCode);
    }

    function SkipBackwardListener(action_handler, bundle_message) {
      var resultCode = [{ result_code: "SUCCESS" }]; // "success", "fail", "notSupported"
      var cmd = bundle_message["offset"];
      console.log("Skip Backward Listener : " + cmd);
      //video.currentTime -= cmd;
      JumpBackward(cmd);

      OncompleteActionExecution(action_handler, resultCode);
    }

    function SkipForwardListener(action_handler, bundle_message) {
      var resultCode = [{ result_code: "SUCCESS" }]; // "success", "fail", "notSupported"
      var cmd = bundle_message["offset"];
      console.log("SkipForwardListener : offset : " + cmd);
      //video.currentTime += cmd;
      JumpForward(cmd);

      OncompleteActionExecution(action_handler, resultCode);
    }

    function OnAppStateRequestListener(app_state_handler) {
      var state = '{concepts: [{"type": "samsung.tv.MediaControl.State", "values": [{ "name": "Playing", "title": "Game of Thrones Season II Episode 3"}]}]}';
      console.log("OnAppStateRequestListener is fired");

      tizen.bixby.completeAppStateRequest(app_state_handler, state);
    }

    function SetSubtitleListener(action_handler, bundle_message) {
      var resultCode = ""; // "success", "fail", "notSupported"

      var cmd = bundle_message['toggle'];
      console.log("SetSubtitleListener : toggle : " + cmd);

      if (cmd === 'on') {
          resultCode = [{ "result_code": "SUCCESS" }];
          SetSubtitle(cmd);
      }
      else if (cmd === 'off') {
        resultCode = [{ "result_code": "SUCCESS" }];
        SetSubtitle(cmd);
      }

      OncompleteActionExecution(action_handler, resultCode);
    }

    function PlayPreviousItemListener(action_handler, bundle_message) {
      var resultCode = [{ "result_code": "SUCCESS" }]; // "success", "fail", "notSupported"
      GoToPreviousItem("PlayPreviousItemListener");
      OncompleteActionExecution(action_handler, resultCode);
    }
   
    function RestartListener(action_handler, bundle_message) {
        var resultCode = [{"result_code":"SUCCESS"}]; // "success", "fail", "notSupported"
        
        console.log("Restart start : "+action_handler);
        StopVideoBehavior('[Media Stop]');
        PlayVideo(playerURL,webapis.avplay.getState());

        OncompleteActionExecution(action_handler, resultCode);
    }

    function SetRepeatListener(action_handler, bundle_message) {
        var resultCode = [{
            "result_code": "SUCCESS",
            "description": "SUCCESS ",
            "user_response": {
            "responseSID": "MediaControl_TV_30_1_TurnOffRepeatPlay_Function_Support_Y"
            }
        }]; // "success", "fail", "notSupported"
        var cmd = bundle_message['mode'];
        console.log("SetRepeatListener : mode : "+cmd);
        
        // TODO
        //if(cmd === 'one') player.repeat('one');
        //else if(cmd === 'all') player.repeat('all');
        //else if(cmd === 'off') player.repeat('off');

      if (cmd === 'one') {
        repeatMode = true;
        resultCode[0].user_response.responseSID = "Success_SetRepeat_one";
      }
      else if (cmd === 'off') repeatMode = false;

        OncompleteActionExecution(action_handler, resultCode);    
    }

    function OncompleteActionExecution(action_handler, resultCode) {
      console.log("OnCompleteActionExcution");
      console.log(JSON.stringify(resultCode));
      tizen.bixby.completeActionExecution(action_handler, JSON.stringify(resultCode));
    }

  });