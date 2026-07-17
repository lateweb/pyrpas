// js/deck.js
(function() {
  'use strict';

  window.game.generateDeck = function() {
    const deck = [];
    for (const suit of SUITS) {
      for (const rc of ['A','2','3','4','5','6','7','8','9','0','J','Q','K']) {
        const code = rc + suit;
        deck.push({
          rank: RANK_MAP[rc],
          suit: SUIT_NAMES[suit],
          code,
          front: `https://deckofcardsapi.com/static/img/${code}.png`,
          back: BACK_IMG
        });
      }
    }
    return deck;
  };

  window.game.shuffle = function(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
})();