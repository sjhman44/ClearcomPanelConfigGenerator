//FSII Beltpack has 5 targets. Number 4 is the Reply Key
const targetIds = ['target0', 'target1', 'target2', 'target3', 'target4'];
const activationIDs = ['activation0', 'activation1', 'activation2', 'activation3', 'activation4'];
const panelType = 'FS2Role'
let panelName = 'FreespeakII'


// Function to handle the button click
function handleGenerateXMLButtonClick() {
    generateCCL(targetIds, activationIDs,panelType,panelName,'FSII_template.xml'); // Call generateXML with the arrays
}
// Add event listener to the button
document.getElementById('button-container').addEventListener('click', handleGenerateXMLButtonClick);

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
            panelName = loadCCLFile(event, targetsData, activationData,targetIds,activationIDs);
        } else {
            console.warn('Targets data or activation data is not yet available.'); // Warn if data is missing
        }
    });
};

