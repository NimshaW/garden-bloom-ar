# Garden Bloom AR

**Interactive marker-based augmented reality garden**  
Technologies: HTML, CSS, JavaScript, A-Frame 1.6.0, AR.js 3.4.7, glTF/GLB  
Marker: Hiro

## Project overview

Garden Bloom AR places a small animated garden on a Hiro marker viewed through a webcam or smartphone camera. The scene includes a garden platform, decorative plants, an animated butterfly model, and three interactive activities:

| Activity | Interaction | Main animation |
|---|---|---|
| Flower Bloom | Tap the flower bud to open or close its petals | Petal rotation |
| Rain & Growth | Tap the cloud to trigger rainfall and grow a plant | Droplet position and plant scale |
| Firefly Glow | Tap the glowing ball to change its colour | Colour, pulse and continuous motion |

The garden contains multiple A-Frame geometric primitives, 3D text labels, a glTF model and a marker status banner. The banner responds to `markerFound` and `markerLost` events.

## Running the project on Windows

1. Extract the project and open the **`GardenBloom-AR`** folder in Visual Studio Code.
2. Run **`DOWNLOAD-AR-LIBRARIES.bat`** while connected to the internet. Confirm that it displays `SUCCESS: All 4 AR files ready`.
3. Install VS Code's **Live Server** extension if necessary.
4. Open `index.html` with **Open with Live Server**.
5. In Chrome or Edge, select **Start Garden AR + Camera**, then allow access to the camera.
6. Print the Hiro marker from `markers/print-hiro.html`, or show it on another screen, and point the camera at it.
7. Touch the flower, cloud and firefly, or use the on-screen buttons.

Local browser URLs beginning with `http://127.0.0.1` or `http://localhost` work for camera permissions. Opening the HTML file directly using `file:///` is not recommended.

### Files needed for deployment

The downloader saves these files locally. **Include all four in the public GitHub repository and any deployed website**; they are not included in the initial ZIP:

- `vendor/aframe.min.js`
- `vendor/aframe-ar.js`
- `vendor/camera_para.dat`
- `markers/pattern-hiro.patt`

The site also requires `models/butterfly.glb`, `styles.css`, `index.html` and the `js/` directory. Do not upload only `index.html`.

## Publishing and testing

1. After running the downloader, upload the **contents** of `GardenBloom-AR` to a **public GitHub repository**, keeping `index.html` in the repository root.
2. Enable GitHub Pages under **Settings → Pages**, deploying from the main branch and root folder. Open the resulting `https://` URL.
3. On a phone, open that HTTPS URL, allow camera access and scan a printed Hiro marker (or a marker on another display).
4. Confirm marker found/lost messages and test all three activities. A live phone test must be completed by the project group; automated source tests do not substitute for it.
5. As required by the assignment brief, put the **public GitHub repository URL** in a Word document, name it using the **group number**, and submit one copy per group.

## Implementation notes

- `index.html`: user interface and A-Frame scene markup, including primitive geometry, label and animation attributes.
- `js/garden.js`: custom bloom, water and colour-change components; marker event handler.
- `js/camera.js`: user-triggered camera start, marker-tracking setup, status and diagnostics.
- `js/load-libraries.js`: loads A-Frame and AR.js once, checking marker and calibration assets.
- `models/butterfly.glb`: original butterfly model for the garden.
- `markers/`: marker artwork, printable page and downloaded pattern file.
- `camera-test.html`: standalone camera permission and webcam diagnostic page.
- `preview.html`: optional 3D preview without marker tracking.
- `tests/`: source checks and library loader regression tests.

The AR camera is managed by AR.js. The app shows the same stream behind its transparent 3D scene rather than requesting a second camera. `videoTexture` is disabled to allow normal Hiro marker tracking.

## Credits and licences

- **Butterfly GLB model:** original geometric model created programmatically for the Garden Bloom AR project using the open-source `trimesh` library; no external butterfly model was downloaded. The model may be included in the group's coursework submission. The GLB's `asset.generator` metadata identifies `trimesh`.
- **A-Frame:** [aframe.io](https://aframe.io/) (third-party framework; review its licence at the source repository).
- **AR.js:** [AR-js-org/AR.js](https://github.com/AR-js-org/AR.js) (third-party marker-tracking library; review its licence at the source repository).
- **Hiro marker:** standard marker reference used by the AR.js marker-tracking examples. The pattern file is downloaded from the AR.js project.

The framework files remain governed by their respective third-party licences; they are not original project code.

## Troubleshooting

- **Start button disabled:** run `DOWNLOAD-AR-LIBRARIES.bat` and reload the page. Review Chrome DevTools Console for missing resources.
- **Camera test works but AR does not:** close other pages or applications using the webcam; check browser permission and select **Camera details**.
- **Camera visible but no 3D garden:** show the complete Hiro marker, with good lighting, and check that the downloaded `.patt` and `.dat` files exist.
- **Phone camera blocked:** use a hosted HTTPS URL, not a LAN HTTP IP address.
- **Blank preview:** check that A-Frame loaded and the `.glb` model is available.

**Validation:** Source and unit tests can verify project structure and script loading rules. Successful marker tracking and on-device interaction must be checked manually on the target hardware.
