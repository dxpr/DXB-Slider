// dxb-slider.js

(function() {
    function initDXBSliders() {
        document.querySelectorAll('[data-dxb-slider]').forEach(rangeInput => {
            const container = rangeInput.closest('.dxb-slider-wrapper');
            
            // Create number input programmatically
            const numberInput = document.createElement('input');
            numberInput.type = 'number';
            numberInput.className = 'dxb-slider-value';
            numberInput.setAttribute('aria-hidden', 'true');
            numberInput.setAttribute('tabindex', '-1');
            container.appendChild(numberInput);

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
            });

            // Set initial ARIA attributes
            rangeInput.setAttribute('aria-valuemin', rangeInput.min);
            rangeInput.setAttribute('aria-valuemax', rangeInput.max);

            updateValue();
        });
    }

    // Initialize sliders when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDXBSliders);
    } else {
        initDXBSliders();
    }
})();