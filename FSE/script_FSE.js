//FSE Beltpack has 9 targets. Number 4 is the Reply Key
const targetIds = ['target0', 'target1', 'target2', 'target3', 'target4', 'target5', 'target6', 'target7', 'target8'];
const activationIDs = ['activation0', 'activation1', 'activation2', 'activation3', 'activation4', 'activation5', 'activation6', 'activation7', 'activation8'];

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
        populateDropdowns(targetsData,targetIds);
        populateActivationDropdowns(activationData,activationIDs);
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

window.onload = async function() {
    const targetsData = await getDataFromUrl(); // Await the target data
    const activationData = await getActivationData('../activation.json'); // Await the activation data

    if (targetsData) {
        populateDropdowns(targetsData,targetIds);
    } else {
        console.warn('Targets data is not available.');
    }

    if (activationData) {
        populateActivationDropdowns(activationData,activationIDs);
    } else {
        console.warn('Activation data is not available.');
    }

    // File upload event listener
    const fileUpload = document.getElementById('fileUpload');
    fileUpload.addEventListener('change', function(event) {
        if (targetsData && activationData) {
            loadCCLFile(event, targetsData, activationData);
        } else {
            console.warn('Targets data or activation data is not yet available.'); // Warn if data is missing
        }
    });
};

