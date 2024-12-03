// tests/dxb-slider.test.js
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('DXB Slider Core Tests', () => {
  let document;
  let window;
  let slider;
  let numberInput;

  beforeEach(() => {
    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../dxb-slider.js'), 'utf8');

    const dom = new JSDOM(`
         <html>
           <body>
             <label for="mySlider">Slider Label</label>
             <input type="range" id="mySlider" class="dxb-slider" 
                    min="0" max="100" value="50" step="1" name="mySlider"
                    data-dxb-slider>
             <script>${scriptContent}</script>
           </body>
         </html>
       `, { runScripts: "dangerously", resources: "usable" });

    document = dom.window.document;
    window = dom.window;
    global.document = document;
    global.window = window;

    slider = document.querySelector('#mySlider');
    numberInput = document.querySelector('.dxb-slider-value');

  });

  it('should initialize sliders with data-dxb-slider attribute', () => {
    expect(slider.hasAttribute('data-dxb-initialized')).toBe(true);
  });

  it('should create number input programmatically', () => {
    expect(numberInput).not.toBeNull();
    expect(numberInput.type).toBe('number');
  });

  it('should synchronize range and number input values', () => {
    slider.value = 75;
    slider.dispatchEvent(new window.Event('input'));
    expect(numberInput.value).toBe('75');
  });

  it('should initialize dynamically added sliders', async () => {
    const newSlider = document.createElement('input');
    newSlider.type = 'range';
    newSlider.setAttribute('data-dxb-slider', '');

    // Append the new slider to the DOM
    document.body.appendChild(newSlider);

    // Wait for the MutationObserver to trigger
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(newSlider.hasAttribute('data-dxb-initialized')).toBe(true);
  });

  // it('should dispatch change event on number input change', () => {
  //   const changeHandler = vi.fn();

  //   slider.addEventListener('change', changeHandler);
  //   numberInput.value = 80;
  //   numberInput.dispatchEvent(new window.Event('change'));

  //   expect(changeHandler).toHaveBeenCalled();
  // });

  it('should synchronize values on number input change', () => {
    numberInput.value = 80;
    numberInput.dispatchEvent(new window.Event('input'));

    expect(slider.value).toBe('80');
  });

  it('should set initial ARIA attributes', () => {
    expect(slider.getAttribute('aria-valuemin')).toBe('0');
    expect(slider.getAttribute('aria-valuemax')).toBe('100');
    expect(slider.getAttribute('aria-valuenow')).toBe('50');
  });

  it('should update aria-valuenow on input', () => {
    slider.value = 75;
    slider.dispatchEvent(new window.Event('input'));
    expect(slider.getAttribute('aria-valuenow')).toBe('75');
  });
});

describe('DXB Slider Step Tests', () => {
  let document;
  let window;
  let slider;
  let numberInput;

  beforeEach(() => {
    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../dxb-slider.js'), 'utf8');

    const dom = new JSDOM(`
          <html>
            <body>
              <label for="mySlider">Slider Label</label>
              <input type="range" id="mySlider" class="dxb-slider" 
                      min="0" max="100" value="5" step="5" name="mySlider"
                      data-dxb-slider>
              <script>${scriptContent}</script>
            </body>
          </html>
        `, { runScripts: "dangerously", resources: "usable" });

    document = dom.window.document;
    window = dom.window;
    global.document = document;
    global.window = window;

    slider = document.querySelector('#mySlider');
    numberInput = document.querySelector('.dxb-slider-value');

  });

  it('should have the same step value to both the slider and the number input', () => {
    expect(slider.step).toBe("5");
    expect(numberInput.step).toBe("5");
  });

  it('should update the number input when slider value changes', () => {
    slider.value = 10;
    slider.dispatchEvent(new window.Event('input'));
    expect(numberInput.value).toBe("10");
  });

  it('should update the slider when number input value changes', () => {
    numberInput.value = 15;
    numberInput.dispatchEvent(new window.Event('input'));
    expect(slider.value).toBe("15");
  });

  it('should keep slider in sync with number input on step increment', () => {
    numberInput.value = 15;
    numberInput.stepUp();
    numberInput.dispatchEvent(new window.Event('input'));
    expect(numberInput.value).toBe("20");
    expect(slider.value).toBe("20");
  });

  it('should keep slider in sync with number input on step decrement', () => {
    numberInput.value = 20;
    numberInput.stepDown();
    numberInput.dispatchEvent(new window.Event('input'));
    expect(numberInput.value).toBe("15");
    expect(slider.value).toBe("15");
  });
});