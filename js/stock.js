// js/stock.js
(function() {
  'use strict';

  const stockPileEl = document.getElementById('stock-pile');
  const wastePileEl = document.getElementById('waste-pile');
  const deckStack = stockPileEl.querySelector('.deck-stack');

  // ---------------------------------------------------------------
  //  Deck visualisation
  // ---------------------------------------------------------------
  function renderDeck() {
    const remaining = window.game.stock.length - window.game.stockIndex;
    deckStack.innerHTML = '';
    if (remaining === 0) return;

    const maxVisibleOffset = 5;      
    const offsetStep = 2;            

    // Käännettiin silmukan järjestys, jotta pakan päällimmäinen kortti 
    // lisätään DOM:iin viimeisenä, se saa suurimman z-indeksin, eikä 
    // omista siirtymää (offsetia). Alimmat kortit siirretään hieman alas ja oikealle.
    for (let i = remaining - 1; i >= 0; i--) {
      const offset = Math.min(i, maxVisibleOffset) * offsetStep;
      
      const dummy = { rank: 0, suit: '', code: 'deck', front: '', back: BACK_IMG };
      const wrapper = window.game.createCardElement(dummy, false);
      wrapper.classList.add('deck-card');
      wrapper.style.position = 'absolute';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.zIndex = remaining - i;
      wrapper.style.transform = `translate(${offset}px, ${offset}px)`;
      wrapper.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s';
      deckStack.appendChild(wrapper);
    }

    // Merkitään pakan ylin kortti, joka on nyt DOM:n viimeinen lapsielementti.
    const topCard = deckStack.lastElementChild;
    if (topCard) topCard.classList.add('deck-top');
  }

  window.game.initDeckUI = function() {
    renderDeck();
  };

  // ---------------------------------------------------------------
  //  Waste management
  // ---------------------------------------------------------------
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

    wastePileEl.innerHTML = '';
    wastePileEl.classList.add('empty');
    window.game.waste = null;

    const tx = (Math.random() - 0.5) * 12;
    const ty = (Math.random() - 0.5) * 12;
    const r = (Math.random() - 0.5) * 45;

    await window.game.flyCard(rectW, trashRect, wCard, { targetX: tx, targetY: ty, targetRotation: r });
    window.game.addCardToTrashDOM(wCard, r, tx, ty);
  };

  // ---------------------------------------------------------------
  //  Draw card (with animated deck stack)
  // ---------------------------------------------------------------
  window.game.drawCard = async function() {
    if (window.game.gameOver || window.game.isAnimating) return;

    if (window.game.stockIndex >= window.game.stock.length) {
      stockPileEl.classList.add('disabled');
      window.game.postMoveCheck();
      return;
    }

    window.game.isAnimating = true;
    window.game.clearAllHighlights();

    const topCard = deckStack.querySelector('.deck-top');
    if (topCard) {
      topCard.classList.add('deck-card-removing');
      await new Promise(resolve => {
        const onEnd = () => {
          topCard.removeEventListener('transitionend', onEnd);
          resolve();
        };
        topCard.addEventListener('transitionend', onEnd);
        setTimeout(resolve, 300);
      });
    }

    if (window.game.waste) {
      await window.game.moveWasteToTrash();
    }

    const card = window.game.stock[window.game.stockIndex++];
    window.game.waste = card;
    window.game.updateWaste();

    const wasteWrapper = wastePileEl.querySelector('.card-wrapper');
    if (wasteWrapper) wasteWrapper.style.opacity = '0';

    const sourceRect = stockPileEl.getBoundingClientRect();
    const targetRect = (wasteWrapper || wastePileEl).getBoundingClientRect();
    await window.game.flyCard(sourceRect, targetRect, card, { flip: true, duration: 0.3 });

    if (wasteWrapper) {
      wasteWrapper.style.transition = 'none';
      wasteWrapper.style.opacity = '1';
    }

    renderDeck();

    if (window.game.stockIndex >= window.game.stock.length) {
      stockPileEl.classList.add('disabled');
    }

    window.game.isAnimating = false;
    window.game.postMoveCheck();
  };

  // ---------------------------------------------------------------
  //  Discard waste (manual)
  // ---------------------------------------------------------------
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
