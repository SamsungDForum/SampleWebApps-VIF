/*jshint bitwise: false*/
/*jshint undef: false*/

/******************** GLOBAL VARIABLES ********************/
// Saves title data used to search by title
var title = "";
// Saves a collection of cast member keywords to search by cast
var cast = [];
// Saves a collection of genre keywords to search by genre
var genre = [];
// Saves the objects obtained from the getMovie function
var result = [];
// Saves the objects that are of type Movie
var resultMovie = [];
// Saves the objects that are of type TV
var resultTV = [];
// Saves the year value used to search by year
var year = -1;
// Used as the index for the card results, where 0 is the index of the first (leftmost) card item. This card item (DIV) will have the focus
var focusIndex = 0;
// Index used to indicate the position of a movie element
var movieIndex = 0;
// Index used to indicate the position of a tv element
var tvIndex = 0;
// Index used to indicate the vertical position of the focus
var rowIndex = 0;
// Get search bar element
var input = document.getElementById("searchBar");
// Variable used for the toast appearance
var setTimer;
// Boolean to determine if Y scroll is at the top or not
var scrolledUp = true;
// Boolean to enable and disable key press
var buttonEnabled = true;
// Variable to determine the content type of a search query
var contentType = "None";
// Flag that toggles the toast messages ON and OFF
var toastMessageIsOn;

/******************** FUNCTIONS ********************/
// Register remote control keys in order for the application to react accordingly
function registerKeys(){
	var usedKeys = [
	    "Exit",
	    "ColorF0Red",
	    "ColorF1Green",
	    "ColorF2Yellow",
	    "ColorF3Blue"
	];
	usedKeys.forEach(
	  	function (keyName){
	  		try {
	  			tizen.tvinputdevice.registerKey(keyName);
	  	    } catch(error) {
	  	        console.log("Failed to register " + keyName + ": " + error);
	  	    }
	  	}
	);
}
// Filter through the keywords and find a match within the database
function getMovie(keyword) {
	console.log("getMovie Keyword : " + keyword);
	var results = [];
	// Filter by title
	films.forEach(function (arrayItem) {
	    var itemTitle = arrayItem.title;
	    console.log(itemTitle);
	    if(itemTitle.toLowerCase().includes(keyword.toLowerCase())){
	    	console.log("ADDED CONTENT BY TITLE");
	    	results.push(arrayItem);
	    }
	});
	// Filter by cast
	films.forEach(function (arrayItem) {
	    var castArray = arrayItem.cast;
	    for(var i=0; i<castArray.length; i++){
	    	if(castArray[i].toLowerCase().includes(keyword.toLowerCase()) && keyword.length > 2){
	    		console.log("ADDED CONTENT BY CAST");
	    		results.push(arrayItem);
		    }	
	    }
	});
	// Filter by genre
	films.forEach(function (arrayItem) {
	    var genreArray = arrayItem.genre;
	    for(var i=0; i<genreArray.length; i++){
	    	if(genreArray[i].toLowerCase().includes(keyword.toLowerCase()) && keyword.length > 1){
	    		console.log("ADDED CONTENT BY GENRE");
	    		results.push(arrayItem);
		    }	
	    }
	});
	// Filter by year
	films.forEach(function (arrayItem) {
	    var itemYear = arrayItem.year;
	    if(keyword === itemYear.toString()){
	    	console.log("ADDED CONTENT BY YEAR");
	    	results.push(arrayItem);
	    }
	});
	return results;
}
// Seperate Movie and TV type content and dump them into their designated arrays
function filterByType(){
	for(var i=0; i<result.length; i++){
		if(result[i].type === "Movie"){
			resultMovie.push(result[i]);
		} else if(result[i].type === "TV"){
			resultTV.push(result[i]);
		}
	}
}
// Produce results given the input text
function getInputText(){
	var leftPositionCounter;
	year = -1;
	contentType = "None";
	result = [];
	resultMovie = [];
	resultTV = [];
	var inputText = document.getElementById("searchBar").value;
	var inputArray = inputText.split(" ");
	// Filter out certain keywords when doing a manual search (no voice commands)
	for(var y=0; y<inputArray.length; y++){
		console.log(inputArray[y]);
		if(isNaN(inputArray[y].toLowerCase()) === false){
			year = parseInt(inputArray[y], 10);
		}
		if(inputArray[y].toLowerCase() === "film" || inputArray[y].toLowerCase() === "films" || inputArray[y].toLowerCase() === "movie" || inputArray[y].toLowerCase() === "movies"){
			contentType = "Movie";
		}
		if(inputArray[y].toLowerCase() === "series" || inputArray[y].toLowerCase() === "tv" || inputArray[y].toLowerCase() === "show" || inputArray[y].toLowerCase() === "shows"){
			contentType = "TV";
		}
		if(inputArray[y].toLowerCase() === "me" || inputArray[y].toLowerCase() === "a" || inputArray[y].toLowerCase() === "i" || inputArray[y].toLowerCase() === "or"){
			continue;
		}
		result = result.concat(getMovie(inputArray[y]));
	}
	console.log("LENGTH OF RESULT ARRAY: " + result.length);
	// Filter to remove duplicates
	if(result.length > 1){
		for(var preIndex=0; preIndex<result.length; preIndex++){
			for(var postIndex=(preIndex+1); postIndex<result.length; postIndex++){
				if(preIndex !== postIndex){
					if(result[preIndex].id === result[postIndex].id){
						console.log("REMOVED " + result[postIndex].title);
						result.splice(postIndex, 1);
						postIndex--;
					}
				}
			}
		}	
	}
	var typeIndex;
	// If the year does not match, remove element from result list
	if(year !== -1){
		for(typeIndex=0; typeIndex<result.length; typeIndex++){
			if(result[typeIndex].year !== year){
				console.log("REMOVED FOR NOT MATCHING YEAR");
				result.splice(typeIndex, 1);
				typeIndex--;
			}
		}
	}
	// Filter by content type
	console.log(contentType.toLowerCase());
	switch(contentType.toLowerCase()){
		case "movie": 	console.log("MOVIE CASE");
						for(typeIndex=0; typeIndex<result.length; typeIndex++){
							if(result[typeIndex].type.toLowerCase() === "tv"){
								result.splice(typeIndex, 1);
								typeIndex--;
							}
						}
						break;
		case "tv":		console.log("TV CASE");
						for(typeIndex=0; typeIndex<result.length; typeIndex++){
							if(result[typeIndex].type.toLowerCase() === "movie"){
								result.splice(typeIndex, 1);
								typeIndex--;
							}
						}
						break;
	}
	filterByType();
	console.log("TOTAL: " + result.length);
	console.log("MOVIE: " + resultMovie.length);
	console.log("TV: " + resultTV.length);
	var toPrint = buildHTMLresult(result, "ALL");
	var toPrintMovies = buildHTMLresult(resultMovie, "MOVIE");
	var toPrintTV = buildHTMLresult(resultTV, "TV");
	// If no films were found, display a text message
	if(result.length === 0){
		document.getElementById("resultTitle").innerHTML = "<p>No results for " + inputText + "</p>";
		document.getElementById("inputResult").innerHTML = "";
		document.getElementById("movieResult").innerHTML = "";
		document.getElementById("tvResult").innerHTML = "";
		document.getElementById("movie").style.visibility = "hidden";
		document.getElementById("tv").style.visibility = "hidden";
	} else {
		focusIndex = 0;
		movieIndex = 0;
		tvIndex = 0;
		rowIndex = 1;
		// Start inserting html for the top results container div
		document.getElementById("resultTitle").innerHTML = "<p>Top results for " + inputText + "</p>";
		document.getElementById("inputResult").innerHTML = toPrint;
		document.getElementsByClassName("card")[focusIndex].style.left = "34px";
		if(resultMovie.length > 0 && resultTV.length <= 0){
			document.getElementById("movieResult").innerHTML = toPrintMovies;
			document.getElementsByClassName("mCard")[focusIndex].style.left = "34px";
			document.getElementById("movieResult").style.visibility = "visible";
			document.getElementById("movie").style.visibility = "visible";
			document.getElementById("movie").innerHTML = "<p>Movies</p>";
			document.getElementById("tvResult").style.visibility = "hidden";
			document.getElementById("tv").style.visibility = "hidden";
			document.getElementById("tvResult").innerHTML = "";
		} else if(resultMovie.length > 0){
			document.getElementById("movieResult").innerHTML = toPrintMovies;
			document.getElementsByClassName("mCard")[focusIndex].style.left = "34px";
			document.getElementById("movieResult").style.visibility = "visible";
			document.getElementById("movie").style.visibility = "visible";
			document.getElementById("movie").innerHTML = "<p>Movies</p>";
			document.getElementsByClassName("mCard")[focusIndex].style.left = "34px";
		} else {
			document.getElementById("tv").style.visibility = "hidden";
			document.getElementsByClassName("card")[focusIndex].style.left = "34px";
			document.getElementById("movie").innerHTML = "<p>TV Shows</p>";
		}
		// If no elements exist in the movie array, use the movieResult div to insert the tv elements
		if(resultTV.length > 0 && resultMovie <= 0){
			document.getElementById("movieResult").innerHTML = toPrintTV;
			//document.getElementById("tv").style.top = "34em";
			document.getElementById("tv").style.visibility = "hidden";
			document.getElementById("movie").style.visibility = "visible";
			document.getElementById("movie").innerHTML = "<p>TV Shows</p>";
			document.getElementsByClassName("tCard")[focusIndex].style.left = "34px";
			document.getElementById("tvResult").style.visibility = "hidden";
			document.getElementById("tvResult").innerHTML = "";
		} else if(resultTV.length > 0){			
			document.getElementById("tvResult").innerHTML = toPrintTV;
			document.getElementsByClassName("tCard")[focusIndex].style.left = "34px";	
			document.getElementById("tv").style.visibility = "visible";
			document.getElementById("tvResult").style.visibility = "visible";
			//document.getElementById("tv").style.top = "61em";
		} else {
			document.getElementById("tvResult").style.visibility = "hidden";
			document.getElementById("tv").style.visibility = "hidden";
			//document.getElementById("tv").style.top = "61em";
			document.getElementById("tvResult").innerHTML = "";
		}
		// Give every card a different x coordinate for the top results container
		if(result.length > 1){
			leftPositionCounter = 476;
			for(var i=1; i<result.length; i++){
				document.getElementsByClassName("card")[i].style.left = leftPositionCounter.toString() + "px";
				leftPositionCounter += 442;
			}
		}
		// Give every card a different x coordinate for the movie results container 
		if(resultMovie.length > 1){
			leftPositionCounter = 476;
			for(var j=1; j<resultMovie.length; j++){
				document.getElementsByClassName("mCard")[j].style.left = leftPositionCounter.toString() + "px";
				leftPositionCounter += 442;
			}
		}
		// Give every card a different x coordinate for the tv results container
		if(resultTV.length > 1){
			leftPositionCounter = 476;
			for(var k=1; k<resultTV.length; k++){
				document.getElementsByClassName("tCard")[k].style.left = leftPositionCounter.toString() + "px";
				leftPositionCounter += 442;
			}
		}
		// Focus on the first result
		document.getElementsByClassName("card")[focusIndex].focus();
		document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
	}
}
// Build the HTML syntax that will display the top content cards
function buildHTMLresult(inputArray, type){
	var toPrint = "";
	var startH;
	var midH = ")' title='Media Content' tabindex='0'>";
	var vod;
	// Create different 'card' divs according to the type of the result
	switch(type){
		case "ALL": startH = "<div class='card' onclick='videoClicked("; 
					vod = "<div class='vod'>VOD <img class='dots' src='images/whiteDots.png' /></div>";
					break;
		case "MOVIE":	startH = "<div class='mCard' onclick='videoClicked("; 
						vod = "<div class='vod'>VOD <img class='mDots' src='images/whiteDots.png' /></div>";
						break;
		case "TV":	startH = "<div class='tCard' aria-label='tv item' onclick='videoClicked("; 
					vod = "<div class='vod'>VOD <img class='tDots' src='images/whiteDots.png' /></div>";
					break;
	}
	const imgStart = "<img class='poster' src='";
	const altStart = "' alt='";
	const imgEnd = "'>";
	const endH = "</div>";
	const startTitle = "<div class='title'>";
	const startGenre = "<div class='genre'>";
	const endDiv = "</div>";
	var stringSeparator;
	// Begin adding html to form the result structure
	for(var i=0; i<inputArray.length; i++){
		toPrint += startH;
		toPrint += inputArray[i].id;
		toPrint += midH;
		toPrint += imgStart;
		toPrint += String(inputArray[i].url);
		toPrint += altStart;
		toPrint += String(inputArray[i].title);
		toPrint += imgEnd;
		toPrint += startTitle;
		toPrint += String(inputArray[i].title);
		toPrint += endDiv;
		toPrint += startGenre;
		stringSeparator = inputArray[i].genre.join(', '); 
		toPrint += stringSeparator;
		toPrint += endDiv;
		toPrint += vod;
		toPrint += endH;
	}
	return toPrint;
}
// Search function when input is received via microphone
function filter(vt){
	// Declare and/or reset variable values
	contentType = "None";
	title = "";
	cast = [];
	genre = [];
	year = -1;
	var toastText = "";
	var utterance;
	// Organize the parameters that will be used to search for the user's request
	/*****
	SEARCH_TERM_UTTERANCE	
	SEARCH_TERM_TITLE
	SEARCH_TERM_GENRE
	SEARCH_TERM_CAST
	SEARCH_TERM_CONTENT_TYPE
	SEARCH_TERM_RELEASE_DATE_FROM
	SEARCH_TERM_RELEASE_DATE_TO
	*****/
	var u = webapis.voiceinteraction.getDataFromSearchTerm(vt, "SEARCH_TERM_UTTERANCE");
	var t = webapis.voiceinteraction.getDataFromSearchTerm(vt, "SEARCH_TERM_TITLE");
	var g = webapis.voiceinteraction.getDataFromSearchTerm(vt, "SEARCH_TERM_GENRE");
	var c = webapis.voiceinteraction.getDataFromSearchTerm(vt, "SEARCH_TERM_CAST");
	var contType = webapis.voiceinteraction.getDataFromSearchTerm(vt, "SEARCH_TERM_CONTENT_TYPE");
	var dateFrom = webapis.voiceinteraction.getDataFromSearchTerm(vt, "SEARCH_TERM_RELEASE_DATE_FROM");
	//console.log("U: " + u.length + "\nT: " + t.length + "\nG: " + g.length + "\nC: " + c.length + "\nContentType: " + contType.length + "\nYear: " + dateFrom.length);
	if(u !== undefined){
		utterance = u;
		toastText += "<strong>Utterance:</strong> ";
		toastText += utterance; 
		toastText += "<br>";
	}
	if(t !== undefined && t.length > 0){
		title = t;
		toastText += "<strong>Title:</strong> "; 
		toastText += title; 
		toastText += "<br>";
		console.log("ADDED TITLE VALUE");
	}
	if(c !== undefined && c.length > 0){
		cast.push(c);
		toastText += "<strong>Cast:</strong> "; 
		toastText += cast[0]; 
		toastText += "<br>";
		console.log("ADDED CAST VALUE");
	}
	if(g !== undefined && g.length > 0){
		genre.push(g);
		toastText += "<strong>Genre:</strong> "; 
		toastText += genre; 
		toastText += "<br>";
		console.log("ADDED GENRE VALUE");
	}
	if(dateFrom !== undefined && dateFrom.length > 0){
		var tempYear = dateFrom.substring(0, 4);
		year = parseInt(tempYear);
		toastText += "<strong>Year:</strong> ";
		toastText += tempYear; 
		toastText += "<br>";
		console.log("ADDED YEAR VALUE");
	} 
	if(contType !== undefined && contType.length > 0){
		contentType = contType;
		toastText += "<strong>Content Type:</strong> ";
		toastText += contentType; 
		toastText += "<br>";
		console.log("ADDED CONTENT TYPE VALUE");
	}
	// Print out the parameters that were obtained from the voice interaction framework search feature 
	document.getElementById("desc").innerHTML += toastText;
	result = [];
	// Begin the process of getting film titles that correspond to the user's input
	var tempResult = [];
	var filterFlag = 0;
	var getMovieResult = [];
	// Get objects with the same title
	if(title !== ""){
		console.log("NON EMPTY TITLE: " + title);
		getMovieResult = getMovie(title);
		if(getMovieResult.length > 0){
			result = result.concat(getMovieResult);
			for(var titleIndex=0; titleIndex<result.length; titleIndex++){
				console.log("ADDED: " + result[titleIndex].title);
			}
		}
		filterFlag = filterFlag | 8;
	}
	
	// Get objects that include the name of a cast member
	if(cast.length > 0){
		for(castIndex=0; castIndex<cast.length; castIndex++){
			getMovieResult = [];
			getMovieResult = getMovie(cast[castIndex]);
			if(getMovieResult.length > 0){
				result = result.concat(getMovieResult);
				console.log("ADDED ALL TITLES THAT INCLUDE: " + cast[castIndex]);
			}
		}
		filterFlag = filterFlag | 4;
	}
	// Get objects that include the specified genre
	if(genre.length > 0){
		for(genreIndex=0; genreIndex<genre.length; genreIndex++){
			getMovieResult = [];
			
			getMovieResult = getMovie(genre[genreIndex]);
			if(getMovieResult.length > 0){
				result = result.concat(getMovieResult);
				console.log("ADDED ALL " + genre[genreIndex] + " TITLES");
			}
		}
		filterFlag = filterFlag | 2;
	}
	// Get objects from a specific year
	console.log("TYPE OF YEAR: " + typeof year);
	if(year !== -1){
		console.log("YEAR FLAG SHOULD ACTIVATE");
		getMovieResult = [];
		getMovieResult = getMovie(year.toString());
		if(getMovieResult.length > 0){
			result = result.concat(getMovieResult);
		}
		filterFlag = filterFlag | 1;
		console.log("YEAR FLAG ADDED");
	}
	/********** 
	Filter out all films using the user's input
	Using filterFlag value bits as flags where each bit represents a different state:
	8 7 6 5 4 3 2 1
	X X X X T C G Y
	X = UNUSED
	T = title
	C = cast
	G = genre
	Y = year 
	**********/
	// Declare index variables to filter through all the possible results regarding title, cast, genre and year
	var objectIndex, objectArrayIndex, castArrayIndex, genreArrayIndex, castIndex, genreIndex;
	console.log("FILTER FLAG: " + String(filterFlag));
	switch(filterFlag){
		// 1 just filter by year
		case 1: for(objectIndex=0; objectIndex<result.length; objectIndex++){
					if(result[objectIndex].year === year){
						tempResult.push(result[objectIndex]);
						console.log("ADDED " + year + " TO FINAL RESULT 1");
					}
				} break;
		// 2 just filter by genre
		case 2: for(objectIndex=0; objectIndex<result.length; objectIndex++){
					for(objectArrayIndex=0; objectArrayIndex<result[objectIndex].genre.length; objectArrayIndex++){
						for(genreIndex=0; genreIndex<genre.length; genreIndex++){
							if(result[objectIndex].genre[objectArrayIndex].toLowerCase() === genre[genreIndex].toLowerCase()){
								tempResult.push(result[objectIndex]);
								console.log("ADDED " + result[objectIndex].title + " TO FINAL RESULT 2");
							}
						}
					}
				} break;
		// 3 filter by genre and year
		case 3: for(objectIndex=0; objectIndex<result.length; objectIndex++){
					for(objectArrayIndex=0; objectArrayIndex<result[objectIndex].genre.length; objectArrayIndex++){
						for(genreIndex=0; genreIndex<genre.length; genreIndex++){
							if(result[objectIndex].genre[objectArrayIndex].toLowerCase() === genre[genreIndex].toLowerCase() && result[objectIndex].year === year){
								tempResult.push(result[objectIndex]);
								console.log("ADDED " + result[objectIndex].title + " TO FINAL RESULT 3");
							}
						}
					}
				} break;
		// 4 just filter by cast
		case 4: for(objectIndex=0; objectIndex<result.length; objectIndex++){
					for(objectArrayIndex=0; objectArrayIndex<result[objectIndex].cast.length; objectArrayIndex++){
						for(castIndex=0; castIndex<cast.length; castIndex++){
							if(result[objectIndex].cast[objectArrayIndex].toLowerCase().includes(cast[castIndex].toLowerCase())){
								tempResult.push(result[objectIndex]);
								console.log("ADDED " + result[objectIndex].title + " TO FINAL RESULT 4");
							}
						}
					}
				} break;
		// 5 filter by cast and year
		case 5: for(objectIndex=0; objectIndex<result.length; objectIndex++){
					for(objectArrayIndex=0; objectArrayIndex<result[objectIndex].cast.length; objectArrayIndex++){
						for(castIndex=0; castIndex<cast.length; castIndex++){
							if(result[objectIndex].cast[objectArrayIndex].toLowerCase().includes(cast[castIndex].toLowerCase()) && result[objectIndex].year === year){
								tempResult.push(result[objectIndex]);
								console.log("ADDED " + result[objectIndex].title + " TO FINAL RESULT 5");
							}
						}
					}
				} break;
		// 6 filter by cast and genre
		case 6: for(objectIndex=0; objectIndex<result.length; objectIndex++){
					for(castArrayIndex=0; castArrayIndex<result[objectIndex].cast.length; castArrayIndex++){
						for(genreArrayIndex=0; genreArrayIndex<result[objectIndex].genre.length; genreArrayIndex++){
							for(castIndex=0; castIndex<cast.length; castIndex++){
								for(genreIndex=0; genreIndex<genre.length; genreIndex++){
									if(result[objectIndex].cast[castArrayIndex].toLowerCase().includes(cast[castIndex].toLowerCase()) && result[objectIndex].genre[genreArrayIndex].toLowerCase() === genre[genreIndex].toLowerCase()){
										tempResult.push(result[objectIndex]);
										console.log("ADDED " + result[objectIndex].title + " TO FINAL RESULT 6");
									}
								}
							}
						}
					}
				} break;
		// 7 filter by cast, genre and year
		case 7: for(objectIndex=0; objectIndex<result.length; objectIndex++){
					for(castArrayIndex=0; castArrayIndex<result[objectIndex].cast.length; castArrayIndex++){
						for(genreArrayIndex=0; genreArrayIndex<result[objectIndex].genre.length; genreArrayIndex++){
							for(castIndex=0; castIndex<cast.length; castIndex++){
								for(genreIndex=0; genreIndex<genre.length; genreIndex++){
									if(result[objectIndex].cast[castArrayIndex].toLowerCase().includes(cast[castIndex].toLowerCase()) && result[objectIndex].genre[genreArrayIndex].toLowerCase() === genre[genreIndex].toLowerCase() && result[objectIndex].year === year){
										tempResult.push(result[objectIndex]);
										console.log("ADDED " + result[objectIndex].title + " TO FINAL RESULT 7");
									}
								}
							}
						}
					}
				} break;
		// 8 just filter by title
		case 8: for(objectIndex=0; objectIndex<result.length; objectIndex++){
					console.log("USER INPUT TITLE: " + title + " OBJECT TITLE: " + result[objectIndex].title);
					if(result[objectIndex].title.toLowerCase().includes(title.toLowerCase())){
						tempResult.push(result[objectIndex]);
						console.log("ADDED " + result[objectIndex].title + " TO FINAL RESULT 8");
					}
				} break;
	}
	// Filter to remove duplicates
	if(tempResult.length > 1){
		for(var preIndex=0; preIndex<tempResult.length; preIndex++){
			for(var postIndex=(preIndex+1); postIndex<tempResult.length; postIndex++){
				if(preIndex !== postIndex){
					if(tempResult[preIndex].id === tempResult[postIndex].id){
						console.log("REMOVED " + tempResult[postIndex].title);
						tempResult.splice(postIndex, 1);
						postIndex--;
					}
				}
			}
		}	
	}
	result = tempResult;
	// Filter by content type
	var typeIndex;
	switch(contentType.toLowerCase()){
		case "movie": 	for(typeIndex=0; typeIndex<result.length; typeIndex++){
							if(result[typeIndex].type.toLowerCase() === "tv"){
								result.splice(typeIndex, 1);
								typeIndex--;
							}
						}
						break;
		case "tv":		for(typeIndex=0; typeIndex<result.length; typeIndex++){
							if(result[typeIndex].type.toLowerCase() === "movie"){
								result.splice(typeIndex, 1);
								typeIndex--;
							}
						}
						break;
	}
	resultMovie = [];
	resultTV = [];
	// Display utterance in search bar
	var inputText = document.getElementById("searchBar");
	inputText.value = utterance;
	filterByType();
	console.log("TOTAL: " + result.length);
	console.log("MOVIE: " + resultMovie.length);
	console.log("TV: " + resultTV.length);
	var toPrint = buildHTMLresult(result, "ALL");
	var toPrintMovies = buildHTMLresult(resultMovie, "MOVIE");
	var toPrintTV = buildHTMLresult(resultTV, "TV");
	// If no films were found, display a text message
	if(result.length === 0){
		document.getElementById("resultTitle").innerHTML = "<p>No results for " + utterance + "</p>";
		document.getElementById("inputResult").innerHTML = "";
		document.getElementById("movieResult").innerHTML = "";
		document.getElementById("tvResult").innerHTML = "";
		document.getElementById("movie").style.visibility = "hidden";
		document.getElementById("tv").style.visibility = "hidden";
	} else {
		focusIndex = 0;
		movieIndex = 0;
		tvIndex = 0;
		rowIndex = 1;
		// Start inserting html for the top results container div
		document.getElementById("resultTitle").innerHTML = "<p>Top results for " + utterance + "</p>";
		document.getElementById("inputResult").innerHTML = toPrint;
		document.getElementsByClassName("card")[focusIndex].style.left = "34px";
		if(resultMovie.length > 0 && resultTV.length <= 0){
			document.getElementById("movieResult").innerHTML = toPrintMovies;
			document.getElementsByClassName("mCard")[focusIndex].style.left = "34px";
			document.getElementById("movieResult").style.visibility = "visible";
			document.getElementById("movie").style.visibility = "visible";
			document.getElementById("movie").innerHTML = "<p>"+LANG_JSON_DATA.movies+"</p>";
			document.getElementById("tvResult").style.visibility = "hidden";
			document.getElementById("tv").style.visibility = "hidden";
			document.getElementById("tvResult").innerHTML = "";
		} else if(resultMovie.length > 0){
			document.getElementById("movieResult").innerHTML = toPrintMovies;
			document.getElementsByClassName("mCard")[focusIndex].style.left = "34px";
			document.getElementById("movieResult").style.visibility = "visible";
			document.getElementById("movie").style.visibility = "visible";
			document.getElementById("movie").innerHTML = "<p>"+LANG_JSON_DATA.movies+"</p>";
			document.getElementsByClassName("mCard")[focusIndex].style.left = "34px";
		} else {
			document.getElementById("tv").style.visibility = "hidden";
		}
		// If no elements exist in the movie array, use the movieResult div to insert the tv elements
		if(resultTV.length > 0 && resultMovie <= 0){
			document.getElementById("movieResult").innerHTML = toPrintTV;
			//document.getElementById("tv").style.top = "34em";
			document.getElementById("tv").style.visibility = "hidden";
			document.getElementById("movie").style.visibility = "visible";
			document.getElementById("movie").innerHTML = "<p>"+LANG_JSON_DATA.tvshows+"</p>";
			document.getElementsByClassName("tCard")[focusIndex].style.left = "34px";
			document.getElementById("tvResult").style.visibility = "hidden";
			document.getElementById("tvResult").innerHTML = "";
		} else if(resultTV.length > 0){			
			document.getElementById("tv").style.visibility = "visible";
			document.getElementById("tv").innerHTML = "<p>"+LANG_JSON_DATA.tvshows+"</p>";
			document.getElementById("tvResult").style.visibility = "visible";
			document.getElementById("tvResult").innerHTML = toPrintTV;
			document.getElementsByClassName("tCard")[focusIndex].style.left = "34px";	
			document.getElementById("movie").innerHTML = "<p>"+LANG_JSON_DATA.movies+"</p>";
			//document.getElementById("tv").style.top = "61em";
		} else {

			document.getElementById("movie").innerHTML = "<p>"+LANG_JSON_DATA.movies+"</p>";
			document.getElementById("tvResult").style.visibility = "hidden";
			document.getElementById("tv").style.visibility = "hidden";
			//document.getElementById("tv").style.top = "61em";
			document.getElementById("tvResult").innerHTML = "";
		}
		// Give every card a different x coordinate for the top results container
		if(result.length > 1){
			leftPositionCounter = 476;
			for(var i=1; i<result.length; i++){
				document.getElementsByClassName("card")[i].style.left = leftPositionCounter.toString() + "px";
				leftPositionCounter += 442;
			}
		}
		// Give every card a different x coordinate for the movie results container
		if(resultMovie.length > 1){
			leftPositionCounter = 476;
			for(var j=1; j<resultMovie.length; j++){
				document.getElementsByClassName("mCard")[j].style.left = leftPositionCounter.toString() + "px";
				leftPositionCounter += 442;
			}
		}
		// Give every card a different x coordinate for the tv results container
		if(resultTV.length > 1){
			leftPositionCounter = 476;
			for(var k=1; k<resultTV.length; k++){
				document.getElementsByClassName("tCard")[k].style.left = leftPositionCounter.toString() + "px";
				leftPositionCounter += 442;
			}
		}
		// Focus on the first result
		document.getElementsByClassName("card")[focusIndex].focus();
		document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
	}
	// Display the toast message with the categories used for filtering the results
	launch_toast();
	console.log("SIZE: " + result.length);
}
// Initialize voice web api
function voiceInteractionInit(){
	console.log("ENTERED voiceInteractionInit FUNCTION");
	var version = "0.0.0";
	try{
		version = webapis.voiceinteraction.getVersion();
		console.log("PLUGIN VERSION: ");
		console.log(version);
		document.getElementById("desc").innerHTML = "<p>Plugin version: " + version + "</p>";
		launch_toast();
	}
	catch(e){
		console.log("exception [" + e.code + "] name: " + e.name + " message: " + e.message);
		document.getElementById("desc").innerHTML = "<p>ERROR: [" + e.code + "] name: " + e.name + " message: " + e.message + "</p>";
		launch_toast();
	}
	try{
		webapis.voiceinteraction.setCallback(
			{
			onupdatestate: function(){ 
				console.log("AppState Called");
				// "None" - Application Default Status - None
				// "List" - The status of application showing something in list - Voice Navigation, Selection
				// "Player" - The status of application playing a content - Voice Media Control
			    return "List";
			},
			onchangeappstate: function(state){
				console.log("onchangeappstate : " + state);
				var bSupport = true;
				switch(state){
					case "Home":
						document.getElementById("desc").innerHTML += "<p>App state changed to: Home</p>";
						launch_toast();
						break;
					case "Setting":
						document.getElementById("desc").innerHTML += "<p>App state changed to: Setting</p>";
						launch_toast();
						break;
					case "Search":
						document.getElementById("desc").innerHTML += "<p>App state changed to: Search</p>";
						launch_toast();
						break;	
					default:
						bSupport = false;
						break;
			     }
			     return bSupport;
			},
			onnavigation: function(voiceNavigation){
				var bSupport = true;
				console.log("onnavigation : " + voiceNavigation);
				switch(voiceNavigation){
					case "NAV_PREVIOUS":
						if(document.activeElement !== input){
							console.log("CALLING NAV_PREVIOUS FUNCTION");
							document.getElementById("desc").innerHTML += "<p>Previous Page</p>";
							launch_toast();
							scrollLeft();
						}
						break;
					case "NAV_NEXT":
						if(document.activeElement !== input){
							console.log("CALLING NAV_NEXT FUNCTION");
							document.getElementById("desc").innerHTML += "<p>Next Page</p>";
							launch_toast();
							scrollRight();
						}
						break;
					case "NAV_LEFT":
						if(document.activeElement !== input){
							console.log("CALLING NAV_LEFT FUNCTION");
							document.getElementById("desc").innerHTML += "<p>Move Left</p>";
							launch_toast();
							navLeft();
						}
						break;
					case "NAV_RIGHT":
						if(document.activeElement !== input){
							console.log("CALLING NAV_RIGHT FUNCTION");
							document.getElementById("desc").innerHTML += "<p>Move Right</p>";
							launch_toast();
							navRight();
						}
						break;
					case "NAV_UP":
						console.log("NAV_UP CALLED");
						document.getElementById("desc").innerHTML += "<p>Move Up</p>";
						launch_toast();
						scrollUp();
						break;
					case "NAV_DOWN":
						console.log("NAV_DOWN CALLED");
						document.getElementById("desc").innerHTML += "<p>Move Down</p>";
						launch_toast();
						scrollDown();
						break;
					case "NAV_SHOW_MORE":
						console.log("NAV_SHOW_MORE CALLED");
						document.getElementById("desc").innerHTML += "<p>Show More</p>";
						launch_toast();
						showMore();
						break;
					default:
						console.log("DEFAULT CALLED");
						document.getElementById("desc").innerHTML += "<p>No valid action was called.</p>";
						launch_toast();
						bSupport = false;
						break;
				}
				return bSupport;
			},
			onsearch: function(voiceSearchTerm){
				console.log("onsearch : " + JSON.stringify(voiceSearchTerm));
				filter(voiceSearchTerm);
				return true;
			},
			onrequestcontentcontext: function(){
		        console.log("web app onrequestcontentcontext : ");
		        var content = [];
		        var bFocused = false;
		        try {
		        	document.getElementById("desc").innerHTML = "<p>CONTENT CONTEXT: ";
		        	for(var i=0; i<result.length; i++){
		        		content.push(webapis.voiceinteraction.buildVoiceInteractionContentContextItem(i,0,result[i].title, [result[i].rating, result[i].type], bFocused));
		        		document.getElementById("desc").innerHTML += result[i].title + " ";
		        	}
		        	document.getElementById("desc").innerHTML += "</p>";
		        } catch (e) {
		           console.log("exception [" + e.code + "] name: " + e.name + " message: " + e.message);
		        }
		        return webapis.voiceinteraction.buildVoiceInteractionContentContextResponse(content);
		    },
			ontitleselection: function(title){
				console.log("ontitleselection : " + title);
				document.getElementById("desc").innerHTML += "<p>Title Selection: " + title + "</p>";
				launch_toast();
				return true;
			},
			onselection: function(voiceSelection){
				var bSupport = true;
				console.log("onselection : " + voiceSelection);
				switch(voiceSelection){
					case -1:
						if(result.length > 0){
							switch(rowIndex){
								case 1: focusIndex = result.length-1; console.log(result[focusIndex].title + " WAS SELECTED"); break;
								case 2: movieIndex = resultMovie.length-1; console.log(resultMovie[movieIndex].title + " WAS SELECTED"); break;
								case 3: tvIndex = resultTV.length-1; console.log(resultTV[tvIndex].title + " WAS SELECTED"); break;
							}
							itemSelected();
						}
						break;
					case 0:
						if(result.length > 0){
							switch(rowIndex){
								case 1: console.log(result[focusIndex].title + " WAS SELECTED"); break;
								case 2: console.log(resultMovie[movieIndex].title + " WAS SELECTED"); break;
								case 3: console.log(resultTV[tvIndex].title + " WAS SELECTED"); break;
							}
							itemSelected();
						}
						break;
					default:
						{
							if(voiceSelection >= 1){
								// Select the (voiceSelection)th item
								// index of the first item is 1
								console.log("For Ordinal : " + voiceSelection);
								if(rowIndex === 1){
									if((voiceSelection - 1) >= 0 && (voiceSelection - 1) < result.length){
										focusIndex = voiceSelection - 1;	
									}	
								} else if(rowIndex === 2 && resultMovie.length > 0){
									if((voiceSelection - 1) >= 0 && (voiceSelection - 1) < resultMovie.length){
										movieIndex = voiceSelection - 1;	
									}
								} else if(rowIndex === 2 || rowIndex === 3){
									if((voiceSelection - 1) >= 0 && (voiceSelection - 1) < resultTV.length){
										tvIndex = voiceSelection - 1;	
									}
								}
								itemSelected();
							} else {
								bSupport = false;
							}
						}
					break;
				}
				return bSupport;
			},
			oncontinuewatching: function(){
				document.getElementById("desc").innerHTML += "<p>CONTINUE WATCHING</p>";
				launch_toast();
				return true;
			},
			onskipad: function(){
				console.log("ON SKIP AD");
				document.getElementById("desc").innerHTML += "<p><strong>ACTION:</strong> onskipad<br><strong>PARAMETERS:</strong> NONE</p>";
				launch_toast();
				return true;
			}
		});
	} catch(err){
		console.log("TRY CATCH FOR CALLBACKS: " + err.message);
		document.getElementById("desc").innerHTML = "<p>" + err.message + "</p>";
		launch_toast();
	}
	try{
		webapis.voiceinteraction.listen();
		console.log("LISTEN FUNCTION CALLED");
	} catch(err){
		console.log("TRY CATCH FOR LISTEN FUNCTION: " + err.message);
		document.getElementById("desc").innerHTML = "<p>" + err.message + "</p>";
		launch_toast();
	}
}
// Initialize function
var init = function () {
	if(localStorage.getItem("vToastMessageIsOn") === null){
		toastMessageIsOn = true;
	} else {
		if(localStorage.getItem("vToastMessageIsOn") === "false"){
			toastMessageIsOn = false;
		} else {
			toastMessageIsOn = true;
		}
	}
    console.log('Version 1.14 | init() called');
    registerKeys();
    document.getElementById('searchBar').placeholder = LANG_JSON_DATA.input_placeholder;
    voiceInteractionInit();
    var queryString = decodeURIComponent(window.location.search);
    console.log("RETURN VALUE: " + queryString);
    queryString = queryString.substr(7);
    if(queryString !== "" && queryString !== null && queryString !== " "){
    	input.value = queryString;
    	getInputText();
    }
};
// Select item information and transition to media player page
function itemSelected(){
	var queryString;
	var isFocused = (document.activeElement === input);
	// Insert corresponding URI information depending on which row the element was selected from
	if(result.length > 0 && !isFocused){
		switch(rowIndex){
			case 0: break;
			case 1: queryString = "?para1=" + result[focusIndex].id;
					queryString += "&para2=" + input.value;
					window.location.href = "details.html" + queryString;
					break;
			case 2: if(resultMovie.length > 0){
						queryString = "?para1=" + resultMovie[movieIndex].id;
						queryString += "&para2=" + input.value;
						window.location.href = "details.html" + queryString;
					} else {
						queryString = "?para1=" + resultTV[tvIndex].id;
						queryString += "&para2=" + input.value;
						window.location.href = "details.html" + queryString;
					}
					break;
			case 3: queryString = "?para1=" + resultTV[tvIndex].id;
					queryString += "&para2=" + input.value;		
					window.location.href = "details.html" + queryString;
					break;
		}
	}
}
// Content was selected with a mouse click
function videoClicked(id){
	var queryString;
	// Insert corresponding URI information depending on which row the element was selected from
	if(result.length > 0){
		queryString = "?para1=" + id;
		queryString += "&para2=" + input.value;
		window.location.href = "details.html" + queryString;
	}
}
// Key inputs, focus and blur depending on key press from user
document.body.addEventListener('keydown', function(event) {
	console.log("Received key: " + event.keyCode);
	switch (event.keyCode) {
		case 13: // Enter
			console.log("ENTER RECEIVED!");
			if(input.value.trim() !== "" && (document.activeElement === input)){
				getInputText();
			} else if(document.activeElement !== input){
				itemSelected();
			}
			break;
		case 37: // Left 
			if(document.activeElement !== input){
				event.preventDefault();
			}
			if(buttonEnabled){
				navLeft();
			}
			break;
		case 38: // Up 
			if(buttonEnabled){
				event.preventDefault();
				scrollUp();
			}
			break;
		case 39: // Right
			if(document.activeElement !== input){
				event.preventDefault();
			}
			if(buttonEnabled){
				navRight();
			}
			break;
		case 40: // Down
			event.preventDefault();
			if(buttonEnabled){
				scrollDown();
			}
			break;
		case 403: // RED A
			
			break;
		case 404: // GREEN B
			console.log("SCROLL LEFT");
			scrollLeft();
			break;
		case 405: // YELLOW C
			console.log("TOGGLE TOAST MESSAGE");
			toggleToastMessage();
			break;
		case 406: // BLUE D
			console.log("SHOW MORE");
			showMore();
			break;
		case 65376: // Done
			focusIndex = 0;
			if(input.value.trim() !== ""){
				getInputText();
			}
			break;	
	    case 65385: // Cancel
	    	input.blur();
	    	break;
	    case 10009: // RETURN button
	    	event.preventDefault();
	    	if(confirm("Exit Application?")){
	    		window.tizen.application.getCurrentApplication().exit();
	    	}
	    	break;
	    case 10182: // EXIT
	    	event.preventDefault();
	    	if(confirm("Exit Application?")){
	    		window.tizen.application.getCurrentApplication().exit();
	    	}
	    	break;
	    case "XF86Exit": // EXIT
	    	event.preventDefault();
	    	if(confirm("Exit Application?")){
	    		window.tizen.application.getCurrentApplication().exit();
	    	}
	    	break;	
	    default: console.log("Unhandled keycode: " + event.keyCode);
	}
});
// Scroll up the result rows
function scrollUp(){
	if(rowIndex > 0){
		rowIndex -= 1;
	}
	console.log(rowIndex);
	// Animate result containers depending on the position of the current and previous focus
	switch(rowIndex){
		case 0: window.scrollTo(0, 0);
				input.focus(); 
				if(result.length > 0) {
					document.getElementsByClassName("dots")[focusIndex].src = "images/whiteDots.png";
				}
				break;
		case 1: if(result.length > 0){
					window.scrollTo(0, 0);
					if(scrolledUp === false){
						scrolledUp = true;
						buttonEnabled = false;
						setTimer = setTimeout(function(){ 
							if(resultMovie.length > 0 && resultTV.length > 0){
								document.getElementsByClassName("card")[focusIndex].focus();
								document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";	
							}
							buttonEnabled = true;
						}, 500);
						if(resultMovie.length > 0){
							document.getElementsByClassName("mDots")[movieIndex].src = "images/whiteDots.png";
							document.getElementsByClassName("mCard")[movieIndex].blur();
						}
						if(resultTV.length > 0){
							document.getElementsByClassName("tDots")[tvIndex].src = "images/whiteDots.png";
							document.getElementsByClassName("tCard")[tvIndex].blur();
						}
					} else {
						if(resultMovie.length > 0 || resultTV.length > 0){
							document.getElementsByClassName("card")[focusIndex].focus();
							document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
							if(resultMovie.length > 0){
								document.getElementsByClassName("mDots")[movieIndex].src = "images/whiteDots.png";
								document.getElementsByClassName("mCard")[movieIndex].blur();
							}
							if(resultTV.length > 0){
								document.getElementsByClassName("tDots")[tvIndex].src = "images/whiteDots.png";
								document.getElementsByClassName("tCard")[tvIndex].blur();
							}
						} 
					}
				} 
				break;
		case 2: if(resultMovie.length > 0){
					window.scrollTo(0, 0);
					if(scrolledUp === false){
						scrolledUp = true;
						buttonEnabled = false;
						setTimer = setTimeout(function(){ 
							document.getElementsByClassName("mCard")[movieIndex].focus();
							document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
							buttonEnabled = true;
						}, 500);
						if(resultTV.length > 0){
							document.getElementsByClassName("tDots")[tvIndex].src = "images/whiteDots.png";
						}
						document.getElementsByClassName("tCard")[tvIndex].blur();
					} else {
						document.getElementsByClassName("mCard")[movieIndex].focus();
						document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
						document.getElementsByClassName("dots")[focusIndex].src = "images/whiteDots.png";
						if(resultTV.length > 0){
							document.getElementsByClassName("tDots")[tvIndex].src = "images/whiteDots.png";
						}
					}	
				} else if(resultTV.length > 0){
					if(scrolledUp === false){
						scrolledUp = true;
					}
					document.getElementsByClassName("tCard")[tvIndex].focus();
					document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
					document.getElementsByClassName("dots")[focusIndex].src = "images/whiteDots.png";
				}
				break;
		case 3: if(resultTV.length > 0){
					document.getElementsByClassName("tCard")[tvIndex].focus();
					document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
					document.getElementsByClassName("mDots")[movieIndex].src = "images/whiteDots.png";
				}
				break;
	}
}
// Scroll down the result rows
function scrollDown(){
	if(result.length > 0){
		if(rowIndex === 0){
			rowIndex = 1;
		} else if(rowIndex === 1){
			if(resultMovie.length > 0 || resultTV.length > 0){
				rowIndex = 2;
			}
		} else if(rowIndex === 2){
			if(resultMovie.length > 0 && resultTV.length > 0){
				rowIndex = 3;
			}
		} else {
			return;
		}
	}
	console.log(rowIndex);
	// Animate result containers depending on the position of the current and previous focus
	switch(rowIndex){
		case 0: window.scrollTo(0, 0); input.focus(); break;
		case 1: if(result.length > 0){
					document.getElementsByClassName("card")[focusIndex].focus();
					document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
				} 
				break;
		case 2: if(resultMovie.length > 0){
					if(resultTV.length > 0){
						buttonEnabled = false;
						setTimer = setTimeout(function(){ 
							document.getElementsByClassName("mCard")[movieIndex].focus();
							document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
							buttonEnabled = true;
						}, 250);
						document.getElementsByClassName("dots")[focusIndex].src = "images/whiteDots.png";
						document.getElementsByClassName("card")[focusIndex].blur();
					} else {
						document.getElementsByClassName("mCard")[movieIndex].focus();
						document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
						document.getElementsByClassName("dots")[focusIndex].src = "images/whiteDots.png";
					}
				} else if(resultTV.length > 0){
					document.getElementsByClassName("tCard")[tvIndex].focus();
					document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
					document.getElementsByClassName("dots")[focusIndex].src = "images/whiteDots.png";
				}
				break;
		case 3: if(resultTV.length > 0){
					if(scrolledUp === true){
						scrolledUp = false;
						buttonEnabled = false;
						setTimer = setTimeout(function(){ 
							document.getElementsByClassName("tCard")[tvIndex].focus();
							document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
							buttonEnabled = true;
						}, 500);
						document.getElementsByClassName("mDots")[movieIndex].src = "images/whiteDots.png";
						document.getElementsByClassName("mCard")[movieIndex].blur();
					} else {
						document.getElementsByClassName("tCard")[tvIndex].focus();
						document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
						document.getElementsByClassName("mDots")[movieIndex].src = "images/whiteDots.png";
					}
				}
				break;
	}
}
// Navigate left
function navLeft(){
	switch(rowIndex){
		case 0: break;
		case 1: focusIndex -= 1;
				// Validate the number of objects in result array and animate accordingly
				if(result.length > 0){
					if(result.length > 1){
						if(focusIndex < 0 && result.length > 0){
							focusIndex = 0;
							document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
						} else {
							if(result.length > 0){
								document.getElementsByClassName("dots")[focusIndex+1].src = "images/whiteDots.png";
								document.getElementsByClassName("card")[focusIndex].focus();
								document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
								shiftRight();
							}
						}	
					} else {
						focusIndex = 0;
						document.getElementsByClassName("card")[focusIndex].style.left = "34px";
						document.getElementsByClassName("card")[focusIndex].focus();
						document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
					}
				}
				break;
		case 2: if(resultMovie.length > 0){
					movieIndex -= 1;
					// Validate the number of objects in result array and animate accordingly
					if(resultMovie.length > 1){
						if(movieIndex < 0 && resultMovie.length > 0){
							movieIndex = 0;
							document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
						} else {
							if(resultMovie.length > 0){
								document.getElementsByClassName("mDots")[movieIndex+1].src = "images/whiteDots.png";
								document.getElementsByClassName("mCard")[movieIndex].focus();
								document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
								shiftRight();
							}
						}	
					} else {
						movieIndex = 0;
						document.getElementsByClassName("mCard")[movieIndex].style.left = "34px";
						document.getElementsByClassName("mCard")[movieIndex].focus();
						document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
					}
				} else {
					tvIndex -= 1;
					// Validate the number of objects in result array and animate accordingly
					if(resultTV.length > 1){
						if(tvIndex < 0 && resultTV.length > 0){
							tvIndex = 0;
							document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
						} else {
							if(resultTV.length > 0){
								document.getElementsByClassName("tDots")[tvIndex+1].src = "images/whiteDots.png";
								document.getElementsByClassName("tCard")[tvIndex].focus();
								document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
								shiftRight();
							}
						}	
					} else {
						tvIndex = 0;
						document.getElementsByClassName("tCard")[tvIndex].style.left = "34px";
						document.getElementsByClassName("tCard")[tvIndex].focus();
						document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
					}
				}
				break;
		case 3: tvIndex -= 1;
				// Validate the number of objects in result array and animate accordingly
				if(resultTV.length > 1){
					if(tvIndex < 0 && resultTV.length > 0){
						tvIndex = 0;
						document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
					} else {
						if(resultTV.length > 0){
							document.getElementsByClassName("tDots")[tvIndex+1].src = "images/whiteDots.png";
							document.getElementsByClassName("tCard")[tvIndex].focus();
							document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
							shiftRight();
						}
					}	
				} else {
					tvIndex = 0;
					document.getElementsByClassName("tCard")[tvIndex].style.left = "34px";
					document.getElementsByClassName("tCard")[tvIndex].focus();
					document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
				}
				break;
	}
	
}
// Navigate right
function navRight(){
	switch(rowIndex){
		case 0: break;
		case 1: focusIndex += 1;
				if(result.length > 0){
					if(result.length > 1){
						if(focusIndex > (result.length-1)){
							focusIndex = result.length-1;
							document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
						} else {
							document.getElementsByClassName("dots")[focusIndex-1].src = "images/whiteDots.png";
							document.getElementsByClassName("card")[focusIndex].focus();
							document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
							shiftLeft();
						}
					} else {
						focusIndex = 0;
						document.getElementsByClassName("card")[focusIndex].focus();
						document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
					}
				}
				window.scrollTo(0, 0);
				break;
		case 2: if(resultMovie.length > 0){
					movieIndex += 1;
					if(resultMovie.length > 1){
						if(movieIndex > (resultMovie.length-1)){
							movieIndex = resultMovie.length-1;
							document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
						} else {
							document.getElementsByClassName("mDots")[movieIndex-1].src = "images/whiteDots.png";
							document.getElementsByClassName("mCard")[movieIndex].focus();
							document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
							shiftLeft();
						}
					} else {
						movieIndex = 0;
						document.getElementsByClassName("mCard")[movieIndex].focus();
						document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
					}
				} else {
					tvIndex += 1;
					if(resultTV.length > 1){
						if(tvIndex > (resultTV.length-1)){
							tvIndex = resultTV.length-1;
							document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
						} else {
							document.getElementsByClassName("tDots")[tvIndex-1].src = "images/whiteDots.png";
							document.getElementsByClassName("tCard")[tvIndex].focus();
							document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
							shiftLeft();
						}
					} else {
						tvIndex = 0;
						document.getElementsByClassName("tCard")[tvIndex].focus();
						document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
					}
				}
				break;
		case 3: tvIndex += 1;
				if(resultTV.length > 1){
					if(tvIndex > (resultTV.length-1)){
						tvIndex = resultTV.length-1;
						document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
					} else {
						document.getElementsByClassName("tDots")[tvIndex-1].src = "images/whiteDots.png";
						document.getElementsByClassName("tCard")[tvIndex].focus();
						document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
						shiftLeft();
					}
				} else {
					tvIndex = 0;
					document.getElementsByClassName("tCard")[tvIndex].focus();
					document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
				}
				window.scrollTo(0, 400);
				break;
	}
}
// NAV_NEXT behavior, cursor moves right at most 4 times at once
function scrollRight(){
	switch(rowIndex){
		case 0: break;
		case 1: focusIndex += 4;
				if(result.length > 0){
					if(result.length > 1){
						if(focusIndex > (result.length-1)){
							focusIndex -= 4;
						} else {
							document.getElementsByClassName("dots")[focusIndex-4].src = "images/whiteDots.png";
							if(focusIndex === (result.length-1)){
								focusIndex -= 1;
							}
							document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
							for(var iResult = 0; iResult < (result.length); iResult++){
								document.getElementsByClassName("card")[iResult].style.transition = "none";	
							}
							nextPageShift();
						}
					} else {
						focusIndex = 0;
						document.getElementsByClassName("card")[focusIndex].focus();
						document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
					}
				}
				console.log("window scroll 0,0");
				window.scrollTo(0, 0);
				break;
		case 2: if(resultMovie.length > 0){
					movieIndex += 4;
					if(resultMovie.length > 1){
						if(movieIndex > (resultMovie.length-1)){
							movieIndex -= 4;
						} else {
							document.getElementsByClassName("mDots")[movieIndex-4].src = "images/whiteDots.png";
							if(movieIndex === (resultMovie.length-1)){
								movieIndex -= 1;
							}
							document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
							for(var iMovie = 0; iMovie < (resultMovie.length); iMovie++){
								document.getElementsByClassName("mCard")[iMovie].style.transition = "none";	
							}
							nextPageShift();
						}
					} else {
						movieIndex = 0;
						document.getElementsByClassName("mCard")[movieIndex].focus();
						document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
					}
				} else {
					tvIndex += 4;
					if(resultTV.length > 1){
						if(tvIndex > (resultTV.length-1)){
							tvIndex -= 4;
						} else {
							document.getElementsByClassName("tDots")[tvIndex-4].src = "images/whiteDots.png";
							if(tvIndex === (resultTV.length-1)){
								tvIndex -= 1;
							}
							document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
							for(var iTv = 0; iTv < (resultTV.length); iTv++){
								document.getElementsByClassName("tCard")[iTv].style.transition = "none";	
							}
							nextPageShift();
						}
					} else {
						tvIndex = 0;
						document.getElementsByClassName("tCard")[tvIndex].focus();
						document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
					}
				}
				break;
		case 3: tvIndex += 4;
				if(resultTV.length > 1){
					if(tvIndex > (resultTV.length-1)){
						tvIndex -= 4;
					} else {
						document.getElementsByClassName("tDots")[tvIndex-4].src = "images/whiteDots.png";
						if(tvIndex === (resultTV.length-1)){
							tvIndex -= 1;
						}
						document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
						for(var iTv2 = 0; iTv2 < (resultTV.length); iTv2++){
							document.getElementsByClassName("tCard")[iTv2].style.transition = "none";	
						}
						nextPageShift();
					}
				} else {
					tvIndex = 0;
					document.getElementsByClassName("tCard")[tvIndex].focus();
					document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
				}
				break;
	}
}
// Reposition the content elements when the Next Page action is called
function nextPageShift(){
	var leftPosition;
	var newValue;
	var i;
	if(rowIndex === 1){
		if(focusIndex === (result.length - 1)){
			document.getElementsByClassName("card")[focusIndex].style.left = "34px";
			newValue = -450;
			for(i=(focusIndex-1); i>=0; i--){
				document.getElementsByClassName("card")[i].style.left = newValue.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("card")[i].style.left);
			}
		}
		if(focusIndex >= 3 && focusIndex < (result.length - 1)){ 
			document.getElementsByClassName("card")[focusIndex].style.left = "34px";
			leftPosition = 34;
			for(i=(focusIndex+1); i<result.length; i++){
				leftPosition += 442;
				document.getElementsByClassName("card")[i].style.left = leftPosition.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("card")[i].style.left);
			}
			newValue = -450;
			for(i=(focusIndex-1); i>=0; i--){
				document.getElementsByClassName("card")[i].style.left = newValue.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("card")[i].style.left);
			}
		}
		document.getElementsByClassName("card")[focusIndex].focus();
		for(var iResult = 0; iResult < (result.length); iResult++){
			document.getElementsByClassName("card")[iResult].style.transition = "left 0.2s";	
		}
	} else if(rowIndex === 2 && resultMovie.length > 0){
		document.getElementsByClassName("mCard")[movieIndex].style.left = "34px";
		newValue = -450;
		for(i=(movieIndex-1); i>=0; i--){
			document.getElementsByClassName("mCard")[i].style.left = newValue.toString() + "px";
			//console.log("Element: " + i + " left position: " + document.getElementsByClassName("mCard")[i].style.left);
		}
		if(movieIndex >= 3 && movieIndex < (resultMovie.length - 1)){ 
			document.getElementsByClassName("mCard")[movieIndex].style.left = "34px";
			leftPosition = 34;
			for(i=(movieIndex+1); i<resultMovie.length; i++){
				leftPosition += 442;
				document.getElementsByClassName("mCard")[i].style.left = leftPosition.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("mCard")[i].style.left);
			}
			newValue = -450;
			for(i=(movieIndex-1); i>=0; i--){
				document.getElementsByClassName("mCard")[i].style.left = newValue.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("mCard")[i].style.left);
			}
		}
		document.getElementsByClassName("mCard")[movieIndex].focus();
		for(var iMovie = 0; iMovie < (resultMovie.length); iMovie++){
			document.getElementsByClassName("mCard")[iMovie].style.transition = "left 0.2s";	
		}
	} else if(rowIndex === 2 || rowIndex === 3){
		document.getElementsByClassName("tCard")[tvIndex].style.left = "34px";
		newValue = -450;
		for(i=(tvIndex-1); i>=0; i--){
			document.getElementsByClassName("tCard")[i].style.left = newValue.toString() + "px";
			//console.log("Element: " + i + " left position: " + document.getElementsByClassName("tCard")[i].style.left);
		}
		if(tvIndex >= 3 && tvIndex < (resultTV.length - 1)){ 
			document.getElementsByClassName("tCard")[tvIndex].style.left = "34px";
			leftPosition = 34;
			for(i=(tvIndex+1); i<resultTV.length; i++){
				leftPosition += 442;
				document.getElementsByClassName("tCard")[i].style.left = leftPosition.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("tCard")[i].style.left);
			}
			newValue = -450;
			for(i=(tvIndex-1); i>=0; i--){
				document.getElementsByClassName("tCard")[i].style.left = newValue.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("tCard")[i].style.left);
			}
		}
		document.getElementsByClassName("tCard")[tvIndex].focus();
		for(var iTv = 0; iTv < (resultTV.length); iTv++){
			document.getElementsByClassName("tCard")[iTv].style.transition = "left 0.2s";	
		}
	}
}
// Shift all elements to the right of the screen
function shiftRight(){
	var rect;
	var leftRect;
	var leftPosition;
	if(rowIndex === 1){
		rect = document.getElementsByClassName("card")[focusIndex].getBoundingClientRect();
		if(focusIndex === 0 && document.getElementsByClassName("card")[focusIndex].style.left === "34px"){
			return;
		}
		if(rect.left < 500 && focusIndex < (result.length - 2)){
			if(focusIndex === 1){
				// If second tile is already positioned correctly, do not shift other tiles
				leftRect = document.getElementsByClassName("card")[focusIndex].getBoundingClientRect();
				if(leftRect.left >= 34){
					return;
				}
			}
			leftPosition = 476;
			if(focusIndex <= 0){
				document.getElementsByClassName("card")[focusIndex].style.left = "34px";
				for(var i=(focusIndex+1); i<result.length; i++){
					document.getElementsByClassName("card")[i].style.left = leftPosition.toString() + "px";
					leftPosition += 442;
				}
			} else {
				document.getElementsByClassName("card")[focusIndex-1].style.left = "34px";
				for(var j=focusIndex; j<result.length; j++){
					document.getElementsByClassName("card")[j].style.left = leftPosition.toString() + "px";
					leftPosition += 442;
				}	
			}	
			buttonEnabled = false;
			setTimer = setTimeout(function(){ buttonEnabled = true; }, 400);
		}
	} else if(rowIndex === 2 && resultMovie.length > 0){
		rect = document.getElementsByClassName("mCard")[movieIndex].getBoundingClientRect();
		if(movieIndex === 0 && document.getElementsByClassName("mCard")[movieIndex].style.left === "34px"){
			return;
		}
		if(rect.left < 500 && movieIndex < (resultMovie.length - 2)){
			if(movieIndex === 1){
				// If second tile is already positioned correctly, do not shift other tiles
				leftRect = document.getElementsByClassName("mCard")[movieIndex].getBoundingClientRect();
				if(leftRect.left >= 34){
					return;
				}
			}
			if(movieIndex > 0){
				buttonEnabled = false;
				leftPosition = 476;
				document.getElementsByClassName("mCard")[movieIndex-1].style.left = "34px";
				for(var k=movieIndex; k<resultMovie.length; k++){
					document.getElementsByClassName("mCard")[k].style.left = leftPosition.toString() + "px";
					leftPosition += 442;
				}	
				setTimer = setTimeout(function(){ buttonEnabled = true; }, 400);	
			}
		}
	} else if(rowIndex === 2 || rowIndex === 3){
		rect = document.getElementsByClassName("tCard")[tvIndex].getBoundingClientRect();
		if(tvIndex <= 0 && document.getElementsByClassName("tCard")[tvIndex].style.left === "34px"){
			return;
		}
		if(rect.left < 500 && tvIndex < (resultTV.length - 2)){
			if(tvIndex === 1){
				// If second tile is already positioned correctly, do not shift other tiles
				leftRect = document.getElementsByClassName("tCard")[tvIndex].getBoundingClientRect();
				if(leftRect.left >= 34){
					return;
				}
			}
			if(tvIndex <= 0){
				// If first tile is already positioned correctly, do not shift other tiles
				if(document.getElementsByClassName("tCard")[tvIndex].style.left === "34px"){
					return;
				}
			}
			leftPosition = 476;
			if(tvIndex > 0){
				buttonEnabled = false;
				document.getElementsByClassName("tCard")[tvIndex-1].style.left = "34px";
				for(var x=tvIndex; x<resultTV.length; x++){
					document.getElementsByClassName("tCard")[x].style.left = leftPosition.toString() + "px";
					leftPosition += 442;
				}	
				setTimer = setTimeout(function(){ buttonEnabled = true; }, 400);
			}
		}
	}
}
// Shift all elements to the left of the screen
function shiftLeft(){
	var rect;
	var leftPosition;
	var rightMostPosition;
	var rightMostElement;
	var newValue;
	if(rowIndex === 1){
		rect = document.getElementsByClassName("card")[focusIndex].getBoundingClientRect();
		if(focusIndex >= 3 && focusIndex < result.length && rect.left > 884){ 
			buttonEnabled = false;
			leftPosition = rect.left;
			// Position the third tile from focus tile (right side)
			rightMostPosition = leftPosition + 884;
			if((focusIndex+3) < result.length){
				document.getElementsByClassName("card")[focusIndex+3].style.left = rightMostPosition.toString() + "px";			
			}
			// Position the second tile from focus tile (right side)
			rightMostPosition = leftPosition + 442;
			if((focusIndex+2) < result.length){
				document.getElementsByClassName("card")[focusIndex+2].style.left = rightMostPosition.toString() + "px";			
			}
			// Partially show the tile to the right of the focus tile
			if(focusIndex+1 < result.length){
				rightMostElement = leftPosition; 
				document.getElementsByClassName("card")[focusIndex+1].style.left = rightMostElement.toString() + "px";
			}
			// Position the tiles left of the focus tile
			leftPosition -= 442;
			for(var i=focusIndex; i>=0; i--){
				if(focusIndex === result.length){
					document.getElementsByClassName("card")[i].style.left = leftPosition.toString() + "px";
				} else {
					newValue = leftPosition;
					if(newValue < -442){
						newValue = -450;
					}
					document.getElementsByClassName("card")[i].style.left = newValue.toString() + "px";
					leftPosition -= 442;
				}
			}
			setTimer = setTimeout(function(){ buttonEnabled = true; }, 400);
		}
	} else if(rowIndex === 2 && resultMovie.length > 0){
		rect = document.getElementsByClassName("mCard")[movieIndex].getBoundingClientRect();
		if(movieIndex >= 3 && movieIndex < resultMovie.length && rect.left > 884){ 
			buttonEnabled = false;
			leftPosition = rect.left;
			// Position the third tile from focus tile (right side)
			rightMostPosition = leftPosition + 884;
			if((movieIndex+3) < resultMovie.length){
				document.getElementsByClassName("mCard")[movieIndex+3].style.left = rightMostPosition.toString() + "px";			
			}
			// Position the second tile from focus tile (right side)
			rightMostPosition = leftPosition + 442;
			if((movieIndex+2) < resultMovie.length){
				document.getElementsByClassName("mCard")[movieIndex+2].style.left = rightMostPosition.toString() + "px";			
			}
			// Partially show the tile to the right of the focus tile
			if(movieIndex+1 < resultMovie.length){
				rightMostElement = leftPosition; 
				document.getElementsByClassName("mCard")[movieIndex+1].style.left = rightMostElement.toString() + "px";
			}
			// Position the tiles left of the focus tile
			leftPosition -= 442;
			for(var j=movieIndex; j>=0; j--){
				if(movieIndex === resultMovie.length){
					document.getElementsByClassName("mCard")[j].style.left = leftPosition.toString() + "px";
				} else {
					newValue = leftPosition;
					if(newValue < -442){
						newValue = -450;
					}
					document.getElementsByClassName("mCard")[j].style.left = newValue.toString() + "px";
					leftPosition -= 442;
				}
			}
			setTimer = setTimeout(function(){ buttonEnabled = true; }, 400);
		}
	} else if(rowIndex === 2 || rowIndex === 3){
		rect = document.getElementsByClassName("tCard")[tvIndex].getBoundingClientRect();
		if(tvIndex >= 3 && tvIndex < resultTV.length && rect.left > 884){ 
			buttonEnabled = false;
			leftPosition = rect.left;
			// Position the third tile from focus tile (right side)
			rightMostPosition = leftPosition + 884;
			if((tvIndex+3) < resultTV.length){
				document.getElementsByClassName("tCard")[tvIndex+3].style.left = rightMostPosition.toString() + "px";			
			}
			// Position the second tile from focus tile (right side)
			rightMostPosition = leftPosition + 442;
			if((tvIndex+2) < resultTV.length){
				document.getElementsByClassName("tCard")[tvIndex+2].style.left = rightMostPosition.toString() + "px";			
			}
			// Partially show the tile to the right of the focus tile
			if(tvIndex+1 < resultTV.length){
				rightMostElement = leftPosition; 
				document.getElementsByClassName("tCard")[tvIndex+1].style.left = rightMostElement.toString() + "px";
			}
			// Position the tiles left of the focus tile
			leftPosition -= 442;
			for(var k=tvIndex; k>=0; k--){
				if(tvIndex === resultTV.length){
					document.getElementsByClassName("tCard")[k].style.left = leftPosition.toString() + "px";
				} else {
					newValue = leftPosition;
					if(newValue < -442){
						newValue = -450;
					}
					document.getElementsByClassName("tCard")[k].style.left = newValue.toString() + "px";
					leftPosition -= 442;
				}
			}
			setTimer = setTimeout(function(){ buttonEnabled = true; }, 400);
		}
	}
}
// NAV_PREVIOUS behavior, cursor moves left at most 4 times at once
function scrollLeft(){
	switch(rowIndex){
		case 0: break;
		case 1: focusIndex -= 4;
				if(result.length > 0){
					if(result.length > 1){
						if(focusIndex < 0){
							focusIndex += 4;
						} else {
							document.getElementsByClassName("dots")[focusIndex+4].src = "images/whiteDots.png";
							if(focusIndex < 4){
								focusIndex = 3;
							}
							document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
							for(var iResult = 0; iResult < (result.length); iResult++){
								document.getElementsByClassName("card")[iResult].style.transition = "none";	
							}
							previousPageShift();
						}
					} else {
						focusIndex = 0;
						document.getElementsByClassName("card")[focusIndex].focus();
						document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png";
					}
				}
				console.log("window scroll 0,0");
				break;
		case 2: if(resultMovie.length > 0){
					movieIndex -= 4;
					if(resultMovie.length > 1){
						if(movieIndex < 0){
							movieIndex += 4;
						} else {
							document.getElementsByClassName("mDots")[movieIndex+4].src = "images/whiteDots.png";
							if(movieIndex < 4){
								movieIndex = 3;
							}
							document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
							for(var iMovie = 0; iMovie < (resultMovie.length); iMovie++){
								document.getElementsByClassName("mCard")[iMovie].style.transition = "none";	
							}
							previousPageShift();
						}
					} else {
						movieIndex = 0;
						document.getElementsByClassName("mCard")[movieIndex].focus();
						document.getElementsByClassName("mDots")[movieIndex].src = "images/blackDots.png";
					}
				} else {
					tvIndex -= 4;
					if(resultTV.length > 1){
						if(tvIndex < 0){
							tvIndex += 4;
						} else {
							document.getElementsByClassName("tDots")[tvIndex+4].src = "images/whiteDots.png";
							if(tvIndex < 4){
								tvIndex = 3;
							}
							document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
							for(var iTv = 0; iTv < (resultTV.length); iTv++){
								document.getElementsByClassName("tCard")[iTv].style.transition = "none";	
							}
							previousPageShift();
						}
					} else {
						tvIndex = 0;
						document.getElementsByClassName("tCard")[tvIndex].focus();
						document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
					}
				}
				break;
		case 3: tvIndex -= 4;
				if(resultTV.length > 1){
					if(tvIndex < 0){
						tvIndex += 4;
					} else {
						document.getElementsByClassName("tDots")[tvIndex+4].src = "images/whiteDots.png";
						if(tvIndex < 4){
							tvIndex = 3;
						}
						document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
						for(var iTv2 = 0; iTv2 < (resultTV.length); iTv2++){
							document.getElementsByClassName("tCard")[iTv2].style.transition = "none";	
						}
						previousPageShift();
					}
				} else {
					tvIndex = 0;
					document.getElementsByClassName("tCard")[tvIndex].focus();
					document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
				}
				break;
	}
}
// Reposition the content elements when the Previous Page action is called
function previousPageShift(){
	var leftPosition;
	var newValue;
	var i;
	if(rowIndex === 1){
		if(focusIndex < 4){
			document.getElementsByClassName("card")[0].style.left = "34px";
			leftPosition = 34;
			for(i=1; i<result.length; i++){
				leftPosition += 442;
				document.getElementsByClassName("card")[i].style.left = leftPosition.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("card")[i].style.left);
			}
		} else if(focusIndex > 3 && focusIndex < (result.length - 1)){ 
			document.getElementsByClassName("card")[focusIndex-3].style.left = "34px";
			leftPosition = 34;
			for(i=(focusIndex-2); i<result.length; i++){
				leftPosition += 442;
				document.getElementsByClassName("card")[i].style.left = leftPosition.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("card")[i].style.left);
			}
			newValue = -450;
			for(i=(focusIndex-4); i>=0; i--){
				document.getElementsByClassName("card")[i].style.left = newValue.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("card")[i].style.left);
			}
		}
		document.getElementsByClassName("card")[focusIndex].focus();
		for(var iResult = 0; iResult < (result.length); iResult++){
			document.getElementsByClassName("card")[iResult].style.transition = "left 0.2s";	
		}
	} else if(rowIndex === 2 && resultMovie.length > 0){
		if(movieIndex < 4){
			document.getElementsByClassName("mCard")[0].style.left = "34px";
			leftPosition = 34;
			for(i=1; i<resultMovie.length; i++){
				leftPosition += 442;
				document.getElementsByClassName("mCard")[i].style.left = leftPosition.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("card")[i].style.left);
			}
		} else if(movieIndex > 3 && movieIndex < (resultMovie.length - 1)){ 
			document.getElementsByClassName("mCard")[movieIndex-3].style.left = "34px";
			leftPosition = 34;
			for(i=(movieIndex-2); i<resultMovie.length; i++){
				leftPosition += 442;
				document.getElementsByClassName("mCard")[i].style.left = leftPosition.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("card")[i].style.left);
			}
			newValue = -450;
			for(i=(movieIndex-4); i>=0; i--){
				document.getElementsByClassName("mCard")[i].style.left = newValue.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("card")[i].style.left);
			}
		}
		document.getElementsByClassName("mCard")[movieIndex].focus();
		for(var iMovie = 0; iMovie < (resultMovie.length); iMovie++){
			document.getElementsByClassName("mCard")[iMovie].style.transition = "left 0.2s";	
		}
	} else if(rowIndex === 2 || rowIndex === 3){
		if(tvIndex < 4){
			document.getElementsByClassName("tCard")[0].style.left = "34px";
			leftPosition = 34;
			for(i=1; i<resultTV.length; i++){
				leftPosition += 442;
				document.getElementsByClassName("tCard")[i].style.left = leftPosition.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("card")[i].style.left);
			}
		} else if(tvIndex > 3 && tvIndex < (resultTV.length - 1)){ 
			document.getElementsByClassName("tCard")[tvIndex-3].style.left = "34px";
			leftPosition = 34;
			for(i=(tvIndex-2); i<resultTV.length; i++){
				leftPosition += 442;
				document.getElementsByClassName("tCard")[i].style.left = leftPosition.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("card")[i].style.left);
			}
			newValue = -450;
			for(i=(tvIndex-4); i>=0; i--){
				document.getElementsByClassName("tCard")[i].style.left = newValue.toString() + "px";
				//console.log("Element: " + i + " left position: " + document.getElementsByClassName("card")[i].style.left);
			}
		}
		document.getElementsByClassName("tCard")[tvIndex].focus();
		for(var iTv = 0; iTv < (resultTV.length); iTv++){
			document.getElementsByClassName("tCard")[iTv].style.transition = "left 0.2s";	
		}
	}
}
// Move the screen to display hidden content, depending on the amount of content available and the cursor position
function showMore(){
	if(resultMovie.length > 0 && resultTV.length > 0){
		if(scrolledUp){
			scrolledUp = false;
			rowIndex = 3;
			document.getElementsByClassName("dots")[focusIndex].src = "images/whiteDots.png";
			document.getElementsByClassName("mDots")[movieIndex].src = "images/whiteDots.png";
			document.getElementsByClassName("tDots")[tvIndex].src = "images/blackDots.png";
			document.getElementsByClassName("card")[focusIndex].blur();
			document.getElementsByClassName("mCard")[movieIndex].blur();
			setTimer = setTimeout(function(){ document.getElementsByClassName("tCard")[tvIndex].focus(); }, 500);
		} else {
			scrolledUp = true;
			rowIndex = 1;
			window.scrollTo(0, 0);
			document.getElementsByClassName("mDots")[movieIndex].src = "images/whiteDots.png";
			document.getElementsByClassName("tDots")[tvIndex].src = "images/whiteDots.png";
			document.getElementsByClassName("mCard")[movieIndex].blur();
			document.getElementsByClassName("tCard")[tvIndex].blur();
			setTimer = setTimeout(function(){ document.getElementsByClassName("card")[focusIndex].focus(); document.getElementsByClassName("dots")[focusIndex].src = "images/blackDots.png"; }, 500);
		}
	}
}
// Toggle toast messages ON or OFF
function toggleToastMessage(){
	if(toastMessageIsOn){
		document.getElementById("desc").innerHTML = "<p>Toast messages: OFF</p>";
		toastMessageIsOn = false;
	} else {
		document.getElementById("desc").innerHTML = "<p>Toast messages: ON</p>";
		toastMessageIsOn = true;
	}
	localStorage.setItem("vToastMessageIsOn", toastMessageIsOn);
	var toastElement = document.getElementById("toast");
    if(toastElement.classList.contains("show")){
    	toastElement.className.replace("show", "");
    	void toastElement.offsetWidth;
    	clearTimeout(setTimer);
    	toastElement.className = "show";
    	setTimer = setTimeout(function(){ toastElement.className = toastElement.className.replace("show", ""); }, 10000);
    } else {
    	toastElement.className = "show";
    	setTimer = setTimeout(function(){ toastElement.className = toastElement.className.replace("show", ""); }, 10000);
    }
}
// Hide and display toast message
function launch_toast(){
	if(toastMessageIsOn){
		var toastElement = document.getElementById("toast");
	    if(toastElement.classList.contains("show")){
	    	toastElement.className.replace("show", "");
	    	void toastElement.offsetWidth;
	    	clearTimeout(setTimer);
	    	toastElement.className = "show";
	    	setTimer = setTimeout(function(){ toastElement.className = toastElement.className.replace("show", ""); }, 10000);
	    } else {
	    	toastElement.className = "show";
	    	setTimer = setTimeout(function(){ toastElement.className = toastElement.className.replace("show", ""); }, 10000);
	    }	
	}
}
// window.onload can work without <body onload="">
window.onload = init;