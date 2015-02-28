/*
$(function () {
  refresh();
  $('#game-input').on('input', refresh);
  $('#position').on('input', function () {
    drawBoard(Snap('#main-svg'), $('#position').val());
  });
});

function refresh() {
  getStart($('#game-input').val(), function (start) {
    $('#position').val(start);
    drawBoard(Snap('#main-svg'), start);
  });
}
*/

//Server request functions

function getStart(game, callback) {
  //$.get('http://nyc.cs.berkeley.edu:8081/' + game + '/getStart', function (res) {
  $.get('http://localhost:8081/' + game + '/getStart', function (res) {
    var res = JSON.parse(res);
    callback(res.response);
  });
}

function tttParse(response) {
  console.log(response);
}

//Board Functions

function initBoard(game) {
  if (game == "ttt") {
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

function drawBoard (svg, boardString) {
  console.log('drawing', boardString);
}

//Initialize game
var path = location.pathname.split("/");
var game = path[path.length - 1].split(".")[0];

var s = Snap("#main-svg");
var epsilon = 5;
var svgWidth = parseInt($("#main-svg").attr("width")) - epsilon;
var svgHeight = parseInt($("#main-svg").attr("height")) - epsilon;

//Set up board for game
initBoard(game)

//Request starting board information from server
getStart(game, tttParse);
