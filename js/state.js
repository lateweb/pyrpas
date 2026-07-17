// js/state.js
window.game = {
  pyramid: [],
  stock: [],
  waste: null,
  stockIndex: 0,
  gameOver: false,
  win: false,
  isAnimating: false,
  selectedIndex: null,
  wasteSelected: false,
  possibleMatchIndices: [],
  settings: {
    clickBoth: false
  }
};