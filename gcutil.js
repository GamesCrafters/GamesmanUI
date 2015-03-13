var gcutil = {
  makeSVG: function (holder) {
    $(holder).append('<svg></svg>');
    return Snap($(holder).children().last());
  },
};
