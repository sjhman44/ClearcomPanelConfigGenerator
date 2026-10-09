# Clear-Com EHX Panel Configurator

One page for building key configs for the VPanel (12-channel rack panel), the FSII beltpack (4-channel) and the FSE beltpack (8-channel). All panels are drawn in code, so there are no image files.

## Folder layout

    index.html            the page
    css/styles.css        styling
    js/app.js             all logic and panel drawings
    data/targetsDEMO.json      placeholder partylines
    data/targets.json          optional: your own list, used instead of the demo

## Partylines

Click "Choose File" on the page and upload your matrix partyline JSON, in this shape:

    {"targets":[{"value":"CNF.0.3","label":"Audio"}]}

It is saved in your browser only. Or put the same file at `data/targets.json`.

You can also build the list on the page: click "Edit list", then add rows, add a range (for example CNF.0.1 to CNF.0.12), or paste a list. Targets are not limited to partylines: use whatever ID EHX writes, such as GRP.0.1 for a group. "Download JSON" saves the list in the shape above.

## Run locally

    python3 -m http.server 8000

Then open http://localhost:8000
Opening index.html by double-clicking will not load the partyline files.

## File format

Files follow real EHX exports: `ExportKeySets` > `keysets` > one `keyset` per panel, UTF-16.
Supported panel types: `V1RURotary` (VPanel, 12 channels, pages 0 to 8), `FreeSpeakIIBeltpack` (keys 0 to 4), `FreeSpeakEdgeBeltpack` (keys 0 to 8).
VPanel keys: knob = listen (activation 2), lever = talk (activation 1). Top row listen keys are 0 to 5 and talk keys 6 to 11; bottom row 12 to 17 and 18 to 23.
A blank VPanel has REPLY1 on channel 7 of every page, and a blank FSE has REPLY1 on key 4, as in EHX.

Importing a file and downloading it again without changes gives back the same bytes. A `BinauralEntities` block in an imported file is kept as is.

## Combined export (Advanced)

Advanced > Combined export writes several panels' key sets into one file, one `keyset` per panel.
