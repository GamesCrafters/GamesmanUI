/*  
 *  GamesCrafters Spring 2015
 */

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
  $(window).on('resize', redrawBoard);

  // This should actually call the appropriate (un)doMove functions, if
  // possible.
  $(window).on('hashchange', reload);

  reload();
});

function reload() {
  if (globalGameName() !== undefined) {
    if (!globalGameBoard()) {
      showGame(globalGameName());
    } else {
      loadGame(globalGameName(), redrawBoard);
    }
  }
}

function selectGame(gameName) {
  $(".selected-game").removeClass("selected-game");
  $("#entry-" + gameName).addClass("selected-game");
}

function redrawBoard () {
  $("#game-board").html("");
  if (globalRenderer) {
    var board = globalGameBoard();
    globalRenderer.drawBoard(board);
    getNextMoves(board, drawMoves);
  }
}

function loadGame(gameName, callback) {
  selectGame(gameName);
  var gameScript = games[gameName].src;
  $.getScript(gameScript)
    .done(function (script, textStatus) {
      var game = games[gameName];
      globalRenderer = game.renderer($('#game-board'));
      if (callback) {
        callback(gameName);
      }
    })
    .fail(function (jqxhr, settings, exception) {
      console.error(exception);
    });
}

function showGame(gameName) {
  globalRenderer = null;
  redrawBoard();
  loadGame(gameName, startGame);
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
  queryClassic(gameName, 'getStart', {}, function (board) {
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
  var url = HOST + gameName + '/' + cmd + "?" + URI.buildQuery(params);
  $.get(url, function (res) {
    callback(JSON.parse(res).response)
  }, ecallback);
}

function getNextMoves(board, callback) {
  if (gameValueCache.hasOwnProperty(board)) {
    if (callback) {
      callback(board, gameValueCache[board]);
    }
  } else {
    queryClassic(globalGameName(), 'getNextMoveValues', {board: board},
      function(next) {
        gameValueCache[board] = next;
        if (callback) {
          callback(board, next);
        }
      });
  }
}

function colorMoves(moves) {
  var ms = _(moves);
  var idx = {};
  var i = 0;
  var j = 0;
  for (i = 0; i < moves.length; i++) {
    idx[moves[i].board] = i;
  }

  var opacity = [1, 0.5, 0.1];
  function getOpacity (index) {
    return opacity[_.min([index, opacity.length - 1])];
  }

  var colors = [];
  theMoves = ms;

  var winMoves = ms.filter(function (move) { return move.value[0] == "l" })
                      .sort(function (move) { return move.remoteness })
                      .value()
  var loseMoves = ms.filter(function (move) { return move.value[0] == "w" })
                       .sort(function (move) { return -move.remoteness })
                       .value()
  var tieMoves = ms.filter(function (move) { return move.value[0] == "t" })
                      .sort(function (move) { return move.remoteness })
                      .value()
  j = 0;
  for (i = 0; i < winMoves.length; i++) {
    if (i > 0 && winMoves[i - 1].remoteness !== winMoves[i].remoteness) {
      j += 1;
    }
    colors[idx[winMoves[i].board]] = "rgba(0, 255, 0, " + getOpacity(j) + ")";
  }
  j = 0
  for (i = 0; i < loseMoves.length; i++) {
    if (i > 0 && loseMoves[i - 1].remoteness !== loseMoves[i].remoteness) {
      j += 1;
    }
    colors[idx[loseMoves[i].board]] = "rgba(139, 0, 0, " + getOpacity(j) + ")";
  }
  j = 0
  for (i = 0; i < tieMoves.length; i++) {
    if (i > 0 && tieMoves[i - 1].remoteness !== tieMoves[i].remoteness) {
      j += 1;
    }
    colors[idx[tieMoves[i].board]] = "rgba(255, 255, 0, " + getOpacity(j) + ")";
  }
  return colors;
}

/* drawBoard, getNextMoveValues, addMove */
// doMove starts animation, getNextMove Values 
function drawMoves(board, nextMoves) {
  globalRenderer.clearMoves();
  var colors = colorMoves(nextMoves);
  for (var i = 0; i < nextMoves.length; i++) { 
    var move = nextMoves[i].move;
    var value = nextMoves[i].value;
    var nextBoard = nextMoves[i].board;
    var color = colors[i];

    var clickCallBack = function (nextBoard, move) { 
        return function() {
          globalGameBoard(nextBoard);
          globalRenderer.clearMoves();
          getNextMoves(nextBoard);
          globalRenderer.doMove(move, function() { getNextMoves(nextBoard, drawMoves); },
                                nextBoard, board); 
        }
    } (nextBoard, move);

    globalRenderer.drawMove(move, value, color, clickCallBack, board, nextBoard);
  }
}

function syncCallback(callback) {
  
}