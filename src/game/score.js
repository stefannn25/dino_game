import { playSpeedUp } from './audio.js';

const BASE_SPEED = 8.0;
const SPEED_INCREMENT = 0.8;
const MAX_SPEED = 22.0;

export class ScoreTracker {
    constructor(hiScoreElement, scoreElement, speedElement, speedFillElement) {
        this.hiScoreEl = hiScoreElement;
        this.scoreEl = scoreElement;
        this.speedEl = speedElement;
        this.speedFillEl = speedFillElement;
        
        this.score = 0;
        this.hiScore = parseInt(localStorage.getItem('dinoHiScore')) || 0;
        this.tick = 0;
        this.speed = BASE_SPEED;
        
        this._updateUI();
    }

    reset() {
        if (this.score > this.hiScore) {
            this.hiScore = this.score;
            localStorage.setItem('dinoHiScore', this.hiScore);
        }
        this.score = 0;
        this.tick = 0;
        this.speed = BASE_SPEED;
        this._updateUI();
    }

    update() {
        this.tick++;
        if (this.tick >= 6) {
            this.tick = 0;
            this.score++;
            
            const lvl = Math.floor(this.score / 100);
            const newSpeed = Math.min(BASE_SPEED + lvl * SPEED_INCREMENT, MAX_SPEED);
            
            if (newSpeed > this.speed) {
                this.speed = newSpeed;
                if (this.score > 0 && this.score % 100 === 0) {
                    playSpeedUp();
                }
            }
            this._updateUI();
        }
    }

    _updateUI() {
        if (this.scoreEl) {
            this.scoreEl.innerText = this.score.toString().padStart(5, '0');
        }
        if (this.hiScoreEl) {
            this.hiScoreEl.innerText = `HI ${this.hiScore.toString().padStart(5, '0')}`;
        }
        if (this.speedEl && this.speedFillEl) {
            const displaySpeed = this.speed.toFixed(1);
            this.speedEl.innerText = `SPEED ${displaySpeed}`;
            const fillPct = ((this.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED)) * 100;
            this.speedFillEl.style.width = `${Math.max(0, fillPct)}%`;
        }
    }
}
