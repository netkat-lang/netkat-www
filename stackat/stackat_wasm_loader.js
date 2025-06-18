// This file loads the WebAssembly module and exposes it to the browser
import init, { check_equivalence, parse_expression } from './stackat_wasm.js';

// Initialize the WebAssembly module
async function initWasm() {
    console.log('Starting WebAssembly initialization...');
    try {
        console.time('WebAssembly initialization');
        await init('./stackat_wasm_bg.wasm');
        console.timeEnd('WebAssembly initialization');

        // Expose the check_equivalence function to the browser
        window.stackat = {
            checkEquivalence: (expr1, expr2, inputPacket, outputPacket) => {
                try {
                    return check_equivalence(expr1, expr2, inputPacket, outputPacket);
                } catch (error) {
                    console.error('Error in check_equivalence:', error);
                    throw error;
                }
            },

            // Add a function to parse expressions for real-time syntax checking
            parseExpression: (expr, exprNum) => {
                try {
                    return parse_expression(expr, exprNum);
                } catch (error) {
                    console.error(`Error parsing expression ${exprNum}:`, error);
                    throw error;
                }
            }
        };

        console.log('StacKAT WebAssembly module loaded successfully');

        // Dispatch an event to notify JavaScript that the WASM module is loaded
        const event = new CustomEvent('stackat-wasm-loaded');
        document.dispatchEvent(event);
        console.log('stackat-wasm-loaded event dispatched');
    } catch (error) {
        console.error('Failed to load StacKAT WebAssembly module:', error);
    }
}

// Start loading the WebAssembly module
console.log('WebAssembly loader script executed');
initWasm();
