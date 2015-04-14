var gcutil = {
  makeSVG: function (holder) {
    $(holder).append('<svg class="grow full"></svg>');
    return Snap($(holder).children().last()[0]);
  },
};
