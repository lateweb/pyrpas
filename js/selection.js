// js/selection.js
(function() {
  'use strict';

  const wastePileEl = document.getElementById('waste-pile');

  window.game.selectPyramidCard = function(idx) {
    if (window.game.gameOver || window.game.isAnimating || window.game.pyramid[idx].removed || !window.game.isExposed(idx)) return;

    // If the Waste card is actively selected, complete pair with this pyramid card if matching
    if (window.game.wasteSelected) {
      if (window.game.waste && window.game.pyramid[idx].rank + window.game.waste.rank === 13) {
        window.game.pairWasteWithPyramid(idx);
        return; 
      } else {
        // User clicked a non-matching card, so clear the waste selection and select this card instead
        window.game.clearAllHighlights(); 
      }
    }

    // If the same pyramid card is clicked again, deselect it
    if (window.game.selectedIndex === idx) {
      window.game.clearAllHighlights();
      return;
    }

    // If a pyramid card is already selected as the first click, handle second click
    if (window.game.selectedIndex !== null) {
      if (window.game.possibleMatchIndices.includes(idx)) {
        // Second click is a valid match -> pair
        window.game.removePair(window.game.selectedIndex, idx);
        window.game.selectedIndex = null;
        window.game.possibleMatchIndices = [];
        window.game.clearAllHighlights();
        return;
      } else {
        // Second click is not a match -> clear selection and start over with this new card
        window.game.selectedIndex = null;
        window.game.possibleMatchIndices = [];
        window.game.clearAllHighlights();
        // Fall through to treat this new card as the first click
      }
    }

    if (window.game.pyramid[idx].rank === 13) {
      window.game.removeKing(idx);
      return;
    }

    const target = 13 - window.game.pyramid[idx].rank;
    const exposed = window.game.getExposed();
    const matches = exposed.filter(i => i !== idx && window.game.pyramid[i].rank === target);

    if (window.game.settings.clickBoth) {
      // Two-click mode: always select the card first, never auto-pair or highlight
      window.game.clearAllHighlights();
      window.game.selectedIndex = idx;
      window.game.possibleMatchIndices = matches; // matches may be empty
      window.game.pyramid[idx].el.classList.add('selected');
      return;
    }

    // Default mode (clickBoth off): auto-pair if possible
    if (matches.length === 1) {
      window.game.removePair(idx, matches[0]);
      window.game.clearAllHighlights();
    } else if (matches.length > 1) {
      window.game.selectedIndex = idx;
      window.game.possibleMatchIndices = matches;
      window.game.highlightSelection(idx, matches);
    } else {
      if (window.game.waste !== null && window.game.waste.rank === target) {
        window.game.pairWasteWithPyramid(idx);
      }
    }
  };
})();