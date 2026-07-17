// js/geometry.js
(function() {
  'use strict';

  const children = [
    [1,2], [3,4], [4,5], [6,7], [7,8],
    [8,9], [10,11], [11,12], [12,13], [13,14],
    [], [], [], [], []
  ];

  window.game.isExposed = function(idx) {
    const pyramid = window.game.pyramid;
    if (pyramid[idx].removed) return false;
    const ch = children[idx];
    if (ch.length === 0) return true;
    return pyramid[ch[0]].removed && pyramid[ch[1]].removed;
  };

  window.game.getExposed = function() {
    const res = [];
    for (let i = 0; i < 15; i++) {
      if (window.game.isExposed(i)) res.push(i);
    }
    return res;
  };

  window.game.countPyramid = function() {
    return window.game.pyramid.filter(c => !c.removed).length;
  };
})();