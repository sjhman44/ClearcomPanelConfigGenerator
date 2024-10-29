// Function to decode and retrieve data from the URL parameter
function getDataFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
        // Decode the base64 encoded data
        const decodedData = decodeURIComponent(escape(atob(dataParam)));
        return JSON.parse(decodedData);
    }
    return null;
}

// Function to populate target dropdowns based on JSON data
async function populateDropdowns(data) {
    const targetIds = ['target0', 'target1', 'target2', 'target3', 'target4', 'target5', 'target6', 'target7', 'target8'];
    targetIds.forEach(targetId => {
        const select = document.getElementById(targetId);
        if (!select) {
            console.error(`Dropdown with ID ${targetId} not found.`);
            return;
        }
        
        select.innerHTML = ''; // Clear existing options
        data.targets.forEach(target => {
            const option = document.createElement('option');
            option.value = target.value;
            option.textContent = target.label;
            select.appendChild(option);
        });

        // Add change event listener to update activation labels
        select.addEventListener('change', () => updateActivationLabel(targetIds.indexOf(targetId)));
    });
}

// Function to populate activation dropdowns
async function populateActivationDropdowns(data) {
    if (!data || !data.activation) {
        console.error("Activation data is missing.");
        return;
    }

    const activationIDs = ['activation0', 'activation1', 'activation2', 'activation3', 'activation4', 'activation5', 'activation6', 'activation7', 'activation8'];
    activationIDs.forEach(activationID => {
        const select = document.getElementById(activationID);
        if (!select) {
            console.error(`Dropdown with ID ${activationID} not found.`);
            return;
        }

        select.innerHTML = ''; // Clear existing options
        data.activation.forEach(activation => {
            const option = document.createElement('option');
            option.value = `${activation.activation},${activation.tfl},${activation.dtl}`; // Composite value
            option.textContent = activation.label; // Display the label

            // Store activation, tfl, and dtl in data attributes
            option.dataset.activation = activation.activation; 
            option.dataset.tfl = activation.tfl; 
            option.dataset.dtl = activation.dtl; 

            select.appendChild(option);
        });
    });
}


function updateActivationLabel(targetIndex) {
    const targetSelect = document.getElementById(`target${targetIndex}`);
    const selectedOption = targetSelect.options[targetSelect.selectedIndex];
    const activationLabel = document.getElementById(`labelActivation${targetIndex}`);
    
    if (activationLabel && selectedOption) {
        activationLabel.textContent = selectedOption.textContent; // Update label
    }
}

// Function to load and parse XML file
async function loadFile(event, targetsData, activationData) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "text/xml");

        // Check for parsing errors
        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
            console.error("Parsing Error:", parseError[0].textContent);
            return;
        }

        // Populate fields from the XML
        populateFieldsFromXML(xmlDoc, targetsData, activationData);

        // Populate dropdowns again to ensure they reflect current data
        populateDropdowns(targetsData);  // Ensure dropdowns are updated
        populateActivationDropdowns(activationData);  // Ensure activation dropdowns are updated

        const fileNameInput = document.getElementById('fileName');
        const baseFileName = file.name.replace(/(_\d{4}-\d{2}-\d{2})?\.ccl$/, '');
        fileNameInput.value = baseFileName; // Update filename input
    };
    reader.readAsText(file);
}

// Populate fields from XML content
function populateFieldsFromXML(xmlDoc, targetsData, activationData) {
    const exportKeys = xmlDoc.getElementsByTagName("exportkey");
    const targetIds = ['target0', 'target1', 'target2', 'target3', 'target4', 'target5', 'target6', 'target7', 'target8'];
    const activationIDs = ['activation0', 'activation1', 'activation2', 'activation3', 'activation4', 'activation5', 'activation6', 'activation7', 'activation8'];

    if (exportKeys.length > 0) {
        for (let i = 0; i < exportKeys.length && i < targetIds.length; i++) {
            const targetValue = exportKeys[i].getAttribute("target");
            const select = document.getElementById(targetIds[i]);
            if (select) select.value = targetValue; // Set target value
        }

        for (let i = 0; i < exportKeys.length && i < activationIDs.length; i++) {
            const activation = exportKeys[i].getAttribute("activation");
            const tfl = exportKeys[i].getAttribute("tfl");
            const dtl = exportKeys[i].getAttribute("dtl");

            // Check for a match in activation data
            const matchingActivation = activationData.activation.find(item => 
                item.activation === activation && item.tfl === tfl && item.dtl === dtl
            );

            if (matchingActivation) {
                const select = document.getElementById(activationIDs[i]);
                if (select) {
                    select.value = `${matchingActivation.activation},${matchingActivation.tfl},${matchingActivation.dtl}`; // Set composite value
                    updateActivationLabel(i); // Update label
                }
            } else {
                console.error(`No matching activation found for activation: ${activation}, tfl: ${tfl}, dtl: ${dtl}`);
            }
        }

        const fileNameInput = document.getElementById('fileName');
        const panelName = xmlDoc.querySelector("ExportKeySet")?.getAttribute("panel");
        fileNameInput.value = panelName || "output"; // Set filename input
    } else {
        console.warn('No export keys found in XML.');
        populateDropdowns(targetsData); // Populate dropdowns if no keys
        populateActivationDropdowns(activationData);
    }
}

// Generate XML based on template
async function generateXML() {
    const fileName = document.getElementById('fileName').value || 'output';
    const today = new Date().toISOString().split('T')[0];
    const xmlFileName = `${fileName}_${today}.ccl`;

    const response = await fetch('FSE_template.xml');
    const xmlTemplate = await response.text();

    // Collect values from target dropdowns
    const targetValues = [
        document.getElementById('target0').value,
        document.getElementById('target1').value,
        document.getElementById('target2').value,
        document.getElementById('target3').value,
        document.getElementById('target4').value,
        document.getElementById('target5').value,
        document.getElementById('target6').value,
        document.getElementById('target7').value,
        document.getElementById('target8').value
    ];

    // Collect values from activation dropdowns
    const activationValues = [];
    for (let i = 0; i < 9; i++) {
        const activationSelect = document.getElementById(`activation${i}`);
        const selectedOption = activationSelect.options[activationSelect.selectedIndex];

        // Add the individual values of activation, tfl, and dtl from the selected option
        activationValues.push({
            activation: selectedOption.dataset.activation,
            tfl: selectedOption.dataset.tfl,
            dtl: selectedOption.dataset.dtl
        });
    }

    // Replace placeholders in the template XML
    let xmlContent = xmlTemplate;
    targetValues.forEach((value, index) => {
        xmlContent = xmlContent.replace(`{target${index}}`, value);
    });
    activationValues.forEach((activation, index) => {
        xmlContent = xmlContent
            .replace(`{activation${index}}`, activation.activation)
            .replace(`{tfl${index}}`, activation.tfl)
            .replace(`{dtl${index}}`, activation.dtl);
    });

    // Create a Blob and download link for the XML
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
    downloadLink.download = xmlFileName;
    downloadLink.style.display = 'block';
    downloadLink.textContent = 'Download File';
}

window.onload = async function() {
    const urlData = getDataFromUrl(); // Get data from URL

    if (urlData) {
        console.log('URL Data Loaded:', urlData); // Debugging statement
        // Use urlData to populate dropdowns
        await populateDropdowns(urlData);
        await populateActivationDropdowns(urlData);
    } else {
        console.warn('No URL Data found. Loading Demo File');
        const demoData = await fetch('../targetsDEMO.json').then(res => res.json());
        await populateDropdowns(demoData);
        await populateActivationDropdowns(demoData);
    }

    // Fetch and populate activation data if not already populated by URL data
    if (!urlData || !urlData.activation) {
        const activationData = await fetch('../activation.json').then(res => res.json());
        await populateActivationDropdowns(activationData);
    }
};
