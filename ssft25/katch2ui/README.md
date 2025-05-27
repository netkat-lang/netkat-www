<<<<<<< HEAD
# KATch2 UI - Self-Contained NetKAT Editor

A drop-in JavaScript library that automatically transforms `<netkat>` elements into interactive Monaco editors with live NetKAT analysis.

## 🚀 Quick Start

### 1. Drop in the Directory
Copy the entire `katch2ui` directory to your website.

### 2. Add One Script Tag
Include the script at the end of your HTML page:

=======
# KATch2 UI - Interactive NetKAT Editor Library

## ✨ Features

- **Live Analysis**: Real-time NetKAT emptiness checking and trace generation
- **Syntax Highlighting**: Full NetKAT language support
- **Error Detection**: Precise error locations and messages
- **Zero Configuration**: Works out-of-the-box: include 1 Javascript file for <netkat> interactive editor

## 🚀 Quick Start

### 1. Host Required Files
Copy these files to your web server:
```
katch2ui/
├── katch2-editor.js     # Main library
└── pkg/
    ├── katch2.js        # WASM glue code
    └── katch2_bg.wasm   # WASM binary
```

### 2. Include the Library
>>>>>>> a64dff3423a57baaa3b613dd0c0482750ea2bdb8
```html
<script type="module" src="katch2ui/katch2-editor.js"></script>
```

<<<<<<< HEAD
### 3. Use NetKAT Elements
Add NetKAT code anywhere in your HTML:

```html
<netkat>x0 := 0; x1 := 1</netkat>
```

**That's it!** The library will automatically find and transform these elements into interactive editors.

## 📁 Directory Structure

```
katch2ui/
├── katch2-editor.js       # Main library (just include this!)
├── pkg/                   # WASM files (auto-detected)
│   ├── katch2.js         # WASM JavaScript glue
│   ├── katch2_bg.wasm    # WASM binary
│   └── ...
├── example.html          # Working example
└── README.md             # This documentation
```

## 💡 Usage Examples

### Basic Example
```html
<!DOCTYPE html>
<html>
<head>
    <title>My NetKAT Tutorial</title>
</head>
<body>
    <h1>Learning NetKAT</h1>
    
    <h2>Basic Assignment</h2>
    <netkat>x0 := 0</netkat>
    
    <h2>Sequential Composition</h2>
    <netkat>x0 := 0; x1 := 1</netkat>
    
    <!-- Just include this one script -->
    <script type="module" src="katch2ui/katch2-editor.js"></script>
</body>
</html>
```

### Custom Height and Line Numbers
```html
<netkat lines="5">
// Enter your NetKAT code here - 5 lines tall
dup
</netkat>

<netkat line-numbers="true">
// This editor shows line numbers
x0 := 0; x1 := 1
</netkat>
```

### Target Editor Feature (Two-Column Layout)
Create clickable examples that load into a target editor:

```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
    <div>
        <h3>Examples:</h3>
        
        <!-- Clickable examples (read-only) -->
        <h4>Basic:</h4>
        <netkat target="main-editor">x0 := 1</netkat>
        
        <h4>Advanced:</h4>
        <netkat target="main-editor" lines="3">
x0 := 0; x1 := 0;
((x0 == 0; x0 := 1 + x0 == 1; x1 := 1); dup)*;
x0 == 0; x1 == 1
        </netkat>
    </div>
    
    <div>
        <h3>Live Editor:</h3>
        <!-- Target editor (editable, shows analysis) -->
        <netkat id="main-editor" lines="8" line-numbers="true">
// Click examples to load them here
        </netkat>
    </div>
</div>
```

### Multiple Examples on One Page
```html
<h2>Example 1: Basic</h2>
<netkat>x0 := 1</netkat>

<h2>Example 2: Conditional</h2>
<netkat>x0 == 0; x1 := 1 + x0 == 1; x1 := 0</netkat>

<h2>Example 3: Iteration</h2>
<netkat lines="4">
x0 := 0; x1 := 0;
((x0 == 0; x0 := 1 + x0 == 1; x1 := 1); dup)*;
x0 == 0; x1 == 1
</netkat>
```

## ⚙️ Configuration (Optional)

The library works out-of-the-box with sensible defaults, but you can customize it:

```html
<script type="module">
import { KATch2Editor } from './katch2ui/katch2-editor.js';

const editor = new KATch2Editor();
await editor.init({
    theme: 'dark',                    // 'light' or 'dark'
    selector: '.my-netkat-code',      // Custom CSS selector (default: 'netkat')
    customElement: 'my-netkat',       // Custom element name
    autoInit: false                   // Disable auto-transformation
});
</script>
```

### Available Options

| Option | Default | Description |
|--------|---------|-------------|
| `theme` | `'light'` | Editor theme (`'light'` or `'dark'`) |
| `selector` | `'netkat'` | CSS selector for auto-transformation |
| `customElement` | `'netkat-editor'` | Custom element tag name |
| `autoInit` | `true` | Automatically transform elements on load |
| `monacoVersion` | `'0.52.2'` | Monaco Editor version from CDN |
| `wasmPath` | *auto-detected* | Path to WASM files (usually auto-detected) |

### Element Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `lines` | Set editor height in lines | `<netkat lines="5">code</netkat>` |
| `line-numbers` | Show line numbers (default: false) | `<netkat line-numbers="true">code</netkat>` |
| `target` | Target editor ID (makes this a clickable example) | `<netkat target="main-editor">code</netkat>` |
| `id` | Editor ID (makes this a target for examples) | `<netkat id="main-editor">code</netkat>` |

## 🎯 Features

- ✅ **Zero Configuration**: Works immediately with one script include
- ✅ **Auto-Detection**: Automatically finds WASM files and NetKAT elements
- ✅ **Live Analysis**: Real-time emptiness analysis as you type
- ✅ **Syntax Highlighting**: Full NetKAT language support
- ✅ **Error Highlighting**: Precise error location with red underlines
- ✅ **Responsive**: Works on desktop, tablet, and mobile
- ✅ **Self-Contained**: No external dependencies except Monaco CDN
- ✅ **Multiple Editors**: Supports unlimited editors on one page
- ✅ **Target Editor**: Clickable examples that load into target editors (perfect for tutorials)

## 🌐 Browser Compatibility

- **Chrome/Edge**: Full support ✅
- **Firefox**: Full support ✅  
- **Safari**: Full support ✅ (modern versions)

Requires ES6+ support for modules and async/await.

## 📚 NetKAT Language Reference

The editor supports full NetKAT syntax with highlighting and analysis:

### Basic Syntax
- **Field assignment**: `x0 := 1`
- **Field test**: `x0 == 1` 
- **Sequential composition**: `x0 := 0; x1 := 1`
- **Choice**: `x0 == 0; x1 := 1 + x0 == 1; x1 := 0`
- **Iteration**: `(x0 := 0; x1 := 1)*`
- **Duplication**: `dup`
- **Drop**: `F` (false)
- **Identity**: `T` (true)

### Comments
```netkat
// This is a single-line comment
x0 := 0; // Comments can be at the end of lines too
```

## 🛠️ For Developers

### Building WASM Files

If you need to rebuild the WASM module, run this from the project root:

```bash
# Build WASM files
wasm-pack build --target web

# Copy to the UI directory
cp -r pkg/* katch2ui/pkg/
```

### Creating a Build Script

Add this to your `package.json` or create a build script:

```bash
#!/bin/bash
# build-ui.sh
wasm-pack build --target web
rm -rf katch2ui/pkg/*
cp -r pkg/* katch2ui/pkg/
echo "✅ KATch2 UI updated with latest WASM files"
```

### Directory Deployment

To deploy to a website:

1. Copy the entire `katch2ui` directory to your web server
2. Reference it in your HTML: `<script src="path/to/katch2ui/katch2-editor.js"></script>`
3. The library automatically detects its location and finds the WASM files

## 🎓 Educational Use

Perfect for:
- **Interactive Tutorials**: Live code examples students can edit
- **Documentation**: Embedded runnable examples
- **Course Materials**: Self-contained educational resources
- **Research Papers**: Interactive demonstrations
- **Workshops**: Hands-on learning environments

## 📝 Example in This Directory

- `example.html` - Working example showing all features

## 🔧 Troubleshooting

### Editors Don't Appear
- Check browser console for errors
- Ensure `katch2ui/pkg/` directory exists with WASM files
- Verify the script path is correct

### WASM Loading Errors
- Ensure WASM files are accessible via HTTP (not file://)
- Check that `pkg/katch2.js` and `pkg/katch2_bg.wasm` exist
- Verify web server serves `.wasm` files correctly

### Module Import Errors
- Use a modern browser with ES6 module support
- Serve files over HTTP/HTTPS (not file://)
- Include `type="module"` in script tag

## 📄 License

This library is part of the KATch2 project. See the main project repository for license information.

## 🤝 Contributing

Contributions welcome! Please see the main KATch2 repository for contribution guidelines. 
=======
### 3. Add NetKAT Editors
```html
<netkat>x0 := 1; x1 := 0</netkat>
```

## 📝 `<netkat>` Tag Options

### Basic Usage
```html
<netkat>x2 == 1</netkat>
```

### With Attributes
```html
<netkat 
  lines="10" 
  show-line-numbers
  example="Description of this example"
  exercise="Exercise instructions"
  target="other-editor-id"
  id="my-editor">
// Your NetKAT code here
x0 == 1; x1 := 0
</netkat>
```

### Attribute Reference
| Attribute | Description | Default |
|-----------|-------------|---------|
| `lines` | Editor height in lines | `5` |
| `show-line-numbers` | Show line numbers | `false` |
| `num-traces` | How many traces to show | `5` |
| `max-trace-length` | Maximum length of each trace | `5` |
| `example` | Clickable example with description | - |
| `exercise` | Clickable exercise with instructions | - |
| `target` | ID of editor to load into when clicked | - |
| `id` | Unique identifier for this editor | - |

### Interactive Examples
```html
<!-- Clickable example that loads into another editor -->
<netkat target="main-editor" example="Basic test">x0 == 1</netkat>

<!-- The target editor -->
<netkat id="main-editor" lines="15" show-line-numbers>
// Click examples above to load them here
</netkat>
```



>>>>>>> a64dff3423a57baaa3b613dd0c0482750ea2bdb8
