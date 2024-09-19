# Callback Function

Every voice interaction should implement a callback function. This allows the Voice Assistant to operate the controls

1. Your application must declare the corresponding voice interaction callbacks
2. Once window loads:
   * Pass the callback to `webapis.voiceinteraction.setCallback`
   * Call `webapis.voiceinteraction.listen()`
3. This will allow the interaction with the Voice Assistant

  e.g. setCallback

  ```javascript
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

> [!NOTE]
> All callback functions must be passed as parameters for the `webapis.voiceinteraction.setCallback` function. These callback functions must only be included if you intend to overwrite their default behavior, otherwise, the only mandatory callback function you must explicitly include is `onupdatestate`

The `listen()` function must be called after the `webapis.voiceinteraction.setCallback` function.

  e.g. listen()

  ```javascript
  window.onload(function () {
      ...
      webapis.voiceinteraction.setCallback(callback);
      webapis.voiceinteraction.listen();
      ...
  })
  ```

In order to get the proper voice control from the Voice Assistant, you must declare the app status inside the callback function as an Appstate function:

  e.g.

  ```javascript
  webapis.voiceinteraction.setCallback({
    onupdatestate : function () {
      console.log("Assistant tries to get app state");
      return "List";
    }
  });
  ```

> [!NOTE]
> This function is called just before any utterance is processed, so that the Voice Assistant can be aware of the status dynamically. The status can affect a callback function, therefore it's important to return the status as the application's real status.

Possible application states:

| Voice Application State | Description | Feature |
| ----------------------- | ------------- | ------ |
| "None"              | Application Default Status. | Same with "Player" Status |
| "List"              | The status of the application showing something as a list. | Based on this status, "Play this", "Play" will work as calling onselection(0); "Previous" will work as calling onnavigation("NAV_PREVIOUS") |
| "Player"              | The status of the application playing content. | Based on this status, "Play this" will work as calling onplay() |
