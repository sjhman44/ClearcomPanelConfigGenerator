function populateDropdowns(data) {
    const targetIds = [
        'target0', 'target1', 'target2', 'target3',
        'target4', 'target5', 'target6', 'target7',
        'target8', 'target9', 'target10', 'target11'
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
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "application/xml");

        // Check for errors in parsing
        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
            console.error("Error parsing XML:", parseError[0].textContent);
            return;
        }

        // Populate fields from XML
        populateFieldsFromXML(xmlDoc, targetsData);
        
        // Set the filename input to the uploaded file's name, stripping the date
        const fileNameInput = document.getElementById('fileName');
        const baseFileName = file.name.replace(/(_\d{4}-\d{2}-\d{2})?\.ccl$/, ''); // Remove _YYYY-MM-DD and .ccl extension
        fileNameInput.value = baseFileName; // Set the stripped filename
    };
    reader.readAsText(file);
}

function populateFieldsFromXML(xmlDoc, targetsData) {
    const exportKeys = xmlDoc.getElementsByTagName("exportkey");

    // Populate dropdowns from XML
    const targetIds = [
        'target0', 'target1', 'target2', 'target3',
        'target4', 'target5', 'target6', 'target7',
        'target8', 'target9', 'target10', 'target11'
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
function generateXML() {
    const fileName = document.getElementById('fileName').value || 'output';
    const today = new Date().toISOString().split('T')[0];
    const xmlFileName = `${fileName}_${today}.ccl`;

    fetch('template.xml')
        .then(response => response.text())
        .then(xmlContent => {
            // Replace placeholders with actual values
            xmlContent = xmlContent
                .replace(/{FILENAME}/g, fileName)
                .replace(/{TARGET0}/g, document.getElementById('target0').value)
                .replace(/{TARGET1}/g, document.getElementById('target1').value)
                .replace(/{TARGET2}/g, document.getElementById('target2').value)
                .replace(/{TARGET3}/g, document.getElementById('target3').value)
                .replace(/{TARGET4}/g, document.getElementById('target4').value)
                .replace(/{TARGET5}/g, document.getElementById('target5').value)
                .replace(/{TARGET6}/g, document.getElementById('target6').value)
                .replace(/{TARGET7}/g, document.getElementById('target7').value)
                .replace(/{TARGET8}/g, document.getElementById('target8').value)
                .replace(/{TARGET9}/g, document.getElementById('target9').value)
                .replace(/{TARGET10}/g, document.getElementById('target10').value)
                .replace(/{TARGET11}/g, document.getElementById('target11').value);

            // Code to download the XML file...
            const blob = new Blob([xmlContent], { type: 'text/xml' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = xmlFileName;
            link.click();
        })
        .catch(error => console.error('Error loading XML template:', error));
}


// Fetch targets.json on page load
window.onload = function() {
    fetch('../targets.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
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
