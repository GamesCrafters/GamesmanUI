/*  
 *  View Controller for GamesManUI
 *
 *  GamesCrafters Spring 2015
*/


/* --> url change,  --> startGame */
$(document).ready(function() {
  // iterate through games/games.json
  // which we assume to contain information about games in games/<gamename>
  // append a menu item to #menu for each game, embed the right <gamename>.js
  // file in the data-game-src attribute
  //
  // this <gamename>.js file should attach handlers, render, etc
  // to the #game-board div element
  var entryTemplate =
    Handlebars.compile($('#game-entry-template').html());
  _.map(games, function (game, name) {
    game.name = name;
    $('#game-menu').append(entryTemplate(game));
  });

  $(".game-entry a").on("click", function () {
    showGame($(this).parent().attr("data-game-name"));
  });

  // perform URL magic
  var curloc = new URI(window.location);
  var gameName = curloc.hash().substr(1);
  if (games.hasOwnProperty(gameName)) {
    console.log("displaying " + curloc.hash());
    showGame(null, gameName);
  }
});

function showGame(gameName) {
  var gameScript = games[gameName].src;
  $("#game-screen").show();
  $("#game-menu").hide();
  $.getScript(gameScript);
  var newloc = new URI(window.location);
  newloc.hash("");
  newloc.hash(URI.buildQuery({
    game: gameName
  }));
  window.location = newloc.toString();
  console.log(newloc.toString());
}

var HOST = 'http://localhost:8081/';
var path = location.pathname.split("/");

function getGameName() {
  var loc = new URI(window.location).hash();
  return URI.parseQuery(loc).game;
}

var globalRenderer = null;
var gameValueCache = {};

// get the current game name out of the URL.
/* getStart, updatePosition */
function startGame() {
  globalRenderer = games[getGameName()].renderer($('#game-board'));
  $.get(HOST + getGameName() + '/getStart', function (res) {
    var board = JSON.parse(res).response;
    globalRenderer.drawBoard(board);
    getNextMoves(board, drawMoves);
  });
}

function getNextMoves(board, callback) {
  if (gameValueCache.hasOwnProperty(board)) {
    if (callback) {
      callback(board, gameValueCache[board]);
    }
  } else {
    $.get(HOST + getGameName() + '/getNextMoveValues?board="' + board + '"',
          function(res2) {
            var next = JSON.parse(res2);
            gameValueCache[board] = next;
            if (callback) {
              callback(board, next);
            }
          });
  }
}

/* drawBoard, getNextMoveValues, addMove */
// doMove starts animation, getNextMove Values 
function drawMoves(board, nextMoves) {
  globalRenderer.clearMoves();
  for (var i = 0; i < nextMoves.length; i++) { 
    var move = nextMoves[i].move;
    var value = nextMoves[i].value;
    var nextBoard = nextMoves[i].board;

    var clickCallBack = function(nextBoard, move) { 
        return function() {
          globalRender.clearMoves();
          getNextMoves(nextBoard);
          globalRender.doMove(move, function() {
                getNextMoves(nextBoard, drawMoves); },
            nextBoard, board); 
    }} (nextBoard, move);

    globalRenderer.drawMove(move, value, clickCallBack, board, nextBoard);
  }
}




