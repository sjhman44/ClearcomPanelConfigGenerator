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
        const baseFileName = file.name.replace(/(_\d{4}-\d{2}-\d{2})?\.xml$/, ''); // Remove _YYYY-MM-DD and .xml extension
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
    const xmlFileName = `${fileName}_${today}.xml`;

    const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<ExportKeySet panel="${fileName}" panelType="EdgeRole" versionNo="3">
    <ShiftPages />
    <keys>
        <exportkey number="0" page="0" region="0" activation="1" tfl="0" dtl="0" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="00000000-0000-0000-0000-000000000000" ColourIndexOverride="0" dl="0" target="${document.getElementById('target0').value}" />
        <exportkey number="1" page="0" region="0" activation="2" tfl="0" dtl="0" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="00000000-0000-0000-0000-000000000000" ColourIndexOverride="0" dl="0" target="${document.getElementById('target1').value}" />
        <exportkey number="2" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="00000000-0000-0000-0000-000000000000" ColourIndexOverride="0" dl="0" target="${document.getElementById('target2').value}" />
        <exportkey number="3" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="00000000-0000-0000-0000-000000000000" ColourIndexOverride="0" dl="0" target="${document.getElementById('target3').value}" />
        <exportkey number="4" page="0" region="0" activation="1" tfl="0" dtl="0" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="00000000-0000-0000-0000-000000000000" ColourIndexOverride="0" dl="0" target="${document.getElementById('target4').value}" />
        <exportkey number="5" page="0" region="0" activation="1" tfl="0" dtl="0" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="00000000-0000-0000-0000-000000000000" ColourIndexOverride="0" dl="0" target="${document.getElementById('target5').value}" />
        <exportkey number="6" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="00000000-0000-0000-0000-000000000000" ColourIndexOverride="0" dl="0" target="${document.getElementById('target6').value}" />
        <exportkey number="7" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="00000000-0000-0000-0000-000000000000" ColourIndexOverride="0" dl="0" target="${document.getElementById('target7').value}" />
        <exportkey number="8" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="00000000-0000-0000-0000-000000000000" ColourIndexOverride="0" dl="0" target="${document.getElementById('target8').value}" />
        <exportkey number="9" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="00000000-0000-0000-0000-000000000000" ColourIndexOverride="0" dl="0" target="${document.getElementById('target9').value}" />
        <exportkey number="10" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="00000000-0000-0000-0000-000000000000" ColourIndexOverride="0" dl="0" target="${document.getElementById('target10').value}" />
        <exportkey number="11" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="00000000-0000-0000-0000-000000000000" ColourIndexOverride="0" dl="0" target="${document.getElementById('target11').value}" />

        </keys>
    <BinauralEntities>
        <!-- Additional BinauralEntity entries can go here -->
    </BinauralEntities>
</ExportKeySet>`;

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
    fetch('targets.json')
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