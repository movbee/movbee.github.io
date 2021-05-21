var movies = [];
var seenCards = [];
var suggestedCards = [];

window.onload=function(){
    const node = document.getElementById('movie');
    node.addEventListener('keydown', function onEvent(event) {
        if (event.key === "Enter") {
            addMovie();
        }
    });
}

function getCard(imdb_id, card, updateView){
    $.ajax({
        url:"https://prafullasd.pythonanywhere.com/card/" + imdb_id,
        type:"GET",
        dataType: 'json',
        success: function(result){
            console.log(result);
            update_dic(card, result);
            updateView();
        },
        error: function(result){
            console.log(result)
        }
    })
}

function getMovieAndID(movie, callback){
    $.ajax({
        url:"https://prafullasd.pythonanywhere.com/movie",
        type:"POST",
        data: JSON.stringify({"movie": movie}),
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
    callback = function(results){
        for (var result of results) {
            card = dummyCard(result["movie"]);
            suggestedCards.push(card);
            updateSuggested();
            getCard(result["imdb_id"], card, updateSuggested);
        }
    }
    $.ajax({
        url:"https://prafullasd.pythonanywhere.com/suggest",
        type:"POST",
        data: JSON.stringify({"movies": movies, "tries": 1}),
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
  navigator.clipboard.writeText(movies.join(", ")).then(() => {
      document.getElementById("copyBtn").style = "background:#222";
  })
  .catch((error) => { alert(`Copy failed! ${error}`) })
}