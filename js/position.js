// js/position.js
(function() {
  'use strict';

  const pyramidEl = document.getElementById('pyramid');

  window.game.positionPyramid = function(isInitialDeal = false) {
    const pyramid = window.game.pyramid;
    if (!pyramid || pyramid.length === 0) return;
    const containerW = pyramidEl.clientWidth || 350;

    let W = Math.floor(containerW / 5.2);
    const maxW = 90; 
    if (W > maxW) W = maxW;

    const H = Math.floor(W * 1.423);
    const VERT_OVERLAP = Math.floor(H / 2);

    pyramidEl.style.height = (4 * VERT_OVERLAP + H) + 'px';

    let positions = [];
    for (let row = 0; row <= 4; row++) {
      const count = row + 1;
      const rowW = count * W;
      const rowStartX = (containerW - rowW) / 2;

      for (let col = 0; col < count; col++) {
        positions.push({
          x: rowStartX + col * W,
          y: row * VERT_OVERLAP
        });
      }
    }

    if (isInitialDeal) {
      window.game.isAnimating = true;

      const stockPileEl = document.getElementById('stock-pile');
      const stockBack = stockPileEl.querySelector('.card-back');
      const stockRect = (stockBack || stockPileEl).getBoundingClientRect();
      const pyrRect = pyramidEl.getBoundingClientRect();
      
      const startX = stockRect.left - pyrRect.left + (stockRect.width - W) / 2;
      const startY = stockRect.top - pyrRect.top + (stockRect.height - H) / 2;

      pyramid.forEach((p, i) => {
        const wrapper = p.el;
        wrapper.style.transition = 'none'; 
        wrapper.style.left = startX + 'px';
        wrapper.style.top = startY + 'px';
        wrapper.style.width = W + 'px';
        wrapper.style.height = H + 'px';
        wrapper.dataset.index = i;
        
        wrapper.classList.remove('exposed', 'face-up');
        wrapper.classList.add('covered', 'face-down');
      });

      void pyramidEl.offsetWidth;

      let delay = 0;
      pyramid.forEach((p, i) => {
        setTimeout(() => {
          const wrapper = p.el;
          wrapper.style.transition = ''; 
          wrapper.style.left = positions[i].x + 'px';
          wrapper.style.top = positions[i].y + 'px';
        }, delay);
        delay += 60; 
      });

      setTimeout(() => {
        window.game.updateExposureAndFlip();
        window.game.isAnimating = false;
      }, delay + 350);

    } else {
      pyramid.forEach((p, i) => {
        const wrapper = p.el;
        wrapper.style.transition = ''; 
        wrapper.style.left = positions[i].x + 'px';
        wrapper.style.top = positions[i].y + 'px';
        wrapper.style.width = W + 'px';
        wrapper.style.height = H + 'px';
        wrapper.dataset.index = i;
      });
      window.game.updateExposureAndFlip();
    }
  };

  window.game.updateExposureAndFlip = function() {
    const pyramid = window.game.pyramid;
    for (let i = 0; i < 15; i++) {
      const p = pyramid[i];
      const w = p.el;
      if (p.removed) {
        w.classList.add('removed');
        w.classList.remove('exposed', 'covered'); 
        continue;
      }
      w.classList.remove('removed');
      if (window.game.isExposed(i)) {
        w.classList.add('exposed');
        w.classList.remove('covered');
        if (!w.classList.contains('face-up')) {
          w.classList.remove('face-down');
          w.classList.add('face-up');
          void w.offsetWidth;
        }
      } else {
        w.classList.add('covered');
        w.classList.remove('exposed');
        if (!w.classList.contains('face-down')) {
          w.classList.remove('face-up');
          w.classList.add('face-down');
        }
      }
    }
  };

  window.game.renderPyramid = function(isInitialDeal = false) {
    pyramidEl.innerHTML = '';
    const pyramid = window.game.pyramid;
    for (let i = 0; i < 15; i++) {
      pyramidEl.appendChild(pyramid[i].el);
    }
    window.game.positionPyramid(isInitialDeal);
  };
})();