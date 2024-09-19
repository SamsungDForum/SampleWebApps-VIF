# Search

If your application contains the search engine, your app can support the search utterance. In order to support search and selection by title via voice, the application should have the following callbacks:

| Utterance | Callback |
| --------- | -------- |
| "Search NCIS", "Search Titanic" | boolean ? onsearch(VoiceSearchTerm voiceSearchTerm) |
| "NCIS", "Titanic" | boolean ? ontitleSelection(string title) |
| - | DOMString ? onrequestcontentcontext() |

e.g. Search & OnTitleSelection

  ```javascript
  webapis.voiceinteraction.setCallback({
      ...
      onrequestcontentcontext : function () {
      Log("onrequestcontentcontext ");
      var result = [];
      try {
        var item = webapis.voiceinteraction.buildVoiceInteractionContentContextItem(1,1,"test", ["test set", "test title"], true);
        result.push(item);
        var item2 = webapis.voiceinteraction.buildVoiceInteractionContentContextItem(2,1,"test2", ["test set 2", "test title 2"], false);
        result.push(item2);
      } catch (e) {
        console.log("exception [" + e.code + "] name: " + e.name + " message: " + e.message);
      }
    return webapis.voiceinteraction.buildVoiceInteractionContentContextResponse(result);
    },
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
      ...
      })
  ```

> [!NOTE]
> The `onrequestcontentcontext` function is required in order for `ontitleselection` to function properly. If title selection is a desired feature for your app, make sure to implement both `onrequestcontentcontext` and `ontitleselection` functions.
