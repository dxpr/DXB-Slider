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

    function updateFieldValue(field, value) {
        // Handle empty value for number inputs
        if (field.type === "number") {

            // Keep empty for cleared input
            field.value = value === "" ? "" : Number(value);
        } else if (field.type === "range") {

            // Default to 0 for range inputs if value is empty or NaN
            const valueAsNumber = Number(value) || 0;
            field.value = valueAsNumber;

            // Calculate percentage for range inputs
            const percent = ((field.value - field.min) / (field.max - field.min)) * 100;
            field.style.setProperty('--value-percent', `${percent}%`);
            field.setAttribute('aria-valuenow', field.value);
        }
    }


    const sliderStateProxy = new Proxy({}, {
        set(target, key, value) {
            target[key] = value;
            const fields = document.querySelectorAll(`[name="${key}"]`);
            fields.forEach(field => updateFieldValue(field, value));
            return true;
        }
    });

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


    function handleInputChange(e) {
        if (!e.target.closest('.dxb-slider-container')) return;
        sliderStateProxy[e.target.name] = e.target.value;
    }

    [rangeInput, numberInput].forEach(input =>
        input.addEventListener('input', handleInputChange)
    );

    // Initialize proxy state with the current value of the range input in first initiation
    sliderStateProxy[rangeInput.name] = rangeInput.value;

    // Set initial ARIA attributes
    rangeInput.setAttribute('aria-valuemin', rangeInput.min);
    rangeInput.setAttribute('aria-valuemax', rangeInput.max);

    // Populate inputs in first initiation
    const val = rangeInput.value;
    const min = rangeInput.min;
    const max = rangeInput.max;
    const percent = (val - min) / (max - min) * 100;
    rangeInput.style.setProperty('--value-percent', `${percent}%`);
    numberInput.value = val;
    numberInput.min = min;
    numberInput.max = max;
    numberInput.name = rangeInput.name;
    rangeInput.setAttribute('aria-valuenow', val);

      // Mark as initialized
      rangeInput.setAttribute('data-dxb-initialized', 'true');
    });
  }

  initDXBSliders();

  const observer = new MutationObserver(mutations => {
    let shouldInit = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE && 
              (node.matches('[data-dxb-slider]') || node.querySelector('[data-dxb-slider]'))) {
            shouldInit = true;
            break;
          }
        }
        if (shouldInit) break;
      }
    }
    if (shouldInit) {
      initDXBSliders();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();