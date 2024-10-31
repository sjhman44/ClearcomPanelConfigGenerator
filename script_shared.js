//Partylines file upload
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


//.CCL FILE UPLOAD //REFACTORED
function loadCCLFile(event, targetsData, activationData,targetIds,activationIDs) {
    console.log("DEBUG: loadCCLFile()")
    let baseFileName;
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

        // Call populateFieldsFromCCL and check its logic
        populateFieldsFromCCL(xmlDoc, targetsData, activationData,targetIds,activationIDs);

        const fileNameInput = document.getElementById('fileName');
        baseFileName = file.name.replace(/(_\d{4}-\d{2}-\d{2})?\.ccl$/, '');
        fileNameInput.value = baseFileName;
    };
    reader.readAsText(file);
    return baseFileName;
}



// DATA HANDLING

// Function to redirect to URL without data parameter

// Function to get URL parameters
function getUrlParameter(param) {
    console.log("DEBUG: getUrlParameter")
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function redirectWithoutData() {
    const baseUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, baseUrl); // Update the address bar without reloading
}

async function getDataFromUrl() {
    console.log("DEBUG: getDataFromURL()")
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



// CLEARCOM FUNCTIONS
//'../activation.json'
async function getActivationData(data) {
    console.log("debug: getActivationData()")
    try {
        const response = await fetch(data);
        if (!response.ok) throw new Error('Cannot load activation.json');
        return await response.json(); // Return the JSON data
    } catch (error) {
        console.error('Error fetching activation data:', error);
        return null; // Return null or handle it appropriately
    }
}

//Refactored
function updateActivationLabel(targetIndex) {
    console.log("debug: updateActivationLabel()")
    const targetSelect = document.getElementById(`target${targetIndex}`);
    const selectedOption = targetSelect.options[targetSelect.selectedIndex];
    const activationLabel = document.getElementById(`labelActivation${targetIndex}`);
    
    if (activationLabel && selectedOption) {
        activationLabel.textContent = `${selectedOption.textContent}`; // Update label
    }
}

//EdgeRole
async function generateCCL(targets = [], activations = [],panelType,panelName,template) {
    console.log("DEBUG: generateCCL()")
    const fileName = document.getElementById('fileName').value || 'output';
    const today = new Date().toISOString().split('T')[0];
    const xmlFileName = `${fileName}_${today}.ccl`;

    const response = await fetch(template);
    const xmlTemplate = await response.text();

    // Collect values from the provided target array
    const targetValues = targets.map((targetId) => document.getElementById(targetId).value);

    // Collect values from the activation array
    const activationValues = activations.map((activationId) => {
        const activationSelect = document.getElementById(activationId);
        const selectedOption = activationSelect.options[activationSelect.selectedIndex];
        
        // Add the individual values of activation, tfl, and dtl from the selected option
        return {
            activation: selectedOption.dataset.activation,
            tfl: selectedOption.dataset.tfl,
            dtl: selectedOption.dataset.dtl
        };
    });

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
    xmlContent = xmlContent.replace(`{panelType}`, panelType);
    xmlContent = xmlContent.replace(`{panelName}`, panelName);
    // Create a Blob and download link for the XML
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
    downloadLink.download = xmlFileName;
    downloadLink.style.display = 'block';
    downloadLink.textContent = 'Download File';
}







//REFACTORED
function populateFieldsFromCCL(xmlDoc, targetsData, activationData,targetIds,activationIDs) {
    console.log("DEBUG: populateFieldsFromCCL()")
    const exportKeys = xmlDoc.getElementsByTagName("exportkey");
   
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




//REFACTORED
function populateDropdowns(data,targetIds) {
    console.log("DEBUG: populateDropdowns()")
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

function populateActivationDropdowns(data,activationIDs) {
    console.log("DEBUG: populateActivationDropdowns()")
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

