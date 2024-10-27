function populateDropdowns(data) {
    const targetIds = [
        'target0', 'target1', 'target2', 'target3',
        'target4'
    ];

    // Populate each dropdown with the options from targets.json
    targetIds.forEach(targetId => {
        const select = document.getElementById(targetId);
        // Clear existing options (if any)
        select.innerHTML = '';
        // Add the new options from targets.json
        data.targets.forEach(target => {
            const option = document.createElement('option');
            option.value = target.value; // The value to be used
            option.textContent = target.label; // The label to display
            select.appendChild(option);
        });
    });
}

function loadFile(event, targetsData) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        
        // Log the file content to inspect what is being loaded
        console.log("File content:", content);

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "text/xml");

        // Check for errors in parsing
        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
            console.error("Parsing Error:", parseError[0].textContent);
            return;
        }

        // Populate fields from XML
        populateFieldsFromXML(xmlDoc, targetsData);

        // Set the filename input to the uploaded file's name, stripping the date
        const fileNameInput = document.getElementById('fileName');
        const baseFileName = file.name.replace(/(_\d{4}-\d{2}-\d{2})?\.ccl$/, ''); // Removes date and .xml or .ccl extensions
        console.log("Base filename:", baseFileName); // Log the stripped filename
        fileNameInput.value = baseFileName; // Set the stripped filename
    };
    reader.readAsText(file);
}

function populateFieldsFromXML(xmlDoc, targetsData) {
    const exportKeys = xmlDoc.getElementsByTagName("exportkey");

    // Populate dropdowns from XML
    const targetIds = [
        'target0', 'target1', 'target2', 'target3', 'target4'
    ];

    if (exportKeys.length > 0) {
        for (let i = 0; i < exportKeys.length && i < targetIds.length; i++) {
            const targetValue = exportKeys[i].getAttribute("target");
            const select = document.getElementById(targetIds[i]);
            if (select) {
                select.value = targetValue; // Set the dropdown to the XML value
            }
        }

        // Set the file name input to the panel attribute of the XML
        const fileNameInput = document.getElementById('fileName');
        const panelName = xmlDoc.querySelector("ExportKeySet").getAttribute("panel");
        fileNameInput.value = panelName || "output"; // Default name if not found
    } else {
        // If no export keys found, fallback to targets.json
        populateDropdowns(targetsData);
    }
}
async function generateXML() {
    const fileName = document.getElementById('fileName').value || 'output';
    const today = new Date().toISOString().split('T')[0];
    const xmlFileName = `${fileName}_${today}.ccl`;

    // Fetch the template XML file
    const response = await fetch('FSII_template.xml');
    const xmlTemplate = await response.text();

    // Replace placeholders with actual values
    const xmlContent = xmlTemplate
        .replace(/{fileName}/g, fileName)
        .replace(/{target0}/g, document.getElementById('target0').value)
        .replace(/{target1}/g, document.getElementById('target1').value)
        .replace(/{target2}/g, document.getElementById('target2').value)
        .replace(/{target3}/g, document.getElementById('target3').value)
        .replace(/{target4}/g, document.getElementById('target3').value)
       

    // Create a Blob and download link for the XML
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
    downloadLink.download = xmlFileName;
    downloadLink.style.display = 'block';
    downloadLink.textContent = 'Download File';
}


// Fetch targets.json on page load
window.onload = function() {
    fetch('../targets.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Cannot load targets.json');
            }
            return response.json();
        })
        .then(data => {
            populateDropdowns(data); // Populate dropdowns from targets.json
            
            // Attach file upload handler
            const fileUpload = document.getElementById('fileUpload');
            fileUpload.addEventListener('change', function(event) {
                loadFile(event, data); // Pass targetsData to populateFieldsFromXML
            });
        })
        .catch(error => console.error('Error fetching targets:', error));
};
