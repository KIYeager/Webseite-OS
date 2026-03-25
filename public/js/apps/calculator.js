export function getCalculatorHTML() {
    return `
        <div class="calculator-app">
            <div class="calc-display" id="calc-display">0</div>
            <div class="calc-buttons">
                <button class="calc-btn btn-action" data-val="C">C</button>
                <button class="calc-btn btn-action" data-val="DEL">⌫</button>
                <button class="calc-btn btn-action" data-val="%">%</button>
                <button class="calc-btn btn-op" data-val="/">÷</button>

                <button class="calc-btn" data-val="7">7</button>
                <button class="calc-btn" data-val="8">8</button>
                <button class="calc-btn" data-val="9">9</button>
                <button class="calc-btn btn-op" data-val="*">×</button>

                <button class="calc-btn" data-val="4">4</button>
                <button class="calc-btn" data-val="5">5</button>
                <button class="calc-btn" data-val="6">6</button>
                <button class="calc-btn btn-op" data-val="-">−</button>

                <button class="calc-btn" data-val="1">1</button>
                <button class="calc-btn" data-val="2">2</button>
                <button class="calc-btn" data-val="3">3</button>
                <button class="calc-btn btn-op" data-val="+">+</button>

                <button class="calc-btn zero" data-val="0">0</button>
                <button class="calc-btn" data-val=".">.</button>
                <button class="calc-btn btn-equal" data-val="=">=</button>
            </div>
        </div>
    `;
}

export function initCalculator(windowEl) {
    const display = windowEl.querySelector('#calc-display');
    const buttons = windowEl.querySelectorAll('.calc-btn');

    let currentInput = '';
    let previousInput = '';
    let operator = null;

    function updateDisplay(val) {
        display.textContent = val || '0';
        // Auto scroll if too long
        display.scrollLeft = display.scrollWidth;
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-val');

            if (val === 'C') {
                currentInput = '';
                previousInput = '';
                operator = null;
                updateDisplay('0');
            } else if (val === 'DEL') {
                currentInput = currentInput.slice(0, -1);
                updateDisplay(currentInput);
            } else if (['+', '-', '*', '/'].includes(val)) {
                if (currentInput === '' && previousInput !== '') {
                    operator = val; // change operator
                    return;
                }
                if (currentInput === '') return;

                if (previousInput !== '') {
                    calculate();
                }
                operator = val;
                previousInput = currentInput;
                currentInput = '';
            } else if (val === '=') {
                if (operator && previousInput !== '' && currentInput !== '') {
                    calculate();
                    operator = null;
                }
            } else if (val === '%') {
                if (currentInput !== '') {
                    currentInput = (parseFloat(currentInput) / 100).toString();
                    updateDisplay(currentInput);
                }
            } else {
                // Numbers and decimal
                if (val === '.' && currentInput.includes('.')) return;
                currentInput += val;
                updateDisplay(currentInput);
            }
        });
    });

    function calculate() {
        let result;
        const prev = parseFloat(previousInput);
        const curr = parseFloat(currentInput);

        if (isNaN(prev) || isNaN(curr)) return;

        switch (operator) {
            case '+': result = prev + curr; break;
            case '-': result = prev - curr; break;
            case '*': result = prev * curr; break;
            case '/':
                result = curr === 0 ? 'Error' : prev / curr;
                break;
            default: return;
        }

        if(result === 'Error') {
            currentInput = '';
        } else {
            // Fix JS floating point issues slightly
            result = Math.round(result * 100000000) / 100000000;
            currentInput = result.toString();
        }
        previousInput = '';
        updateDisplay(currentInput || 'Error');
    }
}