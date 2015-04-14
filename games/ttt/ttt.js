games.ttt.renderer = function(target) {
  var renderer = {
    target: target,
    svg: null,
    width: null,
    height: null,
    drawBoard: function (board) {
      renderer.svg = gcutil.makeSVG(target);
      $(target).children().last().width($(target).height() + 10);
      $(target).children().last().height($(target).height() + 10);
      renderer.width = $(target).height();
      renderer.height = $(target).height();
      tttBoard(renderer);
      tttDraw(renderer, board);
    },
    drawMove: function (move, value, clickCallBack, board, nextBoard) {
      drawMove(renderer, move, value, clickCallBack, board, nextBoard);
    },
    clearMoves: function () {
    },
  };
  return renderer;
}

/* ---------------------------- Tic-Tac-Toe ---------------------------- */

//Draws a basic 3x3 board
function tttBoard(renderer) {
  var i;
  var boardLines = [];
  for (i = 0; i <= 3; i++) {
    var varWidth = (renderer.width * i)/3;
    var varHeight = (renderer.width * i)/3;
    var hozLine = renderer.svg.line(0, varHeight, renderer.width, varHeight);
    var vertLine = renderer.svg.line(varWidth, 0, varWidth, renderer.height);
    hozLine.attr({"stroke":"black", "stroke-width": 1});
    vertLine.attr({"stroke":"black", "stroke-width": 1});
  }
}

//Given a list of possible movies, the AI computes the best move it can take
function tttComputeBestMove(possibleMoves) {
  if (possibleMoves.length == 0) return null;
  //From AI's point of view, wants us to lose
  var values = {"lose": 1, "tie": 0, "win": -1};
  var bestMove = null, maxValue = null, minRemote = null;
  for (var i = 0; i < possibleMoves.length; i++) {
    var val = values[possibleMoves[i].value];
    var remote = values[possibleMoves[i].remoteness]
    if (bestMove == null | val > maxValue | (val == maxValue && remote < minRemote)) {
      bestMove = possibleMoves[i].move;
      maxValue = val;
      minRemote = remote;
    }
  }
  return parseInt(bestMove) - 1; //0-indexed
}

//Returns a string representing a new board after a move
function tttUpdateBoard(board, move, turn) {
  var piece = "x";
  if (!turn) piece = "o";
  var newBoard = "";
  for (var i = 0; i < board.length; i++) {
    if (i == move) newBoard += piece;
    else newBoard += board[i];
  }
  return newBoard;
}

//Confusing atm, gotta document later
function tttUpdate(board, move, possibleMoves, turn) {
  //Endgame case
  if (possibleMoves != null && possibleMoves.length == 0) {
    tttDraw(board);
    return
  }
  /*
    Human: update if possible, draw if possible, then call getNextMoves for opponent if a move has been made
    AI: find a move it hasn't, then call getNextMoves for opponent with the updated board
  */
  if (turn) { //Human's turn
    if (move != null) board = tttUpdateBoard(board, move, turn);
    if (possibleMoves != null) tttDraw(board);
    if (move != null) getNextMoves(board, !turn);
  } else { //AI's turn
    if (possibleMoves != null) tttUpdate(board, tttComputeBestMove(possibleMoves), null, turn);
    if (move != null) getNextMoves(tttUpdateBoard(board, move, turn), !turn);
  }
}

//Draws the board and possible moves
function tttDraw(renderer, board) {
  //Erase all moves

  // Draw existing moves
  for (var i = 0; i < board.length; i++) {
    move = i;
    var posX = (move % 3) * (renderer.width/3) + (renderer.width/6);
    var posY = Math.floor(move / 3) * (renderer.height/3) + (renderer.height/6);
    if (board[i] == 'x') {
      var rectWidth = 15, rectHeight = 150;
      var rect1 = renderer.svg.rect(0, 0, rectWidth, rectHeight);
      var rect2 = renderer.svg.rect(0, 0, rectWidth, rectHeight);
      var x = renderer.svg.group(rect1, rect2);

      var factor = Math.cos(Math.PI/4)/2;
      var rect1X = (posX + rectHeight * factor - rectWidth * factor).toString();
      var rect2X = (posX - rectHeight * factor - rectWidth * factor).toString();
      var rect1Y = (posY - rectHeight * factor - rectWidth * factor).toString();
      var rect2Y = (posY - rectHeight * factor + rectWidth * factor).toString();

      x.attr({ fill: "#00f" });
      rect1.attr({ transform: 'translate(' + rect1X + ',' + rect1Y + ') rotate(45, 0, 0)' });
      rect2.attr({ transform: 'translate(' + rect2X + ',' + rect2Y + ') rotate(-45, 0, 0)' });
    } else if (board[i] == 'o') {
      var circle1 = renderer.svg.circle(posX, posY, Math.min(renderer.width, renderer.height)/6 * (2/3));
      var circle2 = renderer.svg.circle(posX, posY, Math.min(renderer.width, renderer.height)/6 * (2/3) - 15);
      var o = renderer.svg.group(circle1, circle2);

      circle1.attr({ fill: "#f00" });
      circle2.attr({ fill: "#bbb" });
    }
  }
}

function drawMove(renderer, move, value, clickCallBack, board, nextBoard) {
  console.log('in drawMove');
  var move = move - 1; // We want it to be 0-indexed
  var posX = (parseInt(move) % 3) * (renderer.width/3) + (renderer.width/6);
  var posY = Math.floor(parseInt(move) / 3) * (renderer.height/3) + (renderer.height/6);

  var rectWidth = 15, rectHeight = 150;
  var rect1 = renderer.svg.rect(0, 0, rectWidth, rectHeight);
  var rect2 = renderer.svg.rect(0, 0, rectWidth, rectHeight);

  var factor = Math.cos(Math.PI/4)/2;
  var rect1X = (posX + rectHeight * factor - rectWidth * factor).toString();
  var rect2X = (posX - rectHeight * factor - rectWidth * factor).toString();
  var rect1Y = (posY - rectHeight * factor - rectWidth * factor).toString();
  var rect2Y = (posY - rectHeight * factor + rectWidth * factor).toString();

  //Purpose of circle is to let hover be activated when cursor is near the X, but not exactly on
  var circle = renderer.svg.circle(posX, posY, Math.min(renderer.width, renderer.height)/6 - 5);
  var x = renderer.svg.group(circle, rect1, rect2);

  x.attr({ fill: "#eef", id: move.toString() });
  circle.attr({ opacity: 0 });
  rect1.attr({ transform: 'translate(' + rect1X + ',' + rect1Y + ') rotate(45, 0, 0)' });
  rect2.attr({ transform: 'translate(' + rect2X + ',' + rect2Y + ') rotate(-45, 0, 0)' });
}
