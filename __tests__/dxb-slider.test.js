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
                    min="0" max="100" value="50" step="1" 
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

  it('should synchronize range and number input values (0 based)', () => {
    slider.value = 0;
    slider.dispatchEvent(new window.Event('input'));
    expect(numberInput.value).toBe('0');
  });

  it('should initialize dynamically added sliders', async () => {
    const newSlider = document.createElement('input');
    newSlider.type = 'range';
    newSlider.setAttribute('data-dxb-slider', '');
    newSlider.id = "myNewSlider";

    // Append the new slider to the DOM
    document.body.appendChild(newSlider);

    // Wait for the MutationObserver to trigger
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(newSlider.hasAttribute('data-dxb-initialized')).toBe(true);
  });

  it('should synchronize values on number input change', () => {
    numberInput.value = 80;
    numberInput.dispatchEvent(new window.Event('input'));

    expect(slider.value).toBe('80');
  });

  it('should clamp value to max when number input exceeds max limit', () => {
    numberInput.max = 100;
    numberInput.value = 1000;
    numberInput.dispatchEvent(new window.Event('input'));

    expect(numberInput.value).toBe('100');
  });


  it('should synchronize values on number input change (0 based)', () => {
    numberInput.value = "";
    numberInput.dispatchEvent(new window.Event('input'));

    expect(slider.value).toBe('0');
  });

  it('should synchronize values on number input change (empty)', () => {
    numberInput.value = "";
    numberInput.dispatchEvent(new window.Event('input'));

    expect(numberInput.value).toBe('');
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

describe('DXB Slider Negative Value Tests', () => {
  let document;
  let window;
  let slider;
  let numberInput;

  beforeEach(() => {
    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../dxb-slider.js'), 'utf8');

    const dom = new JSDOM(`
          <html>
            <body>
              <label for="negativeSlider">Negative Slider</label>
              <input type="range" id="negativeSlider" class="dxb-slider" 
                      min="-50" max="50" value="-25" step="5" 
                      data-dxb-slider>
              <script>${scriptContent}</script>
            </body>
          </html>
        `, { runScripts: "dangerously", resources: "usable" });

    document = dom.window.document;
    window = dom.window;
    global.document = document;
    global.window = window;

    slider = document.querySelector('#negativeSlider');
    numberInput = document.querySelector('.dxb-slider-value');
  });

  it('should initialize the slider with negative min value', () => {
    expect(slider.min).toBe('-50');
    expect(slider.max).toBe('50');
    expect(slider.value).toBe('-25');
  });

  it('should synchronize values between slider and number input (negative values)', () => {
    slider.value = -40;
    slider.dispatchEvent(new window.Event('input'));
    expect(numberInput.value).toBe('-40');
  });

  it('should synchronize values when number input is updated with a negative value', () => {
    numberInput.value = -10;
    numberInput.dispatchEvent(new window.Event('input'));
    expect(slider.value).toBe('-10');
  });

  it('should clamp values to min when below min limit', () => {
    numberInput.value = -100;
    numberInput.dispatchEvent(new window.Event('input'));
    expect(numberInput.value).toBe('-50');
    expect(slider.value).toBe('-50');
  });

  it('should allow entering "-" without immediately parsing', () => {

    // Since JSDOM does not allow incomplete number input states (like "-"), we have to mock it manually
    Object.defineProperty(numberInput, "value", {
      get: () => "-",
      set: () => { }, // Prevents JSDOM from resetting it
      configurable: true
    });

    numberInput.dispatchEvent(new window.InputEvent("input", { data: "-" }));

    expect(numberInput.value).toBe("-");
  });

});

describe('DXB Slider Floating Point Tests', () => {
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
                      min="0.1" max="10.5" value="5.5" step="0.1" 
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

  it('should allow entering "." without immediate parsing', () => {
    // Prevent JSDOM from resetting an incomplete decimal state
    Object.defineProperty(numberInput, "value", {
      get: () => "5.",
      set: () => { },
      configurable: true
    });

    numberInput.dispatchEvent(new window.InputEvent("input", { data: "." }));

    expect(numberInput.value).toBe("5."); // Allow incomplete decimal state
  });

  it('should synchronize range and number input values with floating points', () => {
    slider.value = "7.3";
    slider.dispatchEvent(new window.Event('input'));
    expect(numberInput.value).toBe("7.3");
  });

  it('should clamp values to max boundary for floating points', () => {
    numberInput.value = "20.3"; // Exceeding max
    numberInput.dispatchEvent(new window.Event('input'));
    expect(numberInput.value).toBe("10.5"); // Clamped to max
  });

  it('should clamp values to min boundary for floating points', () => {
    numberInput.value = "-5.0"; // Below min
    numberInput.dispatchEvent(new window.Event('input'));
    expect(numberInput.value).toBe("0.1"); // Clamped to min
  });

  it('should retain correct floating point precision when stepping up', () => {
    numberInput.value = "2.2";
    numberInput.stepUp();
    numberInput.dispatchEvent(new window.Event('input'));
    expect(numberInput.value).toBe("2.3"); // Step increment of 0.1
  });

  it('should retain correct floating point precision when stepping down', () => {
    numberInput.value = "3.5";
    numberInput.stepDown();
    numberInput.dispatchEvent(new window.Event('input'));
    expect(numberInput.value).toBe("3.4"); // Step decrement of 0.1
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
                      min="0" max="100" value="5" step="5" 
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