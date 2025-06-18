// Advanced debounce function that only delays if a request is in flight
function createSmartDebounce() {
    let timeout = null;
    let isRequestInFlight = false;

    return function(func) {
        const context = this;
        const args = arguments;

        // If there's no request in flight, execute immediately
        if (!isRequestInFlight) {
            isRequestInFlight = true;

            // Execute the function immediately
            Promise.resolve(func.apply(context, args))
                .finally(() => {
                    isRequestInFlight = false;

                    // If there was a queued request during execution, run it after a short delay
                    if (timeout) {
                        const queuedFunc = timeout.func;
                        clearTimeout(timeout.id);
                        timeout = null;

                        // Small delay to prevent UI freezing if typing is very fast
                        setTimeout(() => queuedFunc(), 50);
                    }
                });
            return;
        }

        // If a request is already in flight, queue this one
        if (timeout) {
            clearTimeout(timeout.id);
        }

        // Store the function to be executed later
        timeout = {
            func: () => func.apply(context, args),
            id: setTimeout(() => {
                const queuedFunc = timeout.func;
                timeout = null;
                queuedFunc();
            }, 100) // Short delay for queued requests
        };
    };
}

// Define StacKAT syntax mode for CodeMirror
function defineStacKATMode() {
    CodeMirror.defineMode("stackat", function() {
        return {
            token: function(stream, state) {
                // Handle comments
                if (stream.match("//")) {
                    stream.skipToEnd();
                    return "comment";
                }

                // Handle keywords
                if (stream.match(/push|pop/i)) {
                    return "keyword";
                }

                // Handle operators
                if (stream.match(/\+|;|\*|==|!=|:=/)) {
                    return "operator";
                }

                // Handle numbers
                if (stream.match(/\d+/)) {
                    return "number";
                }

                // Handle parentheses
                if (stream.match(/\(|\)/)) {
                    return "bracket";
                }

                // Handle identifiers (field names)
                if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
                    return "variable";
                }

                // Skip spaces
                if (stream.eatSpace()) {
                    return null;
                }

                // Handle any other character
                stream.next();
                return null;
            }
        };
    });

    // Register autocomplete for StacKAT
    CodeMirror.registerHelper("hint", "stackat", function(editor, options) {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const start = cursor.ch;
        const end = cursor.ch;

        // Define suggestions
        const suggestions = [
            { text: "push ", displayText: "push - Push value to stack" },
            { text: "pop ", displayText: "pop - Pop value from stack" },
            { text: "0", displayText: "0 - Zero (Drop)" },
            { text: "1", displayText: "1 - One (Identity)" },
            { text: " + ", displayText: "+ - Alternative" },
            { text: " ; ", displayText: "; - Sequence" },
            { text: " == ", displayText: "== - Test field equals value" },
            { text: " != ", displayText: "!= - Test field not equals value" },
            { text: " := ", displayText: ":= - Modify field" },
            { text: "ip", displayText: "ip - IP field" },
            { text: "port", displayText: "port - Port field" },
            { text: "()", displayText: "() - Grouping" },
            { text: "*", displayText: "* - Kleene star" }
        ];

        return {
            list: suggestions,
            from: CodeMirror.Pos(cursor.line, start),
            to: CodeMirror.Pos(cursor.line, end)
        };
    });
}

// Main application class
class StacKATApp {
    constructor() {
        // Initialize CodeMirror editors
        this.initializeEditors();

        // Parse error elements
        this.parseError1Element = document.getElementById('parse-error1');
        this.parseError2Element = document.getElementById('parse-error2');

        // Result badge
        this.resultBadgeElement = document.getElementById('result-badge');

        // Counter example containers for each expression
        this.counterExample1Container = document.getElementById('counter-example-container1');
        this.counterExample2Container = document.getElementById('counter-example-container2');

        // Create the smart debouncer
        this.smartDebounce = createSmartDebounce();

        // Flag to enable/disable the decision procedure
        this.decisionProcedureEnabled = true;

        this.setupEventListeners();

        // Only perform the initial check if the WASM module is already loaded
        if (window.stackat && window.stackat.checkEquivalence) {
            // Use setTimeout to ensure the UI is fully rendered before the first check
            setTimeout(() => this.checkEquivalence(), 100);
        }
    }

    initializeEditors() {
        // Define StacKAT mode for syntax highlighting
        defineStacKATMode();

        // Initialize CodeMirror for expression 1
        this.editor1 = CodeMirror.fromTextArea(document.getElementById('expression1'), {
            mode: "stackat",
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            lineWrapping: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Tab": function(cm) {
                    cm.replaceSelection("    ");
                }
            }
        });

        // Initialize CodeMirror for expression 2
        this.editor2 = CodeMirror.fromTextArea(document.getElementById('expression2'), {
            mode: "stackat",
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            lineWrapping: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Tab": function(cm) {
                    cm.replaceSelection("    ");
                }
            }
        });

        // Store initial values
        this.expr1Value = this.editor1.getValue();
        this.expr2Value = this.editor2.getValue();
    }

    setupEventListeners() {
        // Use the smart debounce that only delays if a request is in flight
        const handleInput = () => {
            if (this.decisionProcedureEnabled) {
                this.smartDebounce(() => this.checkEquivalence());
            }
        };

        // Store the handler function for later use
        this.handleInput = handleInput;

        // Add change event listeners to CodeMirror editors
        this.editor1.on('change', () => {
            this.expr1Value = this.editor1.getValue();
            this.validateSyntax(1);
            handleInput();
        });

        this.editor2.on('change', () => {
            this.expr2Value = this.editor2.getValue();
            this.validateSyntax(2);
            handleInput();
        });
    }

    // Method to disable change handlers temporarily
    disableChangeHandlers() {
        this.editor1.off('change');
        this.editor2.off('change');
    }

    // Method to re-enable change handlers
    enableChangeHandlers() {
        // Clear any existing handlers first
        this.editor1.off('change');
        this.editor2.off('change');

        // Re-add the handlers
        this.editor1.on('change', () => {
            this.expr1Value = this.editor1.getValue();
            this.validateSyntax(1);
            if (this.decisionProcedureEnabled) {
                this.handleInput();
            }
        });

        this.editor2.on('change', () => {
            this.expr2Value = this.editor2.getValue();
            this.validateSyntax(2);
            if (this.decisionProcedureEnabled) {
                this.handleInput();
            }
        });
    }

    validateSyntax(editorNum) {
        const editor = editorNum === 1 ? this.editor1 : this.editor2;
        const errorElement = editorNum === 1 ? this.parseError1Element : this.parseError2Element;
        const expr = editor.getValue().trim();

        // Clear previous error markers
        editor.getAllMarks().forEach(mark => mark.clear());

        // Hide error message initially
        errorElement.style.display = 'none';
        errorElement.innerHTML = '';

        if (!expr) return;

        try {
            // Try to parse the expression using the WASM interface
            if (window.stackat && window.stackat.parseExpression) {
                window.stackat.parseExpression(expr, editorNum);
            }
        } catch (error) {
            // Extract error information
            const errorMsg = error.message || '';
            let errorInfo = this.extractErrorInfo(errorMsg);

            if (errorInfo) {
                // Create a formatted error message with code snippet
                const formattedError = this.formatErrorMessage(errorInfo, expr);

                // Show error message with code snippet
                errorElement.innerHTML = formattedError;
                errorElement.style.display = 'block';
            }
        }
    }

    extractErrorInfo(errorMsg) {
        // Try to extract JSON error information
        try {
            const match = errorMsg.match(/Failed to parse expression \d+: ({.*})/);
            if (match && match[1]) {
                const errorJson = JSON.parse(match[1]);
                return {
                    message: errorJson.message,
                    start: errorJson.start,
                    end: errorJson.end
                };
            }
        } catch (e) {
            console.error('Error parsing error JSON:', e);
        }

        // Fallback to old method if JSON parsing fails
        const posMatch = errorMsg.match(/at position (\d+)/i);
        const position = posMatch ? parseInt(posMatch[1]) : undefined;

        // Clean up the error message
        let message = errorMsg
            .replace(/Failed to parse expression \d+:/i, '')
            .replace(/at position \d+/i, '')
            .trim();

        return { message, start: position, end: position ? position + 1 : undefined };
    }

    calculatePosition(expr, position) {
        // Convert flat position to line and character position
        const lines = expr.split('\n');
        let currentPos = 0;

        for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length + 1; // +1 for the newline

            if (currentPos + lineLength > position) {
                // Error is on this line
                const ch = position - currentPos;
                return { line: i, ch };
            }

            currentPos += lineLength;
        }

        return null;
    }

    formatErrorMessage(errorInfo, expr) {
        // Make error messages more user-friendly
        let message = errorInfo.message;

        // Create a code snippet with the error highlighted
        let codeSnippet = '';
        if (errorInfo.start !== undefined && errorInfo.end !== undefined) {
            // Get the line containing the error
            const lines = expr.split('\n');
            let currentPos = 0;
            let errorLine = '';
            let lineNumber = 0;
            let errorStartInLine = 0;
            let errorEndInLine = 0;

            // Find the line containing the error
            for (let i = 0; i < lines.length; i++) {
                const lineLength = lines[i].length + 1; // +1 for the newline
                if (currentPos <= errorInfo.start && errorInfo.start < currentPos + lineLength) {
                    errorLine = lines[i];
                    lineNumber = i + 1;
                    errorStartInLine = errorInfo.start - currentPos;
                    errorEndInLine = Math.min(errorInfo.end - currentPos, lines[i].length);
                    break;
                }
                currentPos += lineLength;
            }

            if (errorLine) {
                // Create a highlighted code snippet
                const beforeError = errorLine.substring(0, errorStartInLine);
                const errorPart = errorLine.substring(errorStartInLine, errorEndInLine);
                const afterError = errorLine.substring(errorEndInLine);

                codeSnippet = `<div class="error-code-snippet">Line ${lineNumber}: ${beforeError}<span class="error-highlight">${errorPart}</span>${afterError}</div>`;
            }
        }

        return `<strong>Parse error:</strong> ${message}${codeSnippet}`;
    }

    checkEquivalence() {
        // If decision procedure is disabled, don't proceed
        if (!this.decisionProcedureEnabled) {
            return;
        }

        const expr1 = this.expr1Value.trim();
        const expr2 = this.expr2Value.trim();

        // Clear previous counter examples
        this.clearCounterExamples();

        if (!expr1 || !expr2) {
            this.updateResultBadge('Error', 'error');
            return;
        }

        try {
            // Add a console log to help with debugging
            console.time('checkEquivalence');

            // Call the Rust code through the WASM interface - always use empty arrays for packets
            // since we're always doing comprehensive checking
            const result = window.stackat.checkEquivalence(expr1, expr2, [], []);

            console.timeEnd('checkEquivalence');
            this.updateUI(result);
        } catch (error) {
            console.error('Error in checkEquivalence:', error);

            // The individual syntax validation will handle parse errors
            this.updateResultBadge('Error', 'error');
        }
    }

    clearParseErrors() {
        this.parseError1Element.style.display = 'none';
        this.parseError1Element.textContent = '';
        this.parseError2Element.style.display = 'none';
        this.parseError2Element.textContent = '';

        // Clear error markers in editors
        this.editor1.getAllMarks().forEach(mark => mark.clear());
        this.editor2.getAllMarks().forEach(mark => mark.clear());
    }

    clearCounterExamples() {
        this.counterExample1Container.innerHTML = '';
        this.counterExample2Container.innerHTML = '';
    }

    updateResultBadge(text, className) {
        this.resultBadgeElement.className = 'result-badge';
        if (className) {
            this.resultBadgeElement.classList.add(className);
        }
        this.resultBadgeElement.textContent = text;
    }

    updateUI(result) {
        // Update the result badge
        switch (result.comparison) {
            case 'Equal':
                this.updateResultBadge('Equal (=)', 'equal');
                break;
            case 'LeftIsSubset':
                this.updateResultBadge('Right is greater (⊂)', 'left-subset');
                break;
            case 'RightIsSubset':
                this.updateResultBadge('Left is greater (⊃)', 'right-subset');
                break;
            case 'NotEqual':
                this.updateResultBadge('Incomparable (≠)', 'not-equal');
                break;
            default:
                this.updateResultBadge('Unknown result');
        }

        // Display counter examples if any
        if (result.path1) {
            // This counter example is accepted by left but not by right
            this.addCounterExample(
                'This packet is produced only by <span class="left">left</span>:',
                result.path1,
                this.counterExample1Container
            );
        } else {
            this.noCounterExample(
                'All <span class="left">left</span> packets are produced by <span class="right">right</span> also.',
                this.counterExample1Container
            );
        }

        if (result.path2) {
            // This counter example is accepted by right but not by left
            this.addCounterExample(
                'This packet is produced only by <span class="right">right</span>:',
                result.path2,
                this.counterExample2Container
            );
        } else {
            this.noCounterExample(
                'All <span class="right">right</span> packets are produced by <span class="left">left</span> also.',
                this.counterExample2Container
            );
        }
    }

    addCounterExample(title, counterExample, container) {
        const counterExampleDiv = document.createElement('div');
        counterExampleDiv.className = 'counter-example';

        // Format packet headers for display
        const formatPacket = (packet) => {
            if (!packet || packet.length === 0) return "";
            return packet.map(([field, value]) => `${field}: ${value}`).join(', ');
        };

        // Format stack for display
        const formatStack = (stack) => {
            if (!stack || stack.length === 0) return "[]";
            return `[${stack.join(', ')}]`;
        };

        // Create a unified display format for input and output
        const formatUnified = (packet, stack) => {
            const packetStr = formatPacket(packet);
            const stackStr = formatStack(stack);

            if (packetStr) {
                return `{${packetStr}; stack: ${stackStr}}`;
            } else {
                return `{stack: ${stackStr}}`;
            }
        };

        // Create a more streamlined display with unified format
        counterExampleDiv.innerHTML = `
            <h4>${title}</h4>
            <div class="counter-example-details">
                <div class="counter-example-item">
                    <div><strong>Input:</strong> <code>${formatUnified(counterExample.input_packet, counterExample.input)}</code></div>
                    <div><strong>Output:</strong> <code>${formatUnified(counterExample.output_packet, counterExample.output)}</code></div>
                </div>
            </div>
        `;

        container.appendChild(counterExampleDiv);
    }

    noCounterExample(description, container) {
        const noCounterExampleDiv = document.createElement('div');
        noCounterExampleDiv.className = 'counter-example';
        noCounterExampleDiv.innerHTML = `
            <div class="counter-example-details">
                <h4>${description}</h4>
            </div>
        `;
        container.appendChild(noCounterExampleDiv);
    }
}

// Initialize the app when the WASM module is loaded
window.addEventListener('load', () => {
    console.log('Page loaded, checking for WASM module...');

    // Check if the WASM module is loaded
    if (window.stackat && window.stackat.checkEquivalence) {
        console.log('WASM module already loaded, initializing app');
        window.app = new StacKATApp();
    } else {
        // If not loaded yet, wait for it
        console.log('WASM module not loaded yet, waiting for event');
        document.addEventListener('stackat-wasm-loaded', () => {
            console.log('WASM module loaded event received, initializing app');
            window.app = new StacKATApp();
        });
    }
});