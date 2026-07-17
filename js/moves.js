// js/moves.js
(function() {
  'use strict';

  window.game.hasAvailableMoves = function() {
    // Jos pakassa on nostamattomia kortteja, peli ei ole vielä menetetty
    if (window.game.stockIndex < window.game.stock.length) return true;

    const exposed = window.game.getExposed();

    // Tarkistetaan löytyykö avoimista kortista YKSITTÄISTÄ kuningasta (13)
    for (let i of exposed) {
      if (window.game.pyramid[i].rank === 13) return true;
    }

    // Tarkistetaan voiko kaksi avointa pyramidikorttia muodostaa parin
    for (let a = 0; a < exposed.length; a++) {
      for (let b = a + 1; b < exposed.length; b++) {
        if (window.game.pyramid[exposed[a]].rank + window.game.pyramid[exposed[b]].rank === 13) {
          return true;
        }
      }
    }

    // Tarkistetaan voiko kädessä oleva kortti pariutua pyramidin kanssa
    if (window.game.waste) {
       for (let i of exposed) {
         if (window.game.waste.rank + window.game.pyramid[i].rank === 13) return true;
       }
    }

    // Yhtäkään sääntöjenmukaista siirtoa ei ole enää mahdollista tehdä
    return false;
  };

  window.game.clearAllHighlights = function() {
    for (let i = 0; i < 15; i++) {
      window.game.pyramid[i].el.classList.remove('highlight', 'selected');
    }
    
    const wWrapper = document.querySelector('#waste-pile .card-wrapper');
    if (wWrapper) wWrapper.classList.remove('selected', 'highlight');
    
    window.game.wasteSelected = false;
  };

  window.game.highlightSelection = function(selectedIdx, matchIndices) {
    window.game.clearAllHighlights();
    window.game.pyramid[selectedIdx].el.classList.add('selected');
    matchIndices.forEach(i => window.game.pyramid[i].el.classList.add('highlight'));
  };

  window.game.postMoveCheck = function() {
    if (window.game.countPyramid() === 0) {
      window.game.endGame(true);
    } else {
      setTimeout(() => window.game.checkFreeMoves(), 100);
    }
  };

  window.game.removePair = async function(i, j) {
    if (window.game.gameOver || window.game.isAnimating) return false;
    const p1 = window.game.pyramid[i];
    const p2 = window.game.pyramid[j];
    
    if (p1.removed || p2.removed || !window.game.isExposed(i) || !window.game.isExposed(j) || i === j) return false;
    if (p1.rank + p2.rank !== 13) return false;

    window.game.isAnimating = true;
    window.game.clearAllHighlights();

    const rect1 = p1.el.getBoundingClientRect();
    const rect2 = p2.el.getBoundingClientRect();
    const trashRect = document.getElementById('trash-pile').getBoundingClientRect();

    p1.removed = true;
    p2.removed = true;
    window.game.updateExposureAndFlip();

    const tx1 = (Math.random() - 0.5) * 12;
    const ty1 = (Math.random() - 0.5) * 12;
    const r1 = (Math.random() - 0.5) * 45;
    
    const tx2 = (Math.random() - 0.5) * 12;
    const ty2 = (Math.random() - 0.5) * 12;
    const r2 = (Math.random() - 0.5) * 45;

    await Promise.all([
      window.game.flyCard(rect1, trashRect, p1, { targetX: tx1, targetY: ty1, targetRotation: r1 }),
      window.game.flyCard(rect2, trashRect, p2, { targetX: tx2, targetY: ty2, targetRotation: r2 })
    ]);

    window.game.addCardToTrashDOM(p1, r1, tx1, ty1);
    window.game.addCardToTrashDOM(p2, r2, tx2, ty2);

    window.game.isAnimating = false;
    window.game.postMoveCheck();
    return true;
  };

  window.game.removeKing = async function(idx) {
    if (window.game.gameOver || window.game.isAnimating) return false;
    const p = window.game.pyramid[idx];
    
    if (p.removed || !window.game.isExposed(idx) || p.rank !== 13) return false;

    window.game.isAnimating = true;
    window.game.clearAllHighlights();

    const rect = p.el.getBoundingClientRect();
    const trashRect = document.getElementById('trash-pile').getBoundingClientRect();

    p.removed = true;
    window.game.updateExposureAndFlip();

    const tx = (Math.random() - 0.5) * 12;
    const ty = (Math.random() - 0.5) * 12;
    const r = (Math.random() - 0.5) * 45;

    await window.game.flyCard(rect, trashRect, p, { targetX: tx, targetY: ty, targetRotation: r });
    window.game.addCardToTrashDOM(p, r, tx, ty);

    window.game.isAnimating = false;
    window.game.postMoveCheck();
    return true;
  };

  window.game.pairWasteWithPyramid = async function(idx) {
    if (window.game.gameOver || window.game.isAnimating || !window.game.waste) return;
    const p = window.game.pyramid[idx];
    
    if (p.removed || !window.game.isExposed(idx) || p.rank + window.game.waste.rank !== 13) return;

    window.game.isAnimating = true;
    window.game.clearAllHighlights();

    const wCard = window.game.waste;
    const rectP = p.el.getBoundingClientRect();
    
    const wasteEl = document.getElementById('waste-pile');
    const wasteWrapper = wasteEl.querySelector('.card-wrapper');
    const rectW = wasteWrapper ? wasteWrapper.getBoundingClientRect() : wasteEl.getBoundingClientRect();
    const trashRect = document.getElementById('trash-pile').getBoundingClientRect();

    p.removed = true;
    window.game.updateExposureAndFlip();

    wasteEl.innerHTML = '<span class="pile-label">Käsi</span>';
    wasteEl.classList.add('empty');
    window.game.waste = null;

    const tx1 = (Math.random() - 0.5) * 12;
    const ty1 = (Math.random() - 0.5) * 12;
    const r1 = (Math.random() - 0.5) * 45;
    
    const tx2 = (Math.random() - 0.5) * 12;
    const ty2 = (Math.random() - 0.5) * 12;
    const r2 = (Math.random() - 0.5) * 45;

    await Promise.all([
      window.game.flyCard(rectP, trashRect, p, { targetX: tx1, targetY: ty1, targetRotation: r1 }),
      window.game.flyCard(rectW, trashRect, wCard, { targetX: tx2, targetY: ty2, targetRotation: r2 })
    ]);

    window.game.addCardToTrashDOM(p, r1, tx1, ty1);
    window.game.addCardToTrashDOM(wCard, r2, tx2, ty2);

    window.game.isAnimating = false;
    window.game.postMoveCheck();
  };

  window.game.checkFreeMoves = function() {
    if (window.game.countPyramid() > 0 && !window.game.hasAvailableMoves()) {
      window.game.endGame(false);
    }
  };
})();