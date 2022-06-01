var movies = [];
var suggestedMovies = [];
var seenCards = [];
var suggestedCards = [];
var idCache = {}
var cardCache = {};

// const BASE_URL = "http://0.0.0.0:8000/";
const BASE_URL = "https://prafullasd-movbee-server.modal.run/"

window.onload=function(){
    document.getElementById('movie').addEventListener('keydown', function onEvent(event) {
        if (event.key === "Enter") {
            addMovie();
        }
    });
    document.getElementById('prompt').addEventListener('keydown', function onEvent(event) {
        if (event.key === "Enter") {
            getSuggested();
        }
    });
}

function getCard(imdb_id, card, updateView){
    if (imdb_id in cardCache){
        result = cardCache[imdb_id];
        update_dic(card, result);
        updateView();
    }
    else {
        $.ajax({
            url:BASE_URL + "card/" + imdb_id,
            type:"GET",
            dataType: 'json',
            success: function(result){
                console.log(result);
                cardCache[imdb_id] = result;
                update_dic(card, result);
                updateView();
            },
            error: function(result){
                console.log(result)
            }
        })
    }
}

function getMovieAndID(movie, callback){
    if (movie in idCache){
        result = {"movie": movie, "imdb_id": idCache[movie]}
        callback(result);
    }
    else {
        $.ajax({
            url:BASE_URL + "movie",
            type:"POST",
            data: JSON.stringify({"movie": movie}),
            dataType: 'json',
            contentType: 'application/json',
            success: function(result){
                console.log(result);
                idCache[result["movie"]] = result["imdb_id"]
                callback(result);
            },
            error: function(result){
                console.log(result)
            }
        })
    }
}


function update_dic(a,b){
	for (key in b) {
		a[key] = b[key];
    }
}

function dummyCard(movie) {
    return {
        "cover": "",
        "url": "",
        "title": movie,
        "kind": "",
        "rating": "",
        "runtime": "",
        "genres": "",
        "plot": "",
    }
}

function updateSeen() {
    var template = $.templates("#tmpSeen");
    template.link("#seen", seenCards);
}

function updateSuggested() {
    var template = $.templates("#tmpSuggested");
    template.link("#suggested", suggestedCards);
}

function addMovieByName(movie){
    var movie = movie.trim();
    callback = function(result){
        movie = result["movie"];
        movies.unshift(movie);
        card = dummyCard(movie);
        seenCards.unshift(card);
        updateSeen();
        getCard(result["imdb_id"], card, updateSeen)
    }
    getMovieAndID(movie, callback);
}

function addMovie() {
    var addMovies = document.getElementById("movie").value.split(",");
    document.getElementById("movie").value = "";
    for (var movie of addMovies){
        addMovieByName(movie);
    }
}

function getSuggested() {
    suggestedCards = [];
    suggestedMovies = [];
    callback = function(results){
        for (var result of results) {
            card = dummyCard(result["movie"]);
            suggestedMovies.push(result["movie"]);
            suggestedCards.push(card);
            updateSuggested();
            getCard(result["imdb_id"], card, updateSuggested);
        }
    }
    var prompt = document.getElementById("prompt").value;
    $.ajax({
        url: BASE_URL + "suggest",
        type:"POST",
        data: JSON.stringify({"movies": movies, prompt: prompt}),
        dataType: 'json',
        contentType: 'application/json',
        success: function(result){
            console.log(result);
            callback(result);
        },
        error: function(result){
            console.log(result)
        }
    })
}

function undo(){
    movies.shift();
    seenCards.shift();
    updateSeen();
}

function add(movie){
    addMovieByName(movie);
}

function copy(){
  navigator.clipboard.writeText(suggestedMovies.join("\n")).then(() => {
      document.getElementById("copyBtn").style = "background:#222";
  })
  .catch((error) => { alert(`Copy failed! ${error}`) })
}
