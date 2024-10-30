function populateDropdowns(data) {
    const targetIds = ['target0', 'target1', 'target2', 'target3', 'target4', 'target5', 'target6', 'target7', 'target8'];
    targetIds.forEach(targetId => {
        const select = document.getElementById(targetId);
        if (!select) {
            console.error(`Dropdown with ID ${targetId} not found.`);
            return; // Exit if the dropdown isn't found
        }
        select.innerHTML = '';
        data.targets.forEach(target => {
            const option = document.createElement('option');
            option.value = target.value;
            option.textContent = target.label;
            select.appendChild(option);
        });

        // Add change event listener for each target dropdown to update activation labels
        select.addEventListener('change', () => updateActivationLabel(targetIds.indexOf(targetId)));
    });
}

function populateActivationDropdowns(data) {
    const activationIDs = ['activation0', 'activation1', 'activation2', 'activation3', 'activation4', 'activation5', 'activation6', 'activation7', 'activation8'];

    activationIDs.forEach(activationID => {
        const select = document.getElementById(activationID);
        if (!select) {
            console.error(`Dropdown with ID ${activationID} not found.`);
            return; // Exit if the dropdown isn't found
        }

        select.innerHTML = ''; // Clear existing options

        data.activation.forEach(activation => {
            const option = document.createElement('option');
            option.value = `${activation.activation},${activation.tfl},${activation.dtl}`; // Create a composite value
            option.textContent = activation.label; // Display the label

            // Store activation, tfl, and dtl in data attributes
            option.dataset.activation = activation.activation; // Capture activation
            option.dataset.tfl = activation.tfl; // Capture tfl
            option.dataset.dtl = activation.dtl; // Capture dtl

            select.appendChild(option);
        });
    });
}

function updateActivationLabel(targetIndex) {
    const targetSelect = document.getElementById(`target${targetIndex}`);
    const selectedOption = targetSelect.options[targetSelect.selectedIndex];
    const activationLabel = document.getElementById(`labelActivation${targetIndex}`);
    
    if (activationLabel && selectedOption) {
        activationLabel.textContent = `${selectedOption.textContent}`; // Update label
    }
}

function loadFile(event, targetsData, activationData) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "text/xml");

        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
            console.error("Parsing Error:", parseError[0].textContent);
            return;
        }

        // Call populateFieldsFromXML and check its logic
        populateFieldsFromXML(xmlDoc, targetsData, activationData);

        const fileNameInput = document.getElementById('fileName');
        const baseFileName = file.name.replace(/(_\d{4}-\d{2}-\d{2})?\.ccl$/, '');
        fileNameInput.value = baseFileName;
    };
    reader.readAsText(file);
}

function populateFieldsFromXML(xmlDoc, targetsData, activationData) {
    const exportKeys = xmlDoc.getElementsByTagName("exportkey");
    const targetIds = ['target0', 'target1', 'target2', 'target3', 'target4', 'target5', 'target6', 'target7', 'target8'];
    const activationIDs = ['activation0', 'activation1', 'activation2', 'activation3', 'activation4', 'activation5', 'activation6', 'activation7', 'activation8'];

    if (exportKeys.length > 0) {
        for (let i = 0; i < exportKeys.length && i < targetIds.length; i++) {
            const targetValue = exportKeys[i].getAttribute("target");
            const select = document.getElementById(targetIds[i]);
            if (select) select.value = targetValue;
        }

        for (let i = 0; i < exportKeys.length && i < activationIDs.length; i++) {
            const activation = exportKeys[i].getAttribute("activation");
            const tfl = exportKeys[i].getAttribute("tfl");
            const dtl = exportKeys[i].getAttribute("dtl");

            console.log(`Checking activation: ${activation}, tfl: ${tfl}, dtl: ${dtl}`); // Debugging statement

            // Check for a match in activation data
            const matchingActivation = activationData.activation.find(item => 
                item.activation === activation && item.tfl === tfl && item.dtl === dtl
            );

            if (matchingActivation) {
                const select = document.getElementById(activationIDs[i]);
                if (select) {
                    select.value = `${matchingActivation.activation},${matchingActivation.tfl},${matchingActivation.dtl}`; // Set to the composite value
                    updateActivationLabel(i); // Call to update the label after setting the dropdown value
                }
            } else {
                console.error(`No matching activation found for activation: ${activation}, tfl: ${tfl}, dtl: ${dtl}`);
            }
        }

        const fileNameInput = document.getElementById('fileName');
        const panelName = xmlDoc.querySelector("ExportKeySet")?.getAttribute("panel");
        fileNameInput.value = panelName || "output";
    } else {
        console.warn('No export keys found in XML.');
        populateDropdowns(targetsData);
        populateActivationDropdowns(activationData);
    }
}

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


// Function to get URL parameters
function getUrlParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}


async function getDataFromUrl() {
    // Check the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    const localStorageData = localStorage.getItem('storedJsonData');
    if (dataParam) {
        // Decode the base64 encoded data
        const decodedData = decodeURIComponent(escape(atob(dataParam)));
        const jsonData = JSON.parse(decodedData);
        // Store the parsed JSON data in local storage for future use
        localStorage.setItem('storedJsonData', JSON.stringify(jsonData));

         // Redirect to the base URL without data
         const baseUrl = window.location.origin + window.location.pathname;
         window.history.replaceState({}, document.title, baseUrl);
        return jsonData; // Return the parsed data
    }
    else if (localStorageData){
        // Check if JSON data is in local storage
        return JSON.parse(localStorageData); // Load from local storage if available
    } 
    else {
        // Fetch targets.json if no data is found
        try {
            const response = await fetch("../targetsDEMO.json");
            if (!response.ok) throw new Error('Cannot load targets.json');
            const data = await response.json();
            // Store fetched data in local storage
            localStorage.setItem('storedJsonData', JSON.stringify(data));
            return data; // Return the fetched data
        } catch (error) {
            console.error('Error fetching targets:', error);
            return null; // Handle error and return null
        }
    }
}




async function getActivationData() {
    try {
        const response = await fetch('../activation.json');
        if (!response.ok) throw new Error('Cannot load activation.json');
        return await response.json(); // Return the JSON data
    } catch (error) {
        console.error('Error fetching activation data:', error);
        return null; // Return null or handle it appropriately
    }
}


window.onload = async function() {
    const targetsData = await getDataFromUrl(); // Await the target data
    const activationData = await getActivationData(); // Await the activation data

    if (targetsData) {
        populateDropdowns(targetsData);
    } else {
        console.warn('Targets data is not available.');
    }

    if (activationData) {
        populateActivationDropdowns(activationData);
    } else {
        console.warn('Activation data is not available.');
    }

    // File upload event listener
    const fileUpload = document.getElementById('fileUpload');
    fileUpload.addEventListener('change', function(event) {
        if (targetsData && activationData) {
            loadFile(event, targetsData, activationData);
        } else {
            console.warn('Targets data or activation data is not yet available.'); // Warn if data is missing
        }
    });
};

