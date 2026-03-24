# Dino Run - Hand Gesture Edition (Web Version)

A browser-based clone of the classic Chrome Dinosaur Game, controllable via webcam using hand gestures! Pinch your fingers to jump over obstacles in a fully client-side static web application. 

This project was originally written in Python + Pygame + OpenCV and has been entirely ported to HTML5 Canvas and JavaScript, leveraging MediaPipe Hands for gesture recognition.

## Features
- **Pixel-Perfect Rendering:** Uses original up-scaled sprites and dynamic down-sampling.
- **Hand Gesture Control:** Uses `@mediapipe/hands` to track your hand securely in the browser. Crossed thumb and index finger triggers a pinch/jump!
- **Variable Jump Physics:** Hold your pinch (or spacebar) longer for a higher jump boost.
- **Progressive Difficulty:** Speed increases as your score goes up.
- **Day/Night Cycle:** Background visually transitions every 300 points.
- **Zero Backend:** Runs entirely in your browser without any server processing. Privacy friendly!

## How to Play
1. **Host the Game locally:** Serve the directory using an HTTP server. For example: `npx http-server` or `python -m http.server`.
2. **Access via Browser:** Open `index.html` (e.g. `http://127.0.0.1:8080`).
3. **Allow Webcam Access:** The browser will prompt for camera access. Allow it for gesture features.
4. **Controls:**
   - **Start Game:** Pinch your thumb and index finger in front of the camera, or press `SPACE` / `UP` arrows.
   - **Jump:** Pinch your fingers together.
   - **High Jump:** Hold the pinch longer.

## Deployment (GitHub Pages)
This web app acts as a perfectly configured static site layout and is ready to deploy natively via GitHub Pages without any build steps! 
1. Push this entire repository up to GitHub.
2. In your repository settings, navigate to the **Pages** section.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Set the branch to `main` and the root folder to `/ (root)`. 
5. Save, wait for the deployment build action, and enjoy your game!

*(Note: Because the MediaPipe framework requires access to the `navigator.mediaDevices` API, your deployed game must be served over `HTTPS` — which GitHub Pages handles automatically.)*
