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
