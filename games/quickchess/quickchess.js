games.quickchess.renderer = function (target) {

  function getData (renderer, board) {
    var rows = 4;
    var columns = 3;

    var r = Math.max(rows, columns);
    var m = Math.min(rows, columns);
    var pixels = Math.min(rows * renderer.target.width(),
                          columns * renderer.target.height()) / m;
    var border = 8;
    var square_pixels = (pixels - border) / r;
    var leftAdjust = (renderer.target.width() / 2
                      - border
                      - square_pixels * columns / 2);

    function squareAt(x, y) {
        return {x: leftAdjust + border + x * square_pixels,
                y:  border + y * square_pixels};
    };

    return {
      rows: rows,
      columns: columns,
      pxPerSquare: square_pixels,
      border: border,
      squareAt: squareAt
    };
  }

  function transformString(data, r, scale) {
      var trans = '';
      trans = trans + ' translate(' + (r.x + 0.5 * data.border) + ','
                                    + (r.y + data.border) + ')';
      trans = trans + ' scale(' + scale + ')';
      console.log(trans);
      return trans;
  }

  function drawPieces(renderer, s, board) {
    var data = getData(renderer, board);
    var pieceImgSources = {
      'k': 'Chess_kdt45.svg',
      'K': 'Chess_klt45.svg',
      'q': 'Chess_qdt45.svg',
      'Q': 'Chess_qlt45.svg',
      'r': 'Chess_rdt45.svg',
      'R': 'Chess_rlt45.svg'
    };
    var pieces = board.split(';')[0];
    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      if (p !== ' ') {
        var img = 'games/quickchess/' + pieceImgSources[p];
        var x = i % data.columns;
        var y = Math.floor(i / data.columns);
        var r = data.squareAt(x, y);
        var image = s.image(img);
        image.transform(transformString(data, r,
              (data.pxPerSquare - 2 * data.border) / 45));
        image.selected = false;
        image.click(function (r) {
          return function () {
            if (!this.selected) {
              this.selected = true;
              var px = 0.2 * (data.pxPerSquare - 2 * data.border) / 2;
              this.transform(transformString(data, {x: r.x - px, y: r.y - px},
                    1.2 * (data.pxPerSquare - 2 * data.border) / 45));
            } else {
              this.selected = false;
              this.transform(transformString(data, r,
                    (data.pxPerSquare - 2 * data.border) / 45));
            }
          };
        }(r));
      }
    }
  }

  function drawBackground (renderer, s, board) {
    var data = getData(renderer, board);

    var squares = s.g();

    for (var x = 0; x < data.columns; x++) {
      for (var y = 0; y < data.rows; y++) {
        var r = data.squareAt(x, y);
        var square = s.rect(
            r.x,
            r.y,
            data.pxPerSquare - data.border,
            data.pxPerSquare - data.border
            );
        if ((x + y) % 2 === 0) {
          square.attr({
            fill: '#666'
          });
        } else {
          square.attr({
            fill: '#888'
          });
        }
        squares.add(square);
      }
    }
    return squares;
  }

  var renderer = {
    target: target,
    drawBoard: function (boardString) {
      console.log('calling makeSVG with target', target);
      var svg = gcutil.makeSVG(target);
      console.log('done calling makeSVG');
      var squareGroup = drawBackground(renderer, svg);
      var pieces = drawPieces(renderer, svg, boardString);
    },
    clearMoves: function () {
    },
    drawMove: function () {
    },
  };
  return renderer;
};
