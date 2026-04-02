# Flare Browser Extension

A Chrome browser extension that lets you select text on any webpage and quickly ask your favorite AI provider about it with an optional prompt.

## Features

- **Text Selection**: Select any text on any webpage
- **Quick Access**: Click the "Ask" button that appears above your selection
- **Multi-Provider Support**: Choose between Grok, Perplexity, ChatGPT, Claude, and Gemini
- **Context Enhancement**: Add additional context, questions, and optionally include the current page URL
- **Clean UI**: Modern, responsive interface with tactile feedback that works on all websites
- **Dynamic Theme Switching**: Choose between Light, Dark, or System themes
- **Local Settings**: Remembers your preferred AI provider and theme using Chrome Storage

## How to Use

1. **Select Provider & Theme**: Click the extension icon in your toolbar to open the settings popup. Choose your preferred AI provider and theme.
2. **Select Text**: Highlight any text on a webpage.
3. **Click "Ask"**: A small button with the Flare icon will appear above your selection.
4. **Add Context** (Optional): Use the popup card to type a question or add more context.
5. **Include URL** (Optional): Check the "Include URL" box to pass the current page's link to the AI.
6. **Submit**: Click the submit button (with your provider's icon) or press Enter.
7. **View Result**: A new tab will open for your chosen AI provider with your query pre-filled and ready to go.

## Installation

### Development Mode (Recommended)

1. **Download the Extension**
   - Download all extension files to a local directory
   - Ensure you have all required files: `manifest.json`, `background.js`, `content.js`, `content.css`, `popup.*`, `providers.js`, and the `icons/` folder.

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/` in your Chrome browser
   - Or go to Chrome Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the directory containing the extension files
   - The "Flare" extension should now appear in your extensions list

5. **Pin the Extension** (Optional)
   - Click the extensions puzzle piece icon in your Chrome toolbar
   - Pin "Flare" for easy access to settings

## Technical Details

### Architecture

- **Manifest V3**: Uses the latest Chrome extension manifest format
- **Service Worker (`background.js`)**: Handles tab creation and URL parameter generation
- **Content Scripts (`content.js`, `content.css`)**: Injects UI elements (button and popup card) and handles on-page interactions
- **Popup (`popup.html/js/css`)**: Provides the extension menu for selecting themes and AI providers
- **Shared Config (`providers.js`)**: Centralized configuration for AI provider URLs and SVG icons

### Permissions

The extension requires the minimum necessary permissions:

- `tabs`: To create new tabs and open the AI provider URLs
- `storage`: To save and retrieve your provider and theme preferences

## Development

### Local Development

1. **Make Changes**: Edit the source files as needed
2. **Reload Extension**: Go to `chrome://extensions/` and click the refresh icon for "Flare", or use the reload button in the extension popup.
3. **Test**: Visit a webpage and test the extension functionality

### Build Process

This extension requires no build process - it's a pure JavaScript/CSS/HTML extension using modern web standards.

### Debugging

- **Extension Errors**: Check `chrome://extensions/` → "Flare" → "Details" → "Inspect views: service worker"
- **Content Script**: Right-click on any webpage → "Inspect" → Console tab (Set `const debug = true;` in `content.js` for verbose logs)
- **Background Script**: Check the service worker console for error messages (Set `let debug = true;` in `background.js`)

## Browser Compatibility

- **Chrome**: Fully supported (Manifest V3)
- **Microsoft Edge**: Compatible (Chromium-based)
- **Other Chromium Browsers**: Should work with minor adjustments

*Note: This extension uses Manifest V3 which is only available in modern Chromium-based browsers.*

## Privacy & Security

- **No Data Collection**: The extension does not collect, store, or transmit any personal data
- **Local Storage**: Preferences are stored locally in your browser using Chrome Sync
- **Secure Permissions**: Only requests the minimum necessary permissions (`tabs` and `storage`)
- **Direct Navigation**: Opens your chosen AI provider directly via URL parameters without intercepting or man-in-the-middle data

## Troubleshooting

### Button Not Appearing
- Ensure text is actually selected (highlighted)
- Ensure the selected text is not inside an editable field (like a text input)
- Try refreshing the webpage
- Check that the extension is enabled in `chrome://extensions/`

### Query Not Passing to Provider
- Check if you are logged into the AI provider's website
- Ensure your browser hasn't blocked the new tab from opening

### Extension Not Working
- Check the extension's background script console for errors
- Ensure all required files are present
- Try clicking the reload button in the extension popup or in `chrome://extensions/`


