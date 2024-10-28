function populateDropdowns(data) {
    const targetIds = ['target0', 'target1', 'target2', 'target3', 'target4'];
    targetIds.forEach(targetId => {
        const select = document.getElementById(targetId);
        select.innerHTML = '';
        data.targets.forEach(target => {
            const option = document.createElement('option');
            option.value = target.value;
            option.textContent = target.label;
            select.appendChild(option);
        });
    });
}

function populateActivationDropdowns(data) {
    const activationIDs = ['activation0', 'activation1', 'activation2', 'activation3', 'activation4'];
    
    activationIDs.forEach(activationID => {
        const select = document.getElementById(activationID);
        select.innerHTML = '';

        data.activation.forEach((activation) => {
            const option = document.createElement('option');
            
            // Set the option's value to a unique identifier and display the label
            option.value = `${activation.activation}-${activation.tfl}-${activation.dtl}`;
            option.textContent = activation.label; // Display the label
            
            // Debug log: check if the values are being set correctly
            console.log("Adding option:", activation.label, "with value:", option.value);

            // Store individual values in data attributes for easy access later
            option.dataset.activation = activation.activation;
            option.dataset.tfl = activation.tfl;
            option.dataset.dtl = activation.dtl;

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
        const xmlDoc = parser.parseFromString(content, "text/xml");

        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
            console.error("Parsing Error:", parseError[0].textContent);
            return;
        }

        populateFieldsFromXML(xmlDoc, targetsData);

        const fileNameInput = document.getElementById('fileName');
        const baseFileName = file.name.replace(/(_\d{4}-\d{2}-\d{2})?\.ccl$/, '');
        fileNameInput.value = baseFileName;
    };
    reader.readAsText(file);
}

function populateFieldsFromXML(xmlDoc, targetsData) {
    const exportKeys = xmlDoc.getElementsByTagName("exportkey");
    const targetIds = ['target0', 'target1', 'target2', 'target3', 'target4'];
    const activationIDs = ['activation0', 'activation1', 'activation2', 'activation3', 'activation4'];

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
            const combinedValue = `activation="${activation}" tfl="${tfl}" dtl="${dtl}"`;

            const select = document.getElementById(activationIDs[i]);
            if (select) select.value = combinedValue;
        }

        const fileNameInput = document.getElementById('fileName');
        const panelName = xmlDoc.querySelector("ExportKeySet")?.getAttribute("panel");
        fileNameInput.value = panelName || "output";
    } else {
        populateDropdowns(targetsData);
        populateActivationDropdowns(targetsData);
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



window.onload = function() {
    fetch('../targets.json')
        .then(response => {
            if (!response.ok) throw new Error('Cannot load targets.json');
            return response.json();
        })
        .then(data => {
            populateDropdowns(data);
            const fileUpload = document.getElementById('fileUpload');
            fileUpload.addEventListener('change', function(event) {
                loadFile(event, data);
            });
        })
        .catch(error => console.error('Error fetching targets:', error));

    fetch('../activation.json')
        .then(response => {
            if (!response.ok) throw new Error('Cannot load activation.json');
            return response.json();
        })
        .then(data => {
            populateActivationDropdowns(data);
        })
        .catch(error => console.error('Error fetching activations:', error));
};
