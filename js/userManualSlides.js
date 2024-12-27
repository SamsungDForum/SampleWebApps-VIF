/****************POPULATE SLIDES WITH CORRECT INFORMATION********************/
var domContentLoaded = 'DOMContentLoaded';
document.addEventListener(domContentLoaded, function () {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  const slidesData = {
    media_controls: [
      { id: "1", title: "Media Controls", description: "To manipulate a media player's behavior. Use voice commands such as the following:", examples: ["'Play'", "'Stop'", "'Rewind'", "'Fast forward'", "'Pause'"], imageSrc: "images/userManual/media_controls.png" },
    ],
    selection: [
      { id: "1", title: "Selection - Ordinal Index", description: "To select content on the screen that currently has focus or whose ordinal index matches with the user's voice command parameter. Use voice commands such as the following:", examples: ["'Select this'", "'Select the first one'", "'Select the second one'", "'Select the last one'", "", ""], imageSrc: "images/userManual/selection_1.png" },
      { id: "2", title: "Selection - Title", description: "To select content on the screen by title. Use voice commands such as the following:", examples: ["'Select Dunkirk'", "'Choose Avatar'", "", "", ""], imageSrc: "images/userManual/selection_2.png" },
    ],
    navigation: [
      { id: "1", title: "Navigation", description: "To navigate media content. Use voice commands such as the following:", examples: ["'Next page'", "'Previous page'", "'Go left'", "'Move right three times'", ""], imageSrc: "images/userManual/navigation_1.png" },
      { id: "2", title: "Navigation", description: "To navigate more media content. Use voice commands such as the following:", examples: ["'Show me more'", "'Move up'", "'Move down'", "", ""], imageSrc: "images/userManual/navigation_2.png" },
    ],
    search: [
      { id: "1", title: "Search - Title", description: "To make search queries by title. Use voice commands such as the following:", examples: ["'Search Titanic'", "'Search Malcolm in the middle'", "'Search Avatar'", "", ""], imageSrc: "images/userManual/search_title.png" },
      { id: "2", title: "Search - Cast", description: "To make search queries by cast. Use voice commands such as the following:", examples: ["'Find movies with Robert Downey Jr'", "'Search TV shows with Jennifer Aniston'", "'Search Adam Sandler'", "", ""], imageSrc: "images/userManual/search_cast.png" },
      { id: "3", title: "Search - Genre", description: "To make search queries by genre. Use voice commands such as the following:", examples: ["'Search action movies'", "'Find drama TV shows'", "'Search thriller films'", "", ""], imageSrc: "images/userManual/search_genre.png" },
      { id: "4", title: "Search - Release Date", description: "To make search queries by release date. Use voice commands such as the following:", examples: ["'Search Movies from 2009'", "'Search TV shows from 2014'", "", "", ""], imageSrc: "images/userManual/search_date.png" },
      { id: "5", title: "Search - Utterances", description: "To make search queries by utterances and/or multiple filters. Use voice commands such as the following:", examples: ["'Search action films from 2009'", "'Search action TV shows with Emilia Clarke'", "", "", ""], imageSrc: "images/userManual/search_mixed.png" },
    ]
  };

  const carouselSlides = document.getElementById('carousel-slides');
  const data = slidesData[category] || [];

  data.forEach(function (slides) {
    const slideDiv = document.createElement('div');
    slideDiv.classList.add('slide');
    slideDiv.innerHTML =
      '<div class="dataBox">' +
      '<h2>' + slides.title + '</h2>' +
      '<p class="descriptionText">' + slides.description + '</p>' +
      '<ul class="dataBoxUl">' +
      '<li class="examplesText">' + slides.examples[0] + '</li>' +
      '<li class="examplesText">' + slides.examples[1] + '</li>' +
      '<li class="examplesText">' + slides.examples[2] + '</li>' +
      '<li class="examplesText">' + slides.examples[3] + '</li>' +
      '<li class="examplesText">' + slides.examples[4] + '</li>' +
      '</ul>' +
      '</div>' +
      '<img src="' + slides.imageSrc + '" alt="' + slides.title + ' image" width="700px" style="margin-right: 2rem;">';
    carouselSlides.appendChild(slideDiv);
  });

  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const currentSlideElement = document.getElementById('current-slide');
  const totalSlidesElement = document.getElementById('total-slides');
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  document.getElementById('total-slides').textContent = data.length;

  let currentIndex = 0;

  function updateCounter() {
    currentSlideElement.textContent = currentIndex + 1;
    totalSlidesElement.textContent = totalSlides;
  }

  function moveCarousel(index) {
    carouselSlides.style.transform = 'translate(-' + (index * 100) + '%)';
    updateCounter();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    moveCarousel(currentIndex);
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    moveCarousel(currentIndex);
  }

  function returnButton() {
    window.location.href = 'userManualMenu.html';
  }

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  /******************** CONTROLS/NAVIGATION ********************/
  // Used as the index for the options buttons

  function registerKeys() {
    var usedKeys = [
      "ColorF0Red",
      "ColorF1Green",
      "ColorF2Yellow",
      "ColorF3Blue"
    ];
    usedKeys.forEach(
      function (keyName) {
        try {
          tizen.tvinputdevice.registerKey(keyName);
        } catch (error) {
          console.log("Failed to register " + keyName + ": " + error);
        }
      }
    );
  }

  function itemSelected() {
    document.activeElement.click();
  }

  // Initialize voice web api
  function voiceInteractionInit() {
    console.log("ENTERED voiceInteractionInit FUNCTION");
    try {
      webapis.voiceinteraction.setCallback(
        {
          onupdatestate: function () {
            console.log("AppState Called");
            // "None" - Application Default Status - None
            // "List" - The status of application showing something in list - Voice Navigation, Selection
            // "Player" - The status of application playing a content - Voice Media Control
            return "List";
          },
          onchangeappstate: function (state) {
            console.log("onchangeappstate : " + state);
            var bSupport = true;
            switch (state) {
              case "Home":
                window.location.href = 'index.html';
                break;
              case "Setting":
                break;
              case "Search":
                break;
              default:
                break;
            }
            return bSupport;
          },
          onnavigation: function (voiceNavigation) {
            var bSupport = true;
            console.log("onnavigation : " + voiceNavigation);
            switch (voiceNavigation) {
              case "NAV_PREVIOUS":
                prevSlide();
                break;
              case "NAV_NEXT":
                nextSlide();
                break;
              case "NAV_LEFT":
                prevSlide();
                break;
              case "NAV_RIGHT":
                nextSlide();
                break;
              case "NAV_UP":
                break;
              case "NAV_DOWN":
                break;
              case "NAV_SHOW_MORE":
                break;
              default:
                break;
            }
            return bSupport;
          },
          onselection: function (voiceSelection) {
            var bSupport = true;
            console.log("onselection : " + voiceSelection);
            switch (voiceSelection) {
              case -1:
                break;
              case 0:
                itemSelected();
                break;
              default:
                {
                }
                break;
            }
            return bSupport;
          },
        });
    } catch (err) {
      console.log("SETCALLBACK FUNCTION FAILED: " + err.message);
    }
    try {
      webapis.voiceinteraction.listen();
      console.log("LISTEN FUNCTION CALLED");
    } catch (err) {
      console.log("LISTEN FUNCTION FAILED: " + err.message);
    }
  }

  document.body.addEventListener('keydown', function (e) {
    console.log("Received key: " + e.keyCode);
    switch (e.keyCode) {
      case 37: // Left
        prevSlide();
        break;
      case 39: // Right
        nextSlide();
        break;
      case 10009: // RETURN button
        returnButton();
        break;
      default: console.log("Unhandled keycode: " + e.keyCode);
        break;
    }
  });

  updateCounter();

  // Initialize function
  var init = function () {
    registerKeys();
    voiceInteractionInit();
  };

  window.onload = init;
});
