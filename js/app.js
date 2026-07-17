// js/app.js
(function() {
  'use strict';

  const pyramidEl = document.getElementById('pyramid');
  const stockPileEl = document.getElementById('stock-pile');
  const wastePileEl = document.getElementById('waste-pile');
  const newGameBtn = document.getElementById('new-game-btn');
  
  const settingsBtn = document.getElementById('settings-btn');
  const settingsOverlay = document.getElementById('settings-overlay');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const toggleClickBothCheckbox = document.getElementById('toggle-click-both');

  settingsBtn.addEventListener('click', () => settingsOverlay.classList.remove('hidden'));
  closeSettingsBtn.addEventListener('click', () => settingsOverlay.classList.add('hidden'));

  const savedClickBoth = localStorage.getItem('pyramid_click_both');
  if (savedClickBoth !== null) {
    window.game.settings.clickBoth = savedClickBoth === 'true';
    toggleClickBothCheckbox.checked = window.game.settings.clickBoth;
  }

  toggleClickBothCheckbox.addEventListener('change', (e) => {
    window.game.settings.clickBoth = e.target.checked;
    localStorage.setItem('pyramid_click_both', e.target.checked);
  });
  
  let overlayEl = document.getElementById('overlay-msg');
  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.id = 'overlay-msg';
    document.body.appendChild(overlayEl);
  }

  window.game.endGame = function(isWin) {
    if (window.game.gameOver) return;
    window.game.gameOver = true;
    window.game.win = isWin;
    showOverlay(isWin ? 'Voitit!' : 'Peli päättyi', isWin ? 'win' : 'lose');
    stockPileEl.classList.add('disabled');
  };

  function showOverlay(text, type) {
    overlayEl.textContent = text;
    overlayEl.className = 'show ' + type;
    setTimeout(() => overlayEl.classList.remove('show'), 2500);
  }

  function preloadCards(cards) {
    const backImg = new Image();
    backImg.src = 'https://deckofcardsapi.com/static/img/back.png';

    cards.forEach(card => {
      const img = new Image();
      img.src = card.front;
    });
  }

  window.game.newGame = async function() {
    if (window.game.isAnimating) return; // Estetään uuden pelin roskapainallukset animaation aikana
    
    // Estetään kosketus ja interaktiot siksi aikaa, kun kortit kerätään
    window.game.gameOver = true;

    // Kerätään olemassa olevat kortit takaisin pakkaan
    await window.game.gatherCards();

    overlayEl.classList.remove('show', 'win', 'lose');
    window.game.gameOver = false;
    window.game.win = false;
    window.game.waste = null;
    window.game.stockIndex = 0;
    window.game.selectedIndex = null;
    window.game.possibleMatchIndices = [];
    stockPileEl.classList.remove('disabled');

    const trashEl = document.getElementById('trash-pile');
    trashEl.innerHTML = '<span class="pile-label">Roskat</span>';
    trashEl.classList.add('empty');
    window.game.updateWaste();

    const full = window.game.shuffle(window.game.generateDeck());
    const pyramidData = full.slice(0, 15);
    window.game.stock = full.slice(15, 52);

    preloadCards(full);

    window.game.pyramid = pyramidData.map(c => {
      const el = window.game.createCardElement(c, false);
      return {
        rank: c.rank,
        suit: c.suit,
        code: c.code,
        front: c.front,
        back: c.back,
        el,
        removed: false
      };
    });

    window.game.renderPyramid(true);
    window.game.clearAllHighlights();
    window.game.checkFreeMoves();
  };

  stockPileEl.addEventListener('click', window.game.drawCard);
  wastePileEl.addEventListener('click', window.game.discardWaste);

  pyramidEl.addEventListener('click', (e) => {
    const wrapper = e.target.closest('.card-wrapper');
    if (!wrapper) return;
    const idx = parseInt(wrapper.dataset.index, 10);
    if (isNaN(idx)) return;
    window.game.selectPyramidCard(idx);
  });

  newGameBtn.addEventListener('click', window.game.newGame);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      window.game.drawCard();
    }
  });

  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => window.game.positionPyramid(false), 50);
  });

  window.game.newGame();
})();