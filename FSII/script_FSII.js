function populateDropdowns(data) {
    console.log('Populating target dropdowns with data:', data); // Debugging
    const targetIds = ['target0', 'target1', 'target2', 'target3', 'target4'];
    targetIds.forEach((targetId, index) => {
        const select = document.getElementById(targetId);
        if (!select) {
            console.error(`Dropdown with ID ${targetId} not found.`);
            return;
        }
        select.innerHTML = '';
        data.targets.forEach(target => {
            const option = document.createElement('option');
            option.value = target.value;
            option.textContent = target.label;
            select.appendChild(option);
        });

        // Add event listener to update activation label on target change
        select.addEventListener('change', () => updateActivationLabel(index, select));
    });
}

function updateActivationLabel(index, select) {
    const selectedText = select.options[select.selectedIndex].textContent; // Get the selected target label
    const activationLabel = document.getElementById(`activationLabel${index}`); // Label for activation

    if (activationLabel) {
        activationLabel.textContent = selectedText; // Update activation label to match target
    } else {
        console.error(`Activation label with ID activationLabel${index} not found.`);
    }
}

// Example of populateActivationDropdowns for setting up initial dropdowns (for context)
function populateActivationDropdowns(data) {
    console.log('Initializing activation dropdowns with data:', data); // Debugging
    const activationIDs = ['activation0', 'activation1', 'activation2', 'activation3', 'activation4'];
    activationIDs.forEach((activationID, index) => {
        const select = document.getElementById(activationID);
        if (!select) {
            console.error(`Dropdown with ID ${activationID} not found.`);
            return;
        }

        select.innerHTML = ''; // Clear existing options
        data.activation.forEach(activation => {
            const option = document.createElement('option');
            option.value = `${activation.activation},${activation.tfl},${activation.dtl}`;
            option.textContent = activation.label;
            select.appendChild(option);
        });

        // Set the activation label text to blank initially
        const activationLabel = document.createElement('span');
        activationLabel.id = `activationLabel${index}`;
        activationLabel.textContent = ''; // Blank label on load
        select.insertAdjacentElement('beforebegin', activationLabel); // Place the label before the dropdown
    });
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
    const targetIds = ['target0', 'target1', 'target2', 'target3', 'target4'];
    const activationIDs = ['activation0', 'activation1', 'activation2', 'activation3', 'activation4'];

    if (exportKeys.length > 0) {
        for (let i = 0; i < exportKeys.length && i < targetIds.length; i++) {
            const targetValue = exportKeys[i].getAttribute("target");
            const targetSelect = document.getElementById(targetIds[i]);
            if (targetSelect) {
                targetSelect.value = targetValue;
                updateActivationLabel(i, targetSelect); // Update activation label based on target value
            }
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
                const activationSelect = document.getElementById(activationIDs[i]);
                if (activationSelect) {
                    activationSelect.value = `${matchingActivation.activation},${matchingActivation.tfl},${matchingActivation.dtl}`; // Set to the composite value
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

    const response = await fetch('FSII_template.xml');
    const xmlTemplate = await response.text();

    // Collect values from target dropdowns
    const targetValues = [
        document.getElementById('target0').value,
        document.getElementById('target1').value,
        document.getElementById('target2').value,
        document.getElementById('target3').value,
        document.getElementById('target4').value
    ];

    // Collect values from activation dropdowns
    const activationValues = [];
    for (let i = 0; i < 5; i++) {
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


// default is 
let targets;
// Function to set the variable based on the URL parameter
function setVariableFromUrl() {
    const series = getUrlParameter('series'); 
    if (series) {
        console.log("Series: " + series +" selected.")
        targets = '../targets' + series +".json"
    }
    else{
        targets = '../targetsDEMO.json' 
    }
}

window.onload = function() {
    setVariableFromUrl()
    let targetsData, activationData;
    // Fetch targets.json
    fetch(targets)
        .then(response => {
            if (!response.ok) throw new Error('Cannot load targets.json');
            return response.json();
        })
        .then(data => {
            targetsData = data;
            populateDropdowns(data);
            console.log('Targets data loaded:', targetsData); // Debugging statement
        })
        .catch(error => console.error('Error fetching targets:', error));

    // Fetch activation.json
    fetch('../activation.json')
        .then(response => {
            if (!response.ok) throw new Error('Cannot load activation.json');
            return response.json();
        })
        .then(data => {
            activationData = data;
            populateActivationDropdowns(data);
            console.log('Activation data loaded:', activationData); // Debugging statement
        })
        .catch(error => console.error('Error fetching activations:', error));

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

