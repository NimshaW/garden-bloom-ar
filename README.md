# Garden Bloom AR

Garden Bloom AR is an interactive, marker-based augmented reality garden built with **A-Frame**, **AR.js**, HTML, CSS and JavaScript. The garden appears when the camera detects a **Hiro marker**.

## Interactive Activities

- **Flower Bloom:** Tap the flower bud to open or close its petals.
- **Rain & Plant Growth:** Tap the cloud to make it rain and grow a plant.
- **Firefly Glow:** Tap the firefly to change its colour.

The scene also includes an animated 3D butterfly, other moving garden objects, and a status message that changes when the marker is found or lost.

## How to Use

1. Open the **GitHub Pages website** on a phone or computer with a camera.
2. Select **Start Garden AR + Camera** and allow camera access.
3. Point the camera at a printed Hiro marker or one displayed on another screen.
4. Tap the objects or use the on-screen buttons to try the three activities.

**If the camera does not open or the marker is not detected, refresh the page and try again.** Also check camera permission, make sure the full marker is visible in good lighting, and close other apps using the camera.

## Main Project Files

- `index.html` — main AR application
- `styles.css` — page styling
- `js/` — camera handling, marker detection and interactions
- `models/` — butterfly 3D model
- `markers/` — Hiro marker resources
- `vendor/` — A-Frame, AR.js and camera calibration resources

## Credits

- **Butterfly model:** Original 3D model created for this project.
- **A-Frame:** [aframe.io](https://aframe.io/)
- **AR.js:** [AR.js on GitHub](https://github.com/AR-js-org/AR.js)
- **Hiro marker:** Standard marker used with AR.js.

This project was developed as a university group assignment and hosted using GitHub Pages.
