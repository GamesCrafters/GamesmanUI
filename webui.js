$(document).ready( function() {
  // iterate through games/games.json
  // which we assume to contain information about games in games/<gamename>
  // append a menu item to #menu for each game, embed the right <gamename>.js
  // file in the data-game-src attribute
  //
  // this <gamename>.js file should attach handlers, render, etc
  // to the #gameBoard div element
  for (var key in games) {
    if (games.hasOwnProperty(key)) {
      var game = "";
      game += "<div class='game flex-elem' id='" + key + "' ";
      game +=       "data-game-src='" + games[key].src + "'>\n";
      game += "  <a href='#" + key + "'><img src='" + games[key].img + "'></a>\n";
      game += "  <h3 class='game-title'>" + games[key].title + "</h3>\n";
      game += "  <p class='game-desc'>" + games[key].desc + "</p>\n";
      game += "</div>";
      $("#menu").append(game);
    }
  }

  $(".game a").on("click", showGame);

  // perform URL magic
  var curloc = new URI(window.location);
  var gameName = curloc.hash().substr(1);
  if (games.hasOwnProperty(gameName)) {
    console.log("displaying " + curloc.hash());
    showGame(null, "games/" + gameName + "/" + gameName + ".js");
  }
});

function showGame(e, gameScript) {
  gameScript = gameScript || $(this).parent().attr("data-game-src");
  console.log($(this).parent().attr("data-game-src"));
  console.log(gameScript);
  $("#gameScreen").show();
  $("#menu").hide();
  $.getScript(gameScript);
}

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

function getStart(game, callback) {
  $.get('http://nyc.cs.berkeley.edu:8081/' + game + '/getStart', function (res) {
    var res = JSON.parse(res);
    callback(res.response);
  });
}

function drawBoard (svg, boardString) {
  console.log('drawing', boardString);
}
