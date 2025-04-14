// Droll Agents - Startup Trends Analyst JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application with all event listeners
 */
function initializeApp() {
    // Set up event listeners
    const searchButton = document.getElementById('searchButton');
    const queryInput = document.getElementById('query');
    
    searchButton.addEventListener('click', getResearch);
    queryInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            getResearch();
        }
    });
    
    // Add focus animation to input
    queryInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    queryInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
    
    // Add button interaction
    searchButton.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(-1px)';
    });
    
    searchButton.addEventListener('mouseup', function() {
        this.style.transform = '';
    });
    
    // Focus input on page load for better UX
    setTimeout(() => {
        queryInput.focus();
    }, 500);
}

/**
 * Send a research query to the backend and handle the response
 */
function getResearch() {
    const query = document.getElementById('query').value;
    if (!query) {
        showError("Please enter a query to research");
        return;
    }
    
    const loadingEl = document.getElementById('loading');
    const resultEl = document.getElementById('result');
    const errorEl = document.getElementById('error');
    const searchButton = document.getElementById('searchButton');
    
    // Show loading state and disable button
    loadingEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    resultEl.innerHTML = '';
    searchButton.disabled = true;
    searchButton.innerText = 'Researching...';
    
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
        
        // Reset button state
        searchButton.disabled = false;
        searchButton.innerHTML = '<span>Research</span>';
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
            // Format the response with some basic markdown-like styling
            const formattedResponse = formatResponse(data.response);
            resultEl.innerHTML = formattedResponse;
            resultEl.classList.remove('hidden');
            
            // Scroll to result
            setTimeout(() => {
                resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            showError("Received invalid data format from server");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        
        // Reset button state
        searchButton.disabled = false;
        searchButton.innerHTML = '<span>Research</span>';
        loadingEl.classList.add('hidden');
        
        showError(`Request failed: ${error.message}`);
    });
}

/**
 * Format the response text with basic HTML styling
 * @param {string} text - The response text to format
 * @returns {string} - The formatted HTML
 */
function formatResponse(text) {
    // Look for potential headers and lists to format them
    let formatted = text;
    
    // Format headers (### Header)
    formatted = formatted.replace(/###\s+(.*?)(\n|$)/g, '<h3>$1</h3>');
    
    // Format subheaders (## Header)
    formatted = formatted.replace(/##\s+(.*?)(\n|$)/g, '<h2>$1</h2>');
    
    // Format bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format lists
    const listItems = formatted.split('\n').map(line => {
        // Check for bullet points
        if (line.trim().startsWith('- ')) {
            return `<li>${line.trim().substring(2)}</li>`;
        }
        // Check for numbered lists
        else if (/^\d+\.\s+/.test(line.trim())) {
            return `<li>${line.trim().replace(/^\d+\.\s+/, '')}</li>`;
        }
        return line;
    });
    
    // Group list items
    let inList = false;
    let htmlContent = [];
    
    for (let i = 0; i < listItems.length; i++) {
        const item = listItems[i];
        
        if (item.startsWith('<li>') && !inList) {
            htmlContent.push('<ul>');
            inList = true;
        } else if (!item.startsWith('<li>') && inList) {
            htmlContent.push('</ul>');
            inList = false;
        }
        
        htmlContent.push(item);
    }
    
    if (inList) {
        htmlContent.push('</ul>');
    }
    
    // Convert newlines to <br> tags for remaining text
    formatted = htmlContent.join('\n').replace(/\n/g, '<br>');
    
    return formatted;
}

/**
 * Display an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    
    // Scroll to error message
    setTimeout(() => {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}
