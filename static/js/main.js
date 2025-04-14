// Main application JavaScript file for Startup Trends Agent

document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners once DOM is fully loaded
    document.getElementById('searchButton').addEventListener('click', getResearch);
    document.getElementById('query').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            getResearch();
        }
    });
});

/**
 * Send a research query to the backend and handle the response
 */
function getResearch() {
    const query = document.getElementById('query').value;
    if (!query) {
        showError("Please enter a query");
        return;
    }
    
    const loadingEl = document.getElementById('loading');
    const resultEl = document.getElementById('result');
    const errorEl = document.getElementById('error');
    
    // Show loading state
    loadingEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    resultEl.innerHTML = '';
    
    console.log("Sending request with query:", query);
    
    // Use the fetch API with appropriate error handling
    fetch('/api/research', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ query: query })
    })
    .then(response => {
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Received data:", data);
        loadingEl.classList.add('hidden');
        
        // Check if we have a valid response
        if (!data) {
            showError("Received empty data from server");
            return;
        }
        
        // Display either the response or error
        if (data.error) {
            showError(data.error);
        } else if (data.response) {
            resultEl.innerHTML = data.response;
            resultEl.classList.remove('hidden');
        } else {
            showError("Received invalid data format from server");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        loadingEl.classList.add('hidden');
        showError(`Request failed: ${error.message}`);
    });
}

/**
 * Display an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}