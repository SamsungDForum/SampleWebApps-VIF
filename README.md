# Sample Application for the Voice Assistant Web API
## Supports remote control functions and voice commands
### How To Use
#### Searching
* While on the search page, uttering voice commands such as "Search for Titanic" or "Search for Drama films" will produce a list of possible results.
* The user can search films by title, genre, cast and/or year of release.
#### Navigating
* The user may navigate the selection screen by using the up, down, left, right buttons on the remote control.
* The user can also navigate the selection screen by uttering voice commands such as "move up", "move down", "left", "right".
* Alternative forms of navigation include "Next Page", "Previous Page" and "Show More" when navigating the search page with multiple content results.
#### Selecting by title
* The user can press ENTER on the remote control while the desired item has focus in order to select it.
* If a certain item is included in the results list, the user may utter the title name in order to select it. (UPCOMING FEATURE)
* Example: "Avatar" will result in the selection of the film Avatar and will automatically bring up the details page for that item. (UPCOMING FEATURE)
#### Ordinal selection
* The user can select an item by calling its ordinal position ("first", "second", "fifth", "last", etc.).
* Example: When selecting the third item in the list of results, simply saying "third" should automatically bring up the details page for that item.
#### Media Controls
* When the media player is displayed, the user can use voice commands to control the video.
* Basic supported voice commands include: "Play", "Pause", "Fastforward", "Rewind", "Stop", "Back", "Exit".
### Steps to implement Voice Assistant Web API
For the config.xml file, there are two required privileges (http://developer.samsung.com/privilege/voicecontrol, http://developer.samsung.com/privilege/microphone) that must be included for the VIF to work. Additionally, the required version must be at least 6.0 for the web-api to work with your application.
```     
<?xml version="1.0" encoding="UTF-8"?>
<widget xmlns:tizen="http://tizen.org/ns/widgets" xmlns="http://www.w3.org/ns/widgets" id="http://yourdomain/VoiceInteractionSearchAndPlay" version="0.2.1" viewmodes="maximized">
    <access origin="*" subdomains="true"></access>
    <tizen:application id="htKSytyQFV.VoiceInteractionSearchAndPlay" package="htKSytyQFV" required_version="6.0"/>
    <content src="index.html"/>
    <feature name="http://tizen.org/feature/screen.size.all"/>
    <icon src="logo.png"/>
    <tizen:metadata key="http://samsung.com/tv/metadata/prelaunch.support" value="true"/>
    <name>VoiceInteractionSearchAndPlay</name>
    <tizen:privilege name="http://developer.samsung.com/privilege/productinfo"/>
    <tizen:privilege name="http://tizen.org/privilege/application.launch"/>
    <tizen:privilege name="http://tizen.org/privilege/internet"/>
    <tizen:privilege name="http://tizen.org/privilege/tv.inputdevice"/>   
    <tizen:privilege name="http://developer.samsung.com/privilege/voicecontrol"/>
    <tizen:privilege name="http://developer.samsung.com/privilege/microphone"/>
    <tizen:profile name="tv-samsung"/>
    <tizen:setting screen-orientation="landscape" context-menu="enable" background-support="enable" encryption="disable" install-location="auto" hwkey-event="enable"/>
</widget>
``` 
* We are handling most of the above specified features with both a basic UI and voice commands. For the features that have no UI option, a method was developed to provide support through voice command only. With that in mind, we move forward with the basic steps provided by the web API spec.

1. Every voice interaction application should implement a callback function, so that the Assistant can operate the controls. Your application must declare the corresponding voice interaction callbacks. After the window has loaded, passing the callback in webapis.voiceinteraction.setCallback and calling webapis.voiceinteraction.listen, interaction with the assistant will be possible.
2. setCallback function example code:
```
window.onload(function() {
     var callback = {
          ...
          onupdatestate : function () {
              ...
          },
          onplay : function () {
              ...
          },
          ...
     };
     ...
     webapis.voiceinteraction.setCallback(callback);
})
```
NOTE: All callback functions must be passed as parameters for the webapis.voiceinteraction.setCallback function. These callback functions must only be included if you intend to overwrite their default behavior, otherwise, the only mandatory callback function you must explicitly include is onupdatestate.

4. The listen function must be called after the webapis.voiceinteraction.setCallback function. Example code:
```
window.onload(function () {
    ...
    webapis.voiceinteraction.setCallback(callback);
    webapis.voiceinteraction.listen();
    ...
})
```
4. You must specify the current application status inside the Appstate function within the callback function in order to get the proper voice control from the Voice Assistant. This function is called just before any utterance is processed, so that the Voice Assistant can be aware of the status dynamically. The status can affect a callback function, therefore it's important to return the status as the application's real status.
```
webapis.voiceinteraction.setCallback({
   onupdatestate : function () {
     console.log("Assistant tries to get app state");
     return "List";
   }
});
```
5. Possible application states:

| Voice Application State | Description | Feature |
| ----------------------- | ------------- | ------ |
| "None"              | Application Default Status. | Same with "Player" Status | 
| "List"              | The status of the application showing something as a list. | Based on this status, "Play this", "Play" will work as calling onselection(0), "Previous" will work as calling onnavigation("NAV_PREVIOUS") |
| "Player"              | The status of the application playing content. | Based on this status, "Play this" will work as calling onplay() |

7. In order to support playback control via voice, the application should have the following callbacks. If any of the following callback functions are not included in your application, the following Key Events will be generated.

| Utterance | TV Default Actions | Callback |
| --------- | -------------- | ---------- |
| "Play" | Generate the Remote Control Key, "MediaPlay" | boolean ? onplay () |
| "Stop" | Generate the Remote Control Key, "MediaStop" | boolean ? onstop () |
| "Fastforward" | Generate the Remote Control Key, "MediaFastForward" | boolean ? onfastforward () |
| "Rewind" | Generate the Remote Control Key, "MediaRewind" | boolean ? onrewind () |
| "Pause" | Generate the Remote Control Key, "MediaPlayPause" | boolean ? onpause () |
| "Exit" | Generate the Remote Control Key, "Exit" | boolean ? onexit () |

Media Control example code:

```
webapis.voiceinteraction.setCallback({
    ...
    onplay : function () {
        console.log("OnPlay"); return true;
    },
    onstop: function () {
        console.log("OnStop"); return true;
    },
    ...
```
NOTE: All callbacks except AppState and OnSearchCollection have a return value that represents the flag for support. If the return value is false or there isn't a callback function for the utterance, Samsung TV will perform its basic function.

8. In order to support navigation & selection control via voice, the application should have the following callbacks:

| Utterance | Callback |
| --------- | -------- |
| "Move right", "Down", "Left" | void onnavigation(VoiceNavigation vn) |
| "The First", "Second", "Fifth" | void onselection(VoiceSelection vo) |

Navigation & Selection example code:
```
webapis.voiceinteraction.setCallback({
    ...
    onnavigation : function (vn) {
        var bSupport = true;
        console.log("OnNavigation: " + vn);
        switch(vn) {
          case "NAV_PREVIOUS":
            //Previous
            break;
          case "NAV_NEXT":
            //Next
            break;
          case "NAV_LEFT":
            //Left
            break;
          case "NAV_RIGHT":
            //Right
            break;
          case "NAV_UP":
            //Up
            break;
          case "NAV_DOWN":
            //Down
            break;
          case "NAV_SHOW_MORE":
            //ShowMore
            break; 
          default:
            bSupport = false;
            break;
         }
         return bSupport;
    },
    onselection : function (vo) {
        var bSupport = true;
        console.log("OnSelection: " + vo);
        switch(vo) {
            case -1:
              //Select the last item of this page
              break;
            case 0:
              //Select this item on focus
              break;
            default:
            {
              if(vo >= 1)
              {
                  //Select the (vo)th item
                  console.log("For Ordinal : " + vo);
              }
              else
              {
                  bSupport = false;
              }
            }
            break;
        }
        return bSupport;
    },
    ...
```
9. If your application contains the search engine, your app can support the search utterance. In order to support search and selection by title via voice, the application should have the following callbacks.

| Utterance | Callback |
| --------- | -------- |
| "Search NCIS", "Search Titanic" | boolean ? onsearch(VoiceSearchTerm voiceSearchTerm) |
| "NCIS", "Titanic" | boolean ? ontitleSelection(string title) (UPCOMING FEATURE) |

 Search & OnTitleSelection example code:
 ```
 webapis.voiceinteraction.setCallback({
    ...
    ontitleselection : function (title) {
        Log("OnTitleSelection" + title);
        //For "Select NCIS" utterance, title is "NCIS"
        return true;
    },
    onsearch : function (vt) {
        console.log("OnSearch " + vt);
        //vt is json structure of search term
        //{
        // search_version: “1.6.0”,
        // search_terms:
        //  [
        //   { "field": “utterance", "keyword": “Search for Avengers” },
        //   { "field": “title", "keyword": “Avengers” }
        //  ]
        //
        var title = webapis.voiceinteraction.getStringDataFromSearchTerm(vt, webapis.voiceinteraction.VoiceSearchTermField.SEARCH_TERM_TITLE);
        var genre = webapis.voiceinteraction.getStringDataFromSearchTerm(vt, webapis.voiceinteraction.VoiceSearchTermField.SEARCH_TERM_GENRE);
        my_search_from_search_term(title);
        return true;
    }
    …
```
 
