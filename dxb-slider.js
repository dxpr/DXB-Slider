// dxb-slider.js

(function() {
  function createSliderStructure(rangeInput) {
    // Create container and wrapper
    const container = document.createElement('div');
    container.className = 'dxb-slider-container';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'dxb-slider-wrapper';
    
    const track = document.createElement('div');
    track.className = 'dxb-slider-track';
    
    // Add slider class
    rangeInput.classList.add('dxb-slider');
    
    // Restructure DOM
    rangeInput.parentNode.insertBefore(container, rangeInput);
    container.appendChild(wrapper);
    wrapper.appendChild(track);
    track.appendChild(rangeInput);
    
    return wrapper;
  }

  function initDXBSliders() {
    document.querySelectorAll('[data-dxb-slider]:not([data-dxb-initialized])').forEach(rangeInput => {
      const wrapper = createSliderStructure(rangeInput);
      
      // Create number input programmatically
      const numberInput = document.createElement('input');
      numberInput.type = 'number';
      numberInput.className = 'dxb-slider-value';
      numberInput.setAttribute('tabindex', '-1');
      numberInput.setAttribute('pattern', '[0-9]*');
      numberInput.setAttribute('step', rangeInput.step);

      const step = parseFloat(rangeInput.step);
      if (step && step % 1 !== 0) {
        numberInput.setAttribute('inputmode', 'decimal');
      } else {
        numberInput.setAttribute('inputmode', 'numeric');
      }

      wrapper.appendChild(numberInput);

      function updateValue() {
        const val = rangeInput.value;
        const min = rangeInput.min;
        const max = rangeInput.max;
        const percent = (val - min) / (max - min) * 100;
        rangeInput.style.setProperty('--value-percent', `${percent}%`);
        numberInput.value = val;
        numberInput.min = min;
        numberInput.max = max;
        rangeInput.setAttribute('aria-valuenow', val);
      }

      rangeInput.addEventListener('input', updateValue);
      numberInput.addEventListener('input', () => {
        rangeInput.value = numberInput.value;
        updateValue();
        rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
      });

      numberInput.addEventListener('change', () => {
        rangeInput.dispatchEvent(new Event('change', { bubbles: true }));
      });

      // Set initial ARIA attributes
      rangeInput.setAttribute('aria-valuemin', rangeInput.min);
      rangeInput.setAttribute('aria-valuemax', rangeInput.max);

      updateValue();

      // Mark as initialized
      rangeInput.setAttribute('data-dxb-initialized', 'true');
    });
  }

  initDXBSliders();

  // Throttle function
  let throttleTimer = null;
  const throttle = (callback, time) => {
    if (throttleTimer) return;
    throttleTimer = setTimeout(() => {
      callback();
      throttleTimer = null;
    }, time);
  };

  const observer = new MutationObserver(mutations => {
    let shouldInit = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node itself is a target slider input
            if (node.tagName === 'INPUT' && 
                node.type === 'range' && 
                node.hasAttribute('data-dxb-slider') &&
                !node.hasAttribute('data-dxb-initialized')) {
              shouldInit = true;
              break;
            }
            // Check if the added node contains a target slider input
            const targetInput = node.querySelector('input[type="range"][data-dxb-slider]:not([data-dxb-initialized])');
            if (targetInput) {
              shouldInit = true;
              break;
            }
          }
        }
        if (shouldInit) break;
      }
    }
    if (shouldInit) {
      throttle(() => {
        initDXBSliders();
      }, 250); // Throttle initialization to 250ms
    }
  });

  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: false, // Optimization: ignore attribute changes
    characterData: false // Optimization: ignore character data changes
  });
})();