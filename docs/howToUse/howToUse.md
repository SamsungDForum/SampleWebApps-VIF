# How to use

## Search

* Search page allows you to utter `commands` such as:

  e.g.
    > "Search for Titanic", "Search for Drama"

* `Search by` criteria:

  * Title
  * Genre
  * Cast
  * Year of release
  * Multiple combinations are permitted

  e.g.
    > "search Alice in Wonderland with Johnny Depp" (title/cast)
    > "search comedy films with Jim Carrey from 1996" (genre/cast/year)
    > "search horror tv shows from 2000" (genre/year)

## Navigation

* You can navigate using the `remote` control `buttons`:

  * Up
  * Down
  * Left
  * Right

* Navigate to items uttering voice commands such as:

  e.g
    > "move up", "move down", "left", "right"

* `Alternative` utterances for multiple content results:

  e.g.
    > "next page", "previous page", "show more"

## Selection by title

* While using the `remote control`, pressing your `Enter` button should select the item
* To select the item using voice commands, uttering the `title` name should work:
  e.g.
    > "Avatar" (should select Avatar)
    > "Titanic" (should select Titanic)

## Ordinal selection

* This method should bring up the details page for the item selected
* In order to select an item simply utter its `ordinal` position:

  e.g.
    > "first", "second", "fifth", "last", etc.

## Media controls

* While `media player` is displayed, you can utter the next commands:

  e.g.
    > "Play", "Pause", "Fastforward", "Rewind", "Stop"

## Some Example Utterances

### List state

|Function|Utterances|Expected Result|
|--------|----------|---------------|
|Search|"Search drama", "Search Avatar", "Search movies with robert de niro", "Search movies from 2009"|Display a collection of content tiles (items) relevant to the search query.|
|Navigation|"Move up", "Down", "Move right 4 times", "Move left", "Show more"|Move the focus to another selectable item on screen.|
|Selection|"Select this", "Select the third one"|Select the item with focus or the item that matches the ordinal value given.|
|Title Selection|"Select Titanic", "Choose Caroline"|Select the item (or display a toast message) that contains a keyword match from the user's utterance.|

### Player state (Media Player)

|Function|Utterances|Expected Result|
|--------|----------|---------------|
|`onplay`|"Play", "Resume"|Reproduce the currently available media.|
|`onpause`|"Pause"|If media is playing, pause the content.|
|`onstop`|"Stop"|If media is playing, stop the content.|
|`onfastforward`|"Fast forward", "Fast forward 1 minute", "Fast forward 30 seconds"|If media is playing or paused, fast forward content depending on the command parameters.|
|`onrewind`|"Rewind", "Rewind 2 minutes", "Rewind 20 seconds"|If media is playing or paused, rewind content depending on the command parameters.|
|`onskipforward`|"Skip forward", "Skip forward 40 seconds"|If media is playing or paused, skip the content forward (similar to onfastforward).|
|`onskipbackward`|"Skip backward", "Skip backward 20 seconds"|If media is playing or paused, skip the content backward (similar to onrewind).|
|`onchangenexttrack`|"Next", "Next video"|Change to the next available media content to stream.|
|`onchangeprevioustrack`|"Previous", "Previous video"|Change to the previous available media content to stream.|
|`onrestart`|"Restart", "Restart video"|Set the media player seek bar value to 0, effectively restarting the content to the beginning.|
|`onchangesubtitlemode`|"Turn on subtitles", "Turn off subtitles"|Toast message will indicate the value of the parameter given for this command (e.g. ON or OFF).|
|`onsetplayposition`|"Play from 10 seconds", "Play from 1 minute"|Set the media player seek bar value to the parameter value given for this command.|
|`onchangeshufflemode`|"Shuffle ON", "Shuffle OFF"|Toast message will indicate the value of the parameter given for this command (e.g. ON or OFF).|
|`onchangescreenfitmode`|"Screen fit mode ON", "Screen fit mode OFF"|Toast message will indicate the value of the parameter given for this command (e.g. ON or OFF).|
|`onzoom`|"Zoom in", "Zoom out"|Toast message will indicate the value of the parameter given for this command (e.g. IN or OUT).|
|`onrotate`|"Rotate left", "Rotate right"|Toast message will indicate the value of the parameter given for this command (e.g. LEFT or RIGHT).|
|`onchange360mode`|"360 mode ON", "Turn OFF 360 mode"|Toast message will indicate the value of the parameter given for this command (e.g. ON or OFF).|
|`onchangerepeatmode`|"Repeat one", "Media repeat all", "Media repeat OFF"|Toast message will indicate the value of the parameter given for this command (e.g. OFF, ONE or ALL).|
