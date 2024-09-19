# Media Callback Functions

In order to support playback control via voice, the application should have the following callbacks.

> [!IMPORTANT]
> If any of the following callback functions are not included in your application, the listed Key Events will be generated.

| Utterance | TV Default Actions | Callback |
| --------- | -------------- | ---------- |
| "Play" | Generate the Remote Control Key, "MediaPlay" | boolean ? onplay () |
| "Stop" | Generate the Remote Control Key, "MediaStop" | boolean ? onstop () |
| "Fastforward" | Generate the Remote Control Key, "MediaFastForward" | boolean ? onfastforward () |
| "Rewind" | Generate the Remote Control Key, "MediaRewind" | boolean ? onrewind () |
| "Pause" | Generate the Remote Control Key, "MediaPlayPause" | boolean ? onpause () |

e.g. Media control

```javascript
webapis.voiceinteraction.setCallback({
    ...
    onplay : function () {
        console.log("OnPlay"); return true;
    },
    onstop: function () {
        console.log("OnStop"); return true;
    },
    ...
})
```

> [!NOTE]
> All callbacks except AppState have a return value that represents the flag for support. If the return value is false or there isn't a callback function for the utterance, Samsung TV will perform its basic function.
