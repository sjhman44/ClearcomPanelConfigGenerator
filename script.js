function populateDropdowns() {
    fetch('targets.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const targetIds = [
                'target0', 'target1', 'target2', 'target3',
                'target4', 'target5', 'target6', 'target7'
            ];

            // Populate each dropdown with the options from targets.json
            targetIds.forEach(targetId => {
                const select = document.getElementById(targetId);
                // Clear existing options (if any)
                select.innerHTML = '';
                // Add the new options
                data.targets.forEach(target => {
                    const option = document.createElement('option');
                    option.value = target.value; // The value to be used
                    option.textContent = target.label; // The label to display
                    select.appendChild(option);
                });
            });
        })
        .catch(error => console.error('Error fetching targets:', error));
}

function generateXML() {
    const fileName = document.getElementById('fileName').value || 'output';
    const today = new Date().toISOString().split('T')[0];
    const xmlFileName = `${fileName}_${today}.xml`;

    const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<ExportKeySet panel="PRT.1.614" panelType="EdgeRole" versionNo="3">
    <ShiftPages />
    <keys>
        <exportkey number="0" page="0" region="0" activation="1" tfl="0" dtl="0" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="${document.getElementById('target0').value}" ColourIndexOverride="0" dl="0" target="${document.getElementById('target0').value}" />
        <exportkey number="1" page="0" region="0" activation="2" tfl="0" dtl="0" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="${document.getElementById('target1').value}" ColourIndexOverride="0" dl="0" target="${document.getElementById('target1').value}" />
        <exportkey number="2" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="${document.getElementById('target2').value}" ColourIndexOverride="0" dl="0" target="${document.getElementById('target2').value}" />
        <exportkey number="3" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="${document.getElementById('target3').value}" ColourIndexOverride="0" dl="0" target="${document.getElementById('target3').value}" />
        <exportkey number="4" page="0" region="0" activation="1" tfl="0" dtl="0" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="${document.getElementById('target4').value}" ColourIndexOverride="0" dl="0" target="${document.getElementById('target4').value}" />
        <exportkey number="5" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="${document.getElementById('target5').value}" ColourIndexOverride="0" dl="0" target="${document.getElementById('target5').value}" />
        <exportkey number="6" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="${document.getElementById('target6').value}" ColourIndexOverride="0" dl="0" target="${document.getElementById('target6').value}" />
        <exportkey number="7" page="0" region="0" activation="0" tfl="0" dtl="1" localassign="1" interlockedgroup="0" levelcontrol="0" keygrouptarget="${document.getElementById('target7').value}" ColourIndexOverride="0" dl="0" target="${document.getElementById('target7').value}" />
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

// Call populateDropdowns when the page is loaded
window.onload = populateDropdowns;
