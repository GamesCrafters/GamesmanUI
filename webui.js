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

  $(".game-entry").on("click", function () {
    showGame($(this).attr("data-game-name"));
  });
  if (globalGameName() !== undefined) {
    showGame(globalGameName());
  }
  $(window).on('resize', redrawBoard);
});

function redrawBoard () {
  $("#game-board").html("");
  if (globalRenderer) {
    globalRenderer.drawBoard(globalGameBoard());
  }
}

function showGame(gameName) {
  globalRenderer = null;
  redrawBoard();
  var gameScript = games[gameName].src;
  $.getScript(gameScript, function () {
    startGame(gameName);
  });
}

var HOST = 'http://localhost:8081/';
var path = location.pathname.split("/");

function globalHashParams(params) {
  if (params !== undefined) {
    window.location.hash = "?" + URI.buildQuery(params);
  }
  if (window.location.hash === "") {
    return {};
  } else {
    return URI.parseQuery(window.location.hash.substr(1));
  }
};

function makeParamFunction(name) {
  return function (new_val) {
    params = globalHashParams();
    if (new_val !== undefined) {
      params[name] = new_val;
      globalHashParams(params);
    }
    return params[name];
  };
}

var globalGameName = makeParamFunction('game');
var globalGameBoard = makeParamFunction('board');

var globalRenderer = null;
var gameValueCache = {};

// get the current game name out of the URL.
/* getStart, updatePosition */
function startGame(gameName) {
  game = games[gameName];
  globalRenderer = game.renderer($('#game-board'));
  queryClassic(gameName, 'getStart', {}, function (res) {
    var board = JSON.parse(res).response;
    globalHashParams({
      board: board,
      game: gameName
    });
    try {
      globalRenderer.drawBoard(board);
    } catch (err) {
      console.error('Error drawing board', err);
    }
    getNextMoves(board, drawMoves);
  });
}

function queryClassic(gameName, cmd, params, callback, ecallback) {
  if (!gameName) {
    throw new Exception("You passed an invalid game name (" + gameName + ") into queryClassic.");
  }
  var url = HOST + gameName + '/' + cmd + URI.buildQuery(params);
  $.get(url, callback, ecallback);
}

function getNextMoves(board, callback) {
  if (gameValueCache.hasOwnProperty(board)) {
    if (callback) {
      callback(board, gameValueCache[board]);
    }
  } else {
    queryClassic(globalGameName(), 'getNextMoveValues', {board: board},
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




