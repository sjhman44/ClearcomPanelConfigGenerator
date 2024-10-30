// Event listener for file upload
document.getElementById('fileUpload').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            // Store JSON data in localStorage
            localStorage.setItem('storedJsonData', JSON.stringify(jsonData));
            alert('Data successfully stored.');

            // Update links with encoded data after upload
            createEncodedUrl();
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    };
    reader.readAsText(file);
}

// Function to display stored data
function displayStoredData() {
    const storedData = localStorage.getItem('storedJsonData');
    const output = document.getElementById('output');
    
    if (storedData) {
        output.textContent = JSON.stringify(JSON.parse(storedData), null, 2);
        createEncodedUrl(); // Update links if data is displayed
    } else {
        output.textContent = ''; // Clear output if no data is found
    }
}

// Function to clear storage
function clearStorage() {
    localStorage.removeItem('storedJsonData');
    alert('Stored data cleared.');

    // Remove encoded data from links
    const links = document.querySelectorAll('a[id^="link"]');
    links.forEach(link => {
        const baseUrl = link.getAttribute('href').split('?')[0]; // Remove any existing query strings
        link.setAttribute('href', baseUrl);
    });

    // Clear output display
    document.getElementById('output').textContent = '';
}

// Function to create and apply encoded URL to links
function createEncodedUrl() {
    const storedData = localStorage.getItem('storedJsonData');
    
    if (!storedData) {
        alert('No data found to encode.');
        return;
    }

    // Convert JSON data to base64
    const encodedData = btoa(storedData);

    // Apply encoded data to all links with IDs that start with "link"
    const links = document.querySelectorAll('a[id^="link"]');
    links.forEach(link => {
        const baseUrl = link.getAttribute('href').split('?')[0]; // Remove any existing query strings
        link.setAttribute('href', `${baseUrl}?data=${encodedData}`);
    });

    // Display the encoded URL for reference
    displayEncodedUrl(`${window.location.origin}${window.location.pathname}?data=${encodedData}`);
}

// Function to display the encoded URL for easy copy or share
function displayEncodedUrl(url) {
    const output = document.getElementById('output');
    output.textContent = `Encoded URL: ${url}`;
}

// Function to initialize and add query string to links on page load if data exists
function initializeLinks() {
    const storedData = localStorage.getItem('storedJsonData');
    if (storedData) {
        createEncodedUrl(); // Encode and add query string to links on load
    } else {
        checkForUrlData(); // Check for data in URL if nothing is stored
    }
}

// Function to check for data in the URL and store it
function checkForUrlData() {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (dataParam) {
        try {
            // Decode the data from base64 and parse it as JSON
            const decodedData = atob(dataParam);
            const jsonData = JSON.parse(decodedData);
            // Store JSON data in localStorage
            localStorage.setItem('storedJsonData', JSON.stringify(jsonData));
            alert('Data from URL successfully stored.');

            // Update links with encoded data after storing
            createEncodedUrl();
        } catch (error) {
            console.error('Error decoding URL data:', error);
        }
    }
}

// Initialize links on page load
window.onload = initializeLinks;

function copyUrlWithData() {
    // Get the base URL
    const baseUrl = window.location.origin + window.location.pathname;

    // Get the stored JSON data from local storage
    const localStorageData = localStorage.getItem('storedJsonData');
    let jsonData = '';

    if (localStorageData) {
        // If data is in local storage, use it
        jsonData = encodeURIComponent(btoa(localStorageData));
    } else {
        // If not, check the URL parameters for the data
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get('data');
        if (dataParam) {
            // If data is found in URL, use it
            jsonData = dataParam;
        }
    }

    // Construct the full URL
    const fullUrl = `${baseUrl}?data=${jsonData}`;

    // Copy to clipboard
    navigator.clipboard.writeText(fullUrl)
        .then(() => {
            alert('URL copied to clipboard!');
        })
        .catch(err => {
            console.error('Error copying URL: ', err);
        });
}

// Function to set up the copy button
function setupCopyButton() {
    const copyButton = document.getElementById('copyButton');
    if (copyButton) {
        copyButton.addEventListener('click', copyUrlWithData);
    } else {
        console.error('Copy button not found');
    }
}

// Call the setup function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', setupCopyButton);
