// The purpose of this code is to ensure that the "updateTask" function is called once the document is ready, allowing it to perform any necessary tasks related to task updates or initialization.
document.addEventListener("DOMContentLoaded", updateTask);

const localFavList = "favMovieList";

//Initilize the localStorage Favroite list
if (!localStorage.getItem(localFavList)) {
    localStorage.setItem(localFavList, JSON.stringify([]));
}

//Responsible for updating the count of favroites movies in localStorage which is displayed over the favourite Heart Icon in Navbar.
function updateTask() {
    const favCounter = document.getElementById('like-counter');
    const db = JSON.parse(localStorage.getItem(localFavList));
    favCounter.innerText = db.length;
}

//Fatch the movie details from API as JSON.
const fetchMovies = async (url, value) => {
    const response = await fetch(`${url}${value}`);
    const movies = await response.json();
    return movies;
}

//returns if the movie with given id is present in given list.
function isFav(list, id) {
    return list.some(item => item.imdbID === id);
}


// This function adds or removes a movie from the favorite list in local storage. It takes an movie object and a window parameter which is responsible to re-rendering of calling function.
function addRemoveToFavList(obj, window) {
    event.stopPropagation();
    let db = JSON.parse(localStorage.getItem(localFavList));
    const movieItem = JSON.parse(decodeURIComponent(obj));
    let ifExist = db.some(item => item.imdbID === movieItem.imdbID);
    if (ifExist) {
        db = db.filter(item => item.imdbID !== movieItem.imdbID);
    } else {
        db.push(movieItem);
    }

    localStorage.setItem(localFavList, JSON.stringify(db));

    if (window === 1) {
        showMovieList();
    } else if (window === 2) {
        showFavMovieList();
    } else {
        showMovieDetails(movieItem.imdbID);
    }

    updateTask();
}

//It Parse the movies from API and render all as cards.
async function showMovieList() {
    event.preventDefault();
    const list = JSON.parse(localStorage.getItem(localFavList));
    const inputValue = document.getElementById("search-input").value;
    const url = "https://www.omdbapi.com/?apikey=7b6b319d&s=";
    let html = '<div id="movie-container" class="card-group">';
    if (inputValue.length >= 3) {
        const moviesData = await fetchMovies(url, inputValue);
        if (moviesData.Search) {
            html += moviesData.Search.map(element => {
                const movieItem = { imdbID: element.imdbID, Title: element.Title, Year: element.Year, Poster: element.Poster };
                return `
                    <div class="movie-card">
                            <div class="card" onclick="showMovieDetails('${element.imdbID}')">
                                <div class="heartbtn">
                                    <i class="fas fa-heart card-favorite ${isFav(list, element.imdbID) ? 'active' : 'passive'} " onclick="addRemoveToFavList('${encodeURIComponent(JSON.stringify(movieItem))}',1)"></i>
                                </div>
                                <img src="${element.Poster == 'N/A' ? 'images/backdrop.jpg' : element.Poster}" class="card-img img-fluid" alt="${element.Title}">
                                <div class="card-title"> ${element.Title} - ${element.Year}</div>
                            </div>
                    </div>
                `
            }).join('');
        }
    }
    html += '</div>'
    console.log(html);
    document.getElementById('main').innerHTML = html;
}

//It Parse the movies from local Storage and render all as cards.
async function showFavMovieList() {
    let favList = JSON.parse(localStorage.getItem(localFavList));
    let html = '<div id="movie-container" class="card-group">';
    if (favList.length == 0) {
        html += `<div class="fav-item nothing text-white"> <h1> 
            Nothing To Show.....</h1> </div>`
    } else {
        html += favList.map(element => `
                    <div class="movie-card">
                        <div class="card" onclick="showMovieDetails('${element.imdbID}')">
                            <div class="heartbtn">
                                <i class="fas fa-heart card-favorite active" onclick="addRemoveToFavList('${encodeURIComponent(JSON.stringify(element))}',2)"></i>
                            </div>
                            <img src="${element.Poster == 'N/A' ? 'images/backdrop.jpg' : element.Poster}" class="card-img img-fluid" alt="${element.Title}">
                            <div class="card-title"> ${element.Title} - ${element.Year}</div>
                        </div>
                    </div>`
        ).join('');
    }
    html += '</div>';
    document.getElementById('main').innerHTML = html;
}

//It fatchs the perticular movie with itemID from API and render all the details.
async function showMovieDetails(itemId) {
    const list = JSON.parse(localStorage.getItem(localFavList));
    const url = "https://www.omdbapi.com/?apikey=7b6b319d&i=";
    const postUrl = `${itemId}&plot=full`;
    const movie = await fetchMovies(url, postUrl);
    const movieItem = { imdbID: movie.imdbID, Title: movie.Title, Year: movie.Year, Poster: movie.Poster };
    if (movie) {
        let extra;
        let extraValue;
        if (movie.Type == "series") {
            extra = "Seasons";
            extraValue = movie.totalSeasons;
        }
        if (movie.Type == "movie") {
            extra = "Box BoxOffice";
            extraValue = movie.BoxOffice;
        }
        const movieDetails = document.getElementById("main");
        movieDetails.innerHTML = "";
        movieDetails.innerHTML = `
        <div class="default-container">
            <div class="card mb-3" style="background-color:none;" id="movie-details-container">
          <div class="row g-0 movie-details-container">
          <div class="col-md-4" id="movie-poster">
          <img src="${movie.Poster == 'N/A' ? 'images/backdrop.jpg' : movie.Poster} class="img-fluid  mx-auto d-block rounded-start" alt="...">
            </div>
          </div>
          <div class="col-md-10 px-2" id="movie-subDetails-container">
              <div class="card-body">
                  <h2 class="page-card-title">${movie.Title}</h2>
                  <div class="card-subtitle" id="movie-subdetails">
                      <span id="age-group"><i class="fa-solid fa-user"></i>&nbsp ${movie.Rated}</span>
                      <span id="runtime"><i class="fa-solid fa-clock"></i>&nbsp ${movie.Runtime}</span>
                      <span id="released-year"><i class="fa-solid fa-calendar-days"></i>&nbsp ${movie.Year}</span>
                      <span id="country"><i class="fa-solid fa-globe"></i></i>&nbsp ${movie.Country}</span>
                      <span>
                          <span id="imdb-rating"><i class="fa-solid fa-star"></i></i></span><span>&nbsp${movie.imdbRating}</span>
                      </span>
                  </div>
                  <p class="card-text details" id="movie-plot">${movie.Plot}
      
                  </p>
                  <div class="genre"><span class="extra-details-title genre-title">Genre</span><span class="extra-details-value genre-value">&nbsp&nbsp ${movie.Genre}</span></div>
                  <div class="type"><span class="extra-details-title type-title">Type</span><span class="extra-details-value genre-value">&nbsp&nbsp ${movie.Type}</span></div>
      
                  <div class="generaic"><span class="extra-details-title genre-title">${extra}</span><span class="extra-details-value genre-value">&nbsp&nbsp ${extraValue}</span></div>
                  <div class="director"><span class="extra-details-title director-title">Director</span><span class="extra-details-value genre-value">&nbsp&nbsp ${movie.Director}</span></div>
                  <div class="writer"><span class="extra-details-title writer-title">Writers</span><span class="extra-details-value writer-value">&nbsp&nbsp ${movie.Writer}</span></div>
                  <div class="actor"><span class="extra-details-title actor-title">Actors</span><span class="extra-details-value actor-value">&nbsp&nbsp${movie.Actors}</span></div>
              </div>
          </div>
                <div class="heartbtn">
                    <i class="fas fa-heart card-favorite ${isFav(list, movie.imdbID) ? 'active' : 'passive'}" style="font-size: 40px;" onclick="addRemoveToFavList('${encodeURIComponent(JSON.stringify(movieItem))}',3)"></i>
                </div>
            </div>
        </div>
    </div>`;
    }
}
