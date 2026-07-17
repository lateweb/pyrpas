// js/constants.js
// We have removed the hardcoded sizing constants (CARD_W, CARD_H). 
// Dimensions are now dynamically calculated in position.js to guarantee fully responsive sizes.
const RANK_MAP = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9, '0': 10,
  'J': 11, 'Q': 12, 'K': 13
};

const SUITS = ['S', 'D', 'C', 'H'];
const SUIT_NAMES = {
  'S': 'PATA',
  'D': 'RUUTU',
  'C': 'RISTI',
  'H': 'HERTTA'
};

const BACK_IMG = 'https://deckofcardsapi.com/static/img/back.png';