# Navigation & Selection Callback Functions

In order to support navigation & selection control via voice, the application should have the following callbacks:

| Utterance | Callback |
| --------- | -------- |
| "Move right", "Down", "Left" | void onnavigation(VoiceNavigation vn) |
| "The First", "Second", "Fifth" | void onselection(VoiceSelection vo) |

e.g. Navigation & Selection

  ```javascript
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
  })
  ```
