/*jshint undef: false*/
list_faq = [
    {
        "id": 1,
        "question": "How can I find out if a specific TV device is compatible with the VIF API?",
        "answer": "VIF API should be available starting from 2021 TV devices running TIZEN 6.0 and above, with the exception of ontitleselection, onrequestcontentcontext, onadditiontolist, onremovalfromlist features which require TIZEN 6.5 (2022+ TV devices) and above. <br><br> https://developer.samsung.com/smarttv/develop/specifications/tv-model-groups.html"
    },
    {
        "id": 2,
        "question": "Can I define a callback function inside my application but also use its default behavior?",
        "answer": "Yes, as long as the return value is false/undefined, then the default action (when available) should trigger when its corresponding voice command is used."
    },
    {
        "id": 3,
        "question": "Can any keyword be used as a title value for ontitleselection?",
        "answer": "Yes, as long as the keyword or alias text has been included as part of the current content context (onrequestcontentcontext). Otherwise, keywords such as channel names (CNN, FOX, CBS, etc.) or system keywords (Settings, Search, etc.) will be intercepted by the voice assistant."
    },
    {
        "id": 4,
        "question": "Is error handling available for specific callback functions?",
        "answer": "Unlike the <b>VoiceInteractionManager</b> functions, the callback functions themselves do not return specific Exceptions. A workaround for this is to add console logs for debugging purposes."
    }
];