// =============================================
// LINK LITE – redirect.js
// Runs on redirect.html
// When someone visits: redirect.html#abc123
// This script finds "abc123" in links.json
// and sends them to the original URL
// =============================================

// Get the status message element
const statusEl = document.getElementById('status');

// =============================================
// FUNCTION: Load links.json file
// Uses fetch() to read the JSON file
// =============================================
async function loadLinks() {
    try {
        // Fetch using a simple relative path
        const response = await fetch('links.json');

        // If the file couldn't be loaded (e.g., 404)
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        // Parse and return the JSON data
        const links = await response.json();
        return links;

    } catch (error) {
        console.error('❌ Failed to load links.json:', error);
        return null; // Return null so we can handle the error below
    }
}

// =============================================
// FUNCTION: Main redirect logic
// =============================================
async function startRedirect() {

    // Step 1: Get the short code from the URL
    // window.location.hash = "#abc123"
    // .substring(1) removes the "#" → "abc123"
    const shortCode = window.location.hash.substring(1);

    // Step 2: If URL has no hash, show error
    if (!shortCode) {
        statusEl.textContent = '❌ No short code found in the URL.';
        statusEl.className = 'status-error'; // CSS class, not inline style
        return;
    }

    // Step 3: Load the links database
    statusEl.textContent = '⏳ Loading...';
    const links = await loadLinks();

    // Step 4: If links.json failed to load, show error
    if (!links) {
        statusEl.textContent = '❌ Could not load the links database. Please try again.';
        statusEl.className = 'status-error';
        return;
    }

    // Step 5: Look up the short code in the JSON
    const originalUrl = links[shortCode];

    // Step 6: If found, redirect the user
    if (originalUrl) {
        statusEl.textContent = `✅ Found! Redirecting to ${originalUrl}...`;
        statusEl.className = 'status-success';

        // Redirect after a short delay so the user can see the message
        setTimeout(function () {
            window.location.href = originalUrl;
        }, 1200);

    } else {
        // Step 7: If short code not in JSON, show a not-found message
        statusEl.textContent = `❌ Short link "${shortCode}" not found. It may not exist yet.`;
        statusEl.className = 'status-error';
    }
}

// ----- Run the redirect when the page loads -----
startRedirect();
