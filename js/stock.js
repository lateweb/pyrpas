// js/stock.js
(function() {
  'use strict';

  const stockPileEl = document.getElementById('stock-pile');
  const wastePileEl = document.getElementById('waste-pile');

  window.game.updateWaste = function() {
    wastePileEl.querySelectorAll('.card-wrapper').forEach(e => e.remove());
    if (window.game.waste) {
      wastePileEl.classList.remove('empty');
      
      const wrapper = window.game.createCardElement(window.game.waste, true);
      wastePileEl.appendChild(wrapper);
    } else {
      wastePileEl.classList.add('empty');
    }
  };

  window.game.moveWasteToTrash = async function() {
    if (!window.game.waste) return;
    const wCard = window.game.waste;
    
    const wasteWrapper = wastePileEl.querySelector('.card-wrapper');
    const rectW = wasteWrapper ? wasteWrapper.getBoundingClientRect() : wastePileEl.getBoundingClientRect();
    const trashRect = document.getElementById('trash-pile').getBoundingClientRect();

    wastePileEl.innerHTML = '<span class="pile-label">Käsi</span>';
    wastePileEl.classList.add('empty');
    window.game.waste = null;

    const tx = (Math.random() - 0.5) * 12;
    const ty = (Math.random() - 0.5) * 12;
    const r = (Math.random() - 0.5) * 45;
    
    await window.game.flyCard(rectW, trashRect, wCard, { targetX: tx, targetY: ty, targetRotation: r });
    window.game.addCardToTrashDOM(wCard, r, tx, ty);
  };

  window.game.drawCard = async function() {
    if (window.game.gameOver || window.game.isAnimating) return;

    if (window.game.stockIndex >= window.game.stock.length) {
      stockPileEl.classList.add('disabled');
      window.game.postMoveCheck();
      return;
    }

    window.game.isAnimating = true;
    window.game.clearAllHighlights();

    if (window.game.waste) {
      await window.game.moveWasteToTrash();
    }

    const card = window.game.stock[window.game.stockIndex++];
    
    const stockBackImg = stockPileEl.querySelector('.card-back');
    const sourceRect = (stockBackImg || stockPileEl).getBoundingClientRect();
    
    window.game.waste = card;
    window.game.updateWaste();
    
    const newWasteWrapper = wastePileEl.querySelector('.card-wrapper');
    if (newWasteWrapper) newWasteWrapper.style.opacity = '0';
    
    const targetRect = (newWasteWrapper || wastePileEl).getBoundingClientRect();

    await window.game.flyCard(sourceRect, targetRect, card, { flip: true, duration: 0.3 });

    if (newWasteWrapper) {
      newWasteWrapper.style.transition = 'none'; 
      newWasteWrapper.style.opacity = '1';
    }

    if (window.game.stockIndex >= window.game.stock.length) {
      stockPileEl.classList.add('disabled');
    }

    if (card.rank === 13) {
      if (newWasteWrapper) newWasteWrapper.classList.add('shake');
      await new Promise(r => setTimeout(r, 650));
      await window.game.moveWasteToTrash();
    }

    window.game.isAnimating = false;
    window.game.postMoveCheck();
  };

  window.game.discardWaste = function() {
    if (window.game.gameOver || window.game.isAnimating || !window.game.waste) return;

    if (window.game.wasteSelected) {
      if (window.game.selectedIndex !== null &&
          window.game.waste &&
          window.game.pyramid[window.game.selectedIndex].rank + window.game.waste.rank === 13) {
        window.game.pairWasteWithPyramid(window.game.selectedIndex);
        return;
      }
      window.game.clearAllHighlights();
      return;
    }

    if (window.game.selectedIndex !== null) {
      const p = window.game.pyramid[window.game.selectedIndex];
      if (p && !p.removed && p.rank + window.game.waste.rank === 13) {
        window.game.pairWasteWithPyramid(window.game.selectedIndex);
      } else {
        window.game.clearAllHighlights();
      }
      return;
    }

    window.game.clearAllHighlights();

    const target = 13 - window.game.waste.rank;
    const exposed = window.game.getExposed();
    const matches = exposed.filter(i => window.game.pyramid[i].rank === target);

    if (window.game.settings.clickBoth) {
      window.game.wasteSelected = true;
      window.game.selectedIndex = null;
      const wWrapper = wastePileEl.querySelector('.card-wrapper');
      if (wWrapper) wWrapper.classList.add('selected');
      return;
    }

    if (matches.length === 1) {
      window.game.pairWasteWithPyramid(matches[0]);
    } else if (matches.length > 1) {
      window.game.wasteSelected = true;
      const wWrapper = wastePileEl.querySelector('.card-wrapper');
      if (wWrapper) wWrapper.classList.add('selected');
      matches.forEach(i => window.game.pyramid[i].el.classList.add('highlight'));
    }
  };
})();