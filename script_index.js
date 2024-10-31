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
            clearQrCode()
            // Update links with encoded data after upload
            createEncodedUrl();
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    };
    reader.readAsText(file);
}

/* DEPRECIATED
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
*/

// Function to clear storage
function clearStorage() {
    clearQrCode()
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

    /* DEPRECIATED
    // Apply encoded data to all links with IDs that start with "link"
    const links = document.querySelectorAll('a[id^="link"]');
    links.forEach(link => {
        const baseUrl = link.getAttribute('href').split('?')[0]; // Remove any existing query strings
        link.setAttribute('href', `${baseUrl}?data=${encodedData}`);
    });

    // Display the encoded URL for reference
    displayEncodedUrl(`${window.location.origin}${window.location.pathname}?data=${encodedData}`);
    */
}

// Function to display the encoded URL for easy copy or share
function displayEncodedUrl(url) {
    const output = document.getElementById('output');
    output.textContent = `Encoded URL: ${url}`;
}

// Function to initialize and add query string to links on page load if data exists
function initializeLinks() {
    const storedData = localStorage.getItem('storedJsonData');
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');

    if (dataParam) {
        createEncodedUrl(); 
    } else if (storedData){
        createEncodedUrl(); 
    }
}

// Function to check for data in the URL and store it
function checkForUrlData() {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    const storedData = localStorage.getItem('storedJsonData');
    if (dataParam) {
        try {
            const decodedData = decodeURIComponent(escape(atob(dataParam)));
            const jsonData = JSON.parse(decodedData);
            // Store the parsed JSON data in local storage for future use
            localStorage.setItem('storedJsonData', JSON.stringify(jsonData));
           
            createEncodedUrl();
            redirectWithoutData();
        } catch (error) {
            console.error('Error decoding URL data:', error);
        }
    }
    else if (storedData){
        createEncodedUrl(); 
    }
}

// Function to redirect to URL without data parameter
function redirectWithoutData() {
    const baseUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, baseUrl); // Update the address bar without reloading
}

// Initialize links on page load
window.onload = checkForUrlData;

function copyUrlWithData() {
    // Get the base URL
    const baseUrl = window.location.origin + window.location.pathname;

    // Get the stored JSON data from local storage
    const localStorageData = localStorage.getItem('storedJsonData');
    let jsonData = '';
    
    // Check the URL parameters for the data
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
        jsonData = dataParam;
        console.log('Using URL DATA');
    } else if (localStorageData) {
        // If data is in local storage, use it
        jsonData = encodeURIComponent(btoa(localStorageData));
        console.log('Using Stored DATA');
    }

    // Construct the full URL
    const fullUrl = `${baseUrl}?data=${jsonData}`;

    // Copy to clipboard
    navigator.clipboard.writeText(fullUrl)
        .then(() => {
            alert('URL copied to clipboard!');

            // Generate the QR code
            generateQRCode(fullUrl);
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

// Function to generate the QR code and display it in the canvas
function generateQRCode(url) {
    clearQrCode()
    const qrCanvas = document.getElementById('qrCodeCanvas');
    
    // Create a new QRious instance to draw the QR code on the canvas
    const qr = new QRious({
        element: qrCanvas,
        value: url,
        size: 256,             // Set the size of the QR code (optional)
        background: '#ffffff', // Background color (optional)
        foreground: '#000000'  // Foreground color (optional)
    });
}
function clearQrCode() {
    const qrCanvas = document.getElementById('qrCodeCanvas');
    const qrContext = qrCanvas.getContext('2d');
    qrContext.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
}