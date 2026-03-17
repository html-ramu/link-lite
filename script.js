// =============================================
// LINK LITE – script.js
// Runs on index.html
// =============================================

// ----- GET HTML ELEMENTS -----
const longUrlInput  = document.getElementById('longUrl');
const shortenBtn    = document.getElementById('shortenBtn');
const resultDiv     = document.getElementById('result');
const shortUrlInput = document.getElementById('shortUrl');
const copyBtn       = document.getElementById('copyBtn');
const errorMsg      = document.getElementById('errorMsg');
const jsonLine      = document.getElementById('jsonLine');
const historySection = document.getElementById('historySection');
const historyList   = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// ----- SETTINGS (easy to change) -----
const SHORT_CODE_LENGTH = 6; // how many characters the short code has

// =============================================
// FUNCTION: Generate random short code
// Example output: "k3b9az"
// =============================================
function generateShortCode() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';

    for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }

    return code;
}

// =============================================
// FUNCTION: Validate URL
// Returns true if URL is valid (http or https)
// =============================================
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
        return false; // URL() throws an error if string is not a valid URL
    }
}

// =============================================
// FUNCTION: Show error message in the UI
// Replaces the old alert() popup
// =============================================
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
}

// =============================================
// FUNCTION: Hide error message
// =============================================
function hideError() {
    errorMsg.textContent = '';
    errorMsg.classList.add('hidden');
}

// =============================================
// FUNCTION: Save a link to localStorage
// localStorage stores data in the browser
// Format: { code: "abc123", url: "https://..." }
// =============================================
function saveToHistory(shortCode, longUrl) {
    // Get existing history from localStorage (or empty array if none)
    const history = JSON.parse(localStorage.getItem('linkLiteHistory') || '[]');

    // Add new entry at the beginning
    history.unshift({ code: shortCode, url: longUrl, date: new Date().toLocaleDateString() });

    // Keep only last 10 links to avoid overflow
    if (history.length > 10) {
        history.pop();
    }

    // Save back to localStorage
    localStorage.setItem('linkLiteHistory', JSON.stringify(history));
}

// =============================================
// FUNCTION: Load and display history
// =============================================
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('linkLiteHistory') || '[]');

    if (history.length === 0) {
        historySection.classList.add('hidden');
        return;
    }

    historySection.classList.remove('hidden');
    historyList.innerHTML = ''; // Clear old list

    history.forEach(function(item) {
        const li = document.createElement('li');
        li.textContent = `🔗 ${item.code} → ${item.url} (${item.date})`;
        historyList.appendChild(li);
    });
}

// ----- Load history when page opens -----
loadHistory();

// =============================================
// EVENT: "Shorten" button click
// =============================================
shortenBtn.addEventListener('click', function () {
    const longUrl = longUrlInput.value.trim();

    // Step 1: Clear any old error
    hideError();

    // Step 2: Check if input is empty
    if (!longUrl) {
        showError('⚠️ Please enter a URL first.');
        return;
    }

    // Step 3: Check if URL is valid
    if (!isValidUrl(longUrl)) {
        showError('⚠️ Please enter a valid URL. It must start with http:// or https://');
        return;
    }

    // Step 4: Generate a short code
    const shortCode = generateShortCode();

    // Step 5: Build the short URL
    // window.location.origin = "https://yourname.github.io"
    // window.location.pathname = "/link-lite/index.html"
    const basePath = window.location.origin + window.location.pathname.replace('index.html', '');
    const shortUrl = `${basePath}redirect.html#${shortCode}`;

    // Step 6: Show result in the UI
    shortUrlInput.value = shortUrl;
    resultDiv.classList.remove('hidden');

    // Step 7: Show the JSON line the user needs to add to links.json
    jsonLine.textContent = `"${shortCode}": "${longUrl}"`;

    // Step 8: Save to localStorage history
    saveToHistory(shortCode, longUrl);
    loadHistory();

    // Step 9: Log to console for debugging
    console.log('✅ Short URL created:', shortUrl);
    console.log('📝 Add to links.json:', `"${shortCode}": "${longUrl}"`);
});

// =============================================
// EVENT: "Copy" button click
// Uses modern clipboard API (not deprecated)
// =============================================
copyBtn.addEventListener('click', function () {
    const textToCopy = shortUrlInput.value;

    // navigator.clipboard is the modern, correct way to copy
    navigator.clipboard.writeText(textToCopy)
        .then(function () {
            // Success feedback
            copyBtn.textContent = '✓ Copied!';
            copyBtn.classList.add('copied');

            // Reset after 2 seconds
            setTimeout(function () {
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        })
        .catch(function (err) {
            // If clipboard fails (some older browsers), show message
            console.error('Copy failed:', err);
            alert('Could not copy. Please select the URL manually and press Ctrl+C.');
        });
});

// =============================================
// EVENT: Press Enter key to shorten
// =============================================
longUrlInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        shortenBtn.click();
    }
});

// =============================================
// EVENT: Clear history button
// =============================================
clearHistoryBtn.addEventListener('click', function () {
    localStorage.removeItem('linkLiteHistory');
    loadHistory();
});
// =============================================
// DARK MODE TOGGLE
// Saves preference to localStorage
// =============================================
const themeToggle = document.getElementById('themeToggle');

// On page load: apply saved theme
(function applyTheme() {
    const saved = localStorage.getItem('linkLiteTheme');
    if (saved === 'dark') {
        document.body.classList.add('dark');
        if (themeToggle) themeToggle.textContent = '☀️ Light Mode';
    }
})();

// On button click: toggle theme
if (themeToggle) {
    themeToggle.addEventListener('click', function () {
        const isDark = document.body.classList.toggle('dark');

        if (isDark) {
            themeToggle.textContent = '☀️ Light Mode';
            localStorage.setItem('linkLiteTheme', 'dark');
        } else {
            themeToggle.textContent = '🌙 Dark Mode';
            localStorage.setItem('linkLiteTheme', 'light');
        }
    });
}