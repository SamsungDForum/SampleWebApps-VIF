# Requirements

## Tizen manifest configuration
>
> [!IMPORTANT]
> The next information MUST be included for the VIF to work

The next privileges are required in your `config.xml` file.

  1. voicecontrol:

    ```xml
    <tizen:privilege name="<http://developer.samsung.com/privilege/voicecontrol"/>>
    ```

  2. microphone:

    ```xml
    <tizen:privilege name="<http://developer.samsung.com/privilege/microphone"/>>
    ```

The required version must be at least `v6.0` for the web-API to work with your application

  e.g. `config.xml`

  ```xml
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

For the features that have no UI option, a method was developed to provide support through voice command only.
