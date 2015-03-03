//Server request functions

function getStart(callback) {
  $.get(HOST + GAME + '/getStart', function (res) {
    var res = JSON.parse(res);
    callback(res.response);
  });
}

function getNextMoves(callback, board) {
  $.get(HOST + GAME + '/getNextMoveValues?board="' + board + '"', function(res) {
    var res = JSON.parse(res);
    callback(res.response);
  });
}

function getCallback() {
  if (GAME == "ttt") {
    return tttRun;
  } else {
    return None;
  }
}

//Board Functions

function initBoard() {
  if (GAME == "ttt") {
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
}

//Game Specific Functions

//Tic-Tac-Toe
function tttRun(response) {
  getNextMoves(tttDraw, response);
}

function tttDraw(response) {
  //Draw possible moves
  for (var i = 0; i < response.length; i++) {
    move = response[i].move - 1; //We want it to be 0-indexed
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

    x.attr({
      fill: "#eef"
    });
    circle.attr({
      opacity: 0
    });
    rect1.attr({
      transform: 'translate(' + rect1X + ',' + rect1Y + ') rotate(45, 0, 0)'
    });
    rect2.attr({
      transform: 'translate(' + rect2X + ',' + rect2Y + ') rotate(-45, 0, 0)'
    });
  }
}


/*
Important Variables:

HOST - server to query
GAME - the name of game being played
s - the svg to draw on
svgWidth, svgHeight - dimensions of svg
*/

//Initialize game
var HOST = 'http://localhost:8081/';
var path = location.pathname.split("/");
var GAME = path[path.length - 1].split(".")[0];

var s = Snap("#main-svg");
var epsilon = 5;
var svgWidth = parseInt($("#main-svg").attr("width")) - epsilon;
var svgHeight = parseInt($("#main-svg").attr("height")) - epsilon;

//Draw initial board
initBoard()
getStart(getCallback());