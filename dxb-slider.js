// dxb-slider.js

(function () {
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

  function getDefaultValue(num) {

    // Convert the input to a number
    const convertedNum = Number(num);

    // Check if the converted number is not finite (e.g., NaN, Infinity)
    if (!isFinite(convertedNum)) {
      return 0;
    }

    return Math.ceil(convertedNum / 2);
  }

  function getRangePercent(value = 0, min = 0, max = 0) {
    return ((value - min) / (max - min)) * 100;
  }

  function updateFieldValue(field, value) {

    if (['number', 'range'].includes(field.type)) {

      // Set value to default if empty, else convert to valid number
      field.value = value || getDefaultValue(field.max);

      // Apply additional settings for range inputs
      if (field.type === "range") {
        const percent = getRangePercent(field.value, field.min, field.max);
        field.style.setProperty('--value-percent', `${percent}%`);
        field.setAttribute('aria-valuenow', field.value);
      }
    }
  }

  // Proxy object to synchronize field values and update all matching fields when a value changes
  const sliderStateProxy = new Proxy({}, {
    set(target, key, value) {
      target[key] = value;
      const fields = document.querySelectorAll(`[data-dxb-proxy-key="${key}"]`);
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

        // Only update fields within the DXB slider container's scope
        if (!e.target.closest('.dxb-slider-container')) {
          return;
        }

        sliderStateProxy[e.target.dataset["dxbProxyKey"]] = e.target.value;
      }

      [rangeInput, numberInput].forEach(input =>
        input.addEventListener('input', handleInputChange)
      );

      // Initialize the proxy with the initial value of the range input
      sliderStateProxy[rangeInput.dataset["dxbProxyKey"]] = rangeInput.value;

      // Set initial ARIA attributes
      rangeInput.setAttribute('aria-valuemin', rangeInput.min);
      rangeInput.setAttribute('aria-valuemax', rangeInput.max);

      // Populate inputs in first initiation
      const value = rangeInput.value;
      const min = rangeInput.min;
      const max = rangeInput.max;

      const percent = getRangePercent(value, min, max);
      rangeInput.style.setProperty('--value-percent', `${percent}%`);

      numberInput.value = value;
      numberInput.min = min;
      numberInput.max = max;
      numberInput.name = rangeInput.name;

      numberInput.setAttribute("data-dxb-proxy-key", rangeInput.dataset["dxbProxyKey"]);

      rangeInput.setAttribute('aria-valuenow', value);

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
