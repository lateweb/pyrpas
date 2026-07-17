// js/dom-utils.js
(function() {
  'use strict';

  window.game.createCardElement = function(cardData, faceUp = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'card-wrapper ' + (faceUp ? 'face-up' : 'face-down');
    wrapper.dataset.rank = cardData.rank;

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-front';
    const imgFront = document.createElement('img');
    imgFront.src = cardData.front;
    imgFront.alt = ""; 
    front.appendChild(imgFront);

    const back = document.createElement('div');
    back.className = 'card-back';
    const imgBack = document.createElement('img');
    imgBack.src = cardData.back || 'https://deckofcardsapi.com/static/img/back.png';
    imgBack.alt = ""; 
    back.appendChild(imgBack);

    inner.appendChild(front);
    inner.appendChild(back);
    wrapper.appendChild(inner);

    return wrapper;
  };

  window.game.addCardToTrashDOM = function(cardData, rot, tx, ty) {
    const trashEl = document.getElementById('trash-pile');
    trashEl.classList.remove('empty');
    
    const wrapper = window.game.createCardElement(cardData, true);
    wrapper.style.position = 'absolute';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    wrapper.style.transition = 'none';
    wrapper.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
    
    trashEl.appendChild(wrapper);
  };

  window.game.flyCard = function(sourceRect, targetRect, cardData, options) {
    return new Promise(resolve => {
      const flyEl = window.game.createCardElement(cardData, !options.flip);
      flyEl.classList.add('fly-card');
      flyEl.style.position = 'fixed';
      flyEl.style.left = sourceRect.left + 'px';
      flyEl.style.top = sourceRect.top + 'px';
      flyEl.style.width = sourceRect.width + 'px';
      flyEl.style.height = sourceRect.height + 'px';
      flyEl.style.zIndex = '9999';
      flyEl.style.pointerEvents = 'none';
      
      flyEl.style.transition = `all ${options.duration || 0.35}s cubic-bezier(0.25, 1, 0.5, 1)`;

      document.body.appendChild(flyEl);

      void flyEl.offsetWidth;

      const dx = targetRect.left - sourceRect.left + (options.targetX || 0);
      const dy = targetRect.top - sourceRect.top + (options.targetY || 0);
      const rot = options.targetRotation || 0;

      flyEl.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      flyEl.style.width = targetRect.width + 'px';
      flyEl.style.height = targetRect.height + 'px';

      if (options.flip) {
        flyEl.classList.remove('face-down');
        flyEl.classList.add('face-up');
      }

      setTimeout(() => {
        flyEl.remove();
        resolve();
      }, (options.duration || 0.35) * 1000);
    });
  };

  window.game.gatherCards = async function() {
    const cardsToGather = [];
    const stockPileEl = document.getElementById('stock-pile');
    const stockRect = stockPileEl.getBoundingClientRect();

    // Haetaan kaikki pöydällä olevat aktiiviset kortit uutta peliä aloitettaessa
    document.querySelectorAll('#pyramid .card-wrapper:not(.removed)').forEach(el => cardsToGather.push(el));
    document.querySelectorAll('#waste-pile .card-wrapper').forEach(el => cardsToGather.push(el));
    document.querySelectorAll('#trash-pile .card-wrapper').forEach(el => cardsToGather.push(el));

    if (cardsToGather.length === 0) return Promise.resolve();

    window.game.isAnimating = true;

    const flyPromises = cardsToGather.map((el, i) => {
      return new Promise(resolve => {
        const rect = el.getBoundingClientRect();
        const clone = el.cloneNode(true);
        
        clone.style.position = 'fixed';
        clone.style.left = rect.left + 'px';
        clone.style.top = rect.top + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.margin = '0';
        clone.style.zIndex = (9000 + i).toString();
        clone.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s';
        clone.style.pointerEvents = 'none';
        document.body.appendChild(clone);
        
        el.style.opacity = '0';
        
        void clone.offsetWidth;

        const targetX = stockRect.left + (stockRect.width - rect.width) / 2;
        const targetY = stockRect.top + (stockRect.height - rect.height) / 2;
        const dx = targetX - rect.left;
        const dy = targetY - rect.top;

        setTimeout(() => {
           // Lennätetään kaikki keskelle nostopakkaa ja käännetään ympäri
           clone.style.transform = `translate(${dx}px, ${dy}px) rotate(0deg)`;
           
           if (clone.classList.contains('face-up')) {
             clone.classList.remove('face-up');
             clone.classList.add('face-down');
           }

           setTimeout(() => {
             clone.style.opacity = '0';
             setTimeout(() => {
               clone.remove();
               resolve();
             }, 300);
           }, 250);
        }, i * 15); // Pieni porrastus korttien keruussa
      });
    });

    await Promise.all(flyPromises);
    window.game.isAnimating = false;
  };
})();