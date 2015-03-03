/*
Author: Jonathan Ting
Feel free to bash on any part of my implementation/design

Important Variables:

HOST - url of server to query
GAME - the name of the game
s - what to call svg functions on to draw stuff
svgWidth, svgHeight - the dimensions of the svg (set in .html files)


Guide to implementing a game with this implementation:

Easy - Figure out what GAME is (e.g. "ttt" or "connect4")
Easy - Add in game-specific function callers in init(), update(), and draw()
Hard - Implement game-specific functions (e.g. tttDraw())
*/

//INITIALIZE VARIABLES

var HOST = 'http://localhost:8081/';
var path = location.pathname.split("/");
var GAME = path[path.length - 1].split(".")[0];

var s = Snap("#main-svg");
var epsilon = 5;
var svgWidth = parseInt($("#main-svg").attr("width")) - epsilon;
var svgHeight = parseInt($("#main-svg").attr("height")) - epsilon;

init();

//SERVER REQUESTS

function getStart() {
	$.get(HOST + GAME + '/getStart', function (res) {
		var res = JSON.parse(res);
		getNextMoves(res.response, true);
	});
}

function getNextMoves(board, turn) {
	$.get(HOST + GAME + '/getNextMoveValues?board="' + board + '"', function(res) {
		var res = JSON.parse(res);
		update(board, null, res.response, turn);

		$("g").click(function () {
			var move = $(this).attr("id");
			if (typeof(move) != undefined) update(board, move, res.response, turn);
		});

	});
}

//GAME-SPECIFIC FUNCTION CALLERS

function init() {
	switch(GAME) {
		case "ttt":
			tttBoard();
			break;
	}

	getStart();
}

function update(board, move, possibleMoves, turn) {
	switch(GAME) {
		case "ttt":
			tttUpdate(board, move, possibleMoves, turn);
			break;
	}
}

//GAME-SPECIFIC FUNCTIONS

/* ---------------------------- Tic-Tac-Toe ---------------------------- */

function tttBoard() {
	var i;
	var boardLines = [];
	for (i = 0; i <= 3; i++) {
		var varWidth = (svgWidth * i)/3;
		var varHeight = (svgWidth * i)/3;
		var hozLine = s.line(0, varHeight, svgWidth, varHeight);
		var vertLine = s.line(varWidth, 0, varWidth, svgHeight);
		hozLine.attr({"stroke":"black", "stroke-width": 1});
		vertLine.attr({"stroke":"black", "stroke-width": 1});
	}
}

function tttComputeBestMove(possibleMoves) {
	if (possibleMoves.length == 0) return null;
	var values = {"lose": -1, "tie": 0, "win": 1};
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

function tttUpdate(board, move, possibleMoves, turn) {
	if (turn) { //Human's turn
		if (move != null) board = tttUpdateBoard(board, move, turn);
		if (possibleMoves != null) tttDraw(board, possibleMoves);
		if (move != null) getNextMoves(board, !turn);
	} else { //AI's turn
		if (move != null) getNextMoves(tttUpdateBoard(board, move, turn), !turn);
		if (possibleMoves != null) tttUpdate(board, tttComputeBestMove(possibleMoves), null, turn);
	}
}

function tttDraw(board, possibleMoves) {
	//Erase all moves
	$("g").remove();

	//Draw existing moves
	for (var i = 0; i < board.length; i++) {
		move = i;
		var posX = (move % 3) * (svgWidth/3) + (svgWidth/6);
		var posY = Math.floor(move / 3) * (svgHeight/3) + (svgHeight/6);
		if (board[i] == 'x') {
			var rectWidth = 15, rectHeight = 150;
			var rect1 = s.rect(0, 0, rectWidth, rectHeight);
			var rect2 = s.rect(0, 0, rectWidth, rectHeight);
			var x = s.group(rect1, rect2);

			var factor = Math.cos(Math.PI/4)/2;
			var rect1X = (posX + rectHeight * factor - rectWidth * factor).toString();
			var rect2X = (posX - rectHeight * factor - rectWidth * factor).toString();
			var rect1Y = (posY - rectHeight * factor - rectWidth * factor).toString();
			var rect2Y = (posY - rectHeight * factor + rectWidth * factor).toString();

			x.attr({ fill: "#00f" });
			rect1.attr({ transform: 'translate(' + rect1X + ',' + rect1Y + ') rotate(45, 0, 0)' });
			rect2.attr({ transform: 'translate(' + rect2X + ',' + rect2Y + ') rotate(-45, 0, 0)' });
		} else if (board[i] == 'o') {
			var circle1 = s.circle(posX, posY, Math.min(svgWidth, svgHeight)/6 * (2/3));
			var circle2 = s.circle(posX, posY, Math.min(svgWidth, svgHeight)/6 * (2/3) - 15);
			var o = s.group(circle1, circle2);

			circle1.attr({ fill: "#f00" });
			circle2.attr({ fill: "#fff" });
		}
	}

	//Draw possible moves
	for (var i = 0; i < possibleMoves.length; i++) {
		console.log(possibleMoves[i]);
		move = possibleMoves[i].move - 1; //We want it to be 0-indexed
		var posX = (parseInt(move) % 3) * (svgWidth/3) + (svgWidth/6);
		var posY = Math.floor(parseInt(move) / 3) * (svgHeight/3) + (svgHeight/6);

		var rectWidth = 15, rectHeight = 150;
		var rect1 = s.rect(0, 0, rectWidth, rectHeight);
		var rect2 = s.rect(0, 0, rectWidth, rectHeight);

		var factor = Math.cos(Math.PI/4)/2;
		var rect1X = (posX + rectHeight * factor - rectWidth * factor).toString();
		var rect2X = (posX - rectHeight * factor - rectWidth * factor).toString();
		var rect1Y = (posY - rectHeight * factor - rectWidth * factor).toString();
		var rect2Y = (posY - rectHeight * factor + rectWidth * factor).toString();

		//Purpose of circle is to let hover be activated when cursor is near the X, but not exactly on
		var circle = s.circle(posX, posY, Math.min(svgWidth, svgHeight)/6 - 5);
		var x = s.group(circle, rect1, rect2);

		x.attr({ fill: "#eef", id: move.toString() });
		circle.attr({ opacity: 0 });
		rect1.attr({ transform: 'translate(' + rect1X + ',' + rect1Y + ') rotate(45, 0, 0)' });
		rect2.attr({ transform: 'translate(' + rect2X + ',' + rect2Y + ') rotate(-45, 0, 0)' });
	}
}