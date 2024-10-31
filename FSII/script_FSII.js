//FSII Beltpack has 5 targets. Number 4 is the Reply Key
const targetIds = ['target0', 'target1', 'target2', 'target3', 'target4'];
const activationIDs = ['activation0', 'activation1', 'activation2', 'activation3', 'activation4'];
const panelType = 'FS2Role'
const panelName = 'FreespeakII'

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



// default is 
let targets = '../targetsDEMO.json' 

window.onload = function() {
    
    let targetsData, activationData;
    // Fetch targets.json
    fetch(targets)
        .then(response => {
            if (!response.ok) throw new Error('Cannot load targets.json');
            return response.json();
        })
        .then(data => {
            targetsData = data;
            populateDropdowns(data,targetIds);
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
            populateActivationDropdowns(data,activationIDs);
            console.log('Activation data loaded:', activationData); // Debugging statement
        })
        .catch(error => console.error('Error fetching activations:', error));

    // File upload event listener
    const fileUpload = document.getElementById('fileUpload');
    fileUpload.addEventListener('change', function(event) {
        if (targetsData && activationData) {
            loadCCLFile(event, targetsData, activationData,targetIds,activationIDs);
        } else {
            console.warn('Targets data or activation data is not yet available.'); // Warn if data is missing
        }
    });
};

