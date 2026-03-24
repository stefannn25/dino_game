const PINCH_RATIO_THRESHOLD = 0.18;

export class GestureDetector {
    constructor(videoElement, canvasElement, labelElement) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.labelElement = labelElement;

        this.width = canvasElement.width;
        this.height = canvasElement.height;

        this.pinching = false;

        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.6
        });

        this.hands.onResults(this.onResults.bind(this));

        this.camera = new Camera(this.videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: this.videoElement });
            },
            width: 320,
            height: 240
        });
    }

    async start() {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err) {
            console.error("Camera access failed:", err);
            if (this.labelElement) {
                this.labelElement.innerText = "CAMERA ERROR/BLOCKED";
                this.labelElement.style.color = "red";
            }
        }
        this.camera.start();
    }

    isPinching() {
        return this.pinching;
    }

    onResults(results) {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.translate(this.width, 0);
        this.ctx.scale(-1, 1);

        this.ctx.drawImage(results.image, 0, 0, this.width, this.height);

        this.pinching = false;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const lms = results.multiHandLandmarks[0];

            drawConnectors(this.ctx, lms, HAND_CONNECTIONS, { color: '#c8c8c8', lineWidth: 1 });

            for (let i = 0; i < lms.length; i++) {
                const landmark = lms[i];
                const x = landmark.x * this.width;
                const y = landmark.y * this.height;
                const isTip = (i === 4 || i === 8);
                const color = isTip ? '#ffd200' : '#ffffff';

                this.ctx.beginPath();
                this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
                this.ctx.fillStyle = color;
                this.ctx.fill();
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = '#969696';
                this.ctx.stroke();
            }

            const px = (idx) => lms[idx].x * this.width;
            const py = (idx) => lms[idx].y * this.height;
            const dist = (i1, i2) => Math.hypot(px(i1) - px(i2), py(i1) - py(i2));

            const pinchDist = dist(4, 8);
            const handSize = dist(0, 9) + 1e-6; 
            const ratio = pinchDist / handSize;

            this.pinching = ratio < PINCH_RATIO_THRESHOLD;

            const cx_mirrored = (px(4) + px(8)) / 2;
            const cy = (py(4) + py(8)) / 2;

            const color = this.pinching ? '#50ff00' : '#ffa000'; 
            this.ctx.restore(); 
            this.ctx.save();

            const cx = this.width - cx_mirrored;

            this.ctx.beginPath();
            this.ctx.arc(cx, cy, 14, 0, 2 * Math.PI);
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = color;
            this.ctx.stroke();

            this.ctx.fillStyle = color;
            this.ctx.font = 'bold 14px sans-serif';
            const label = this.pinching ? 'PINCH!' : ratio.toFixed(2);
            this.ctx.fillText(label, cx + 16, cy + 6);
        } else {
            this.ctx.restore();
            this.ctx.save();
        }

        const statusColor = this.pinching ? '#3cc83c' : '#282828';
        this.ctx.fillStyle = statusColor;
        this.ctx.fillRect(0, 0, this.width, 22);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px sans-serif';
        const topText = this.pinching ? 'PINCHING - JUMP!' : 'Open hand  |  Pinch to jump';
        this.ctx.fillText(topText, 6, 15);

        if (this.labelElement) {
            this.labelElement.innerText = "WEBCAM (pinch here)";
            this.labelElement.style.color = this.pinching ? "#50ff00" : "";
        }

        this.ctx.restore();
    }
}
