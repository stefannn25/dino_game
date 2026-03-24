import { SpriteLoader, Dinosaur } from './game/dino.js';
import { ObstacleManager } from './game/obstacles.js';
import { Ground, CloudManager } from './game/environment.js';
import { ScoreTracker } from './game/score.js';
import { GestureDetector } from './gesture/handTracker.js';
import { initAudio, playDeath, startFootstep, stopFootstep } from './game/audio.js';

const SCREEN_W = 1100;
const SCREEN_H = 600;
const DAY_CYCLE_SCORE = 300;

let canvas, ctx;
let dinoFrames;
let dino;
let obstacles;
let ground;
let clouds;
let scoreTracker;
let detector;

let state = 'waiting';
let nightMode = false;

let kbJumpHeld = false;
let actionJump = false;
let actionRestart = false;
let prevPinch = false;

async function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    try {
        dinoFrames = await SpriteLoader.loadAndExtractSprites();
    } catch (err) {
        console.error("Failed to load sprites:", err);
        alert("Failed to load assets/dino.png. Ensure the file exists in the correct path.");
        return;
    }
    
    dino = new Dinosaur(dinoFrames);
    obstacles = new ObstacleManager();
    ground = new Ground(SCREEN_W);
    clouds = new CloudManager(SCREEN_W);
    
    initAudio();
    
    scoreTracker = new ScoreTracker(
        document.getElementById('hi-score'),
        document.getElementById('current-score'),
        document.getElementById('speed-label'),
        document.getElementById('speed-bar-fill')
    );
    
    detector = new GestureDetector(
        document.getElementById('webcam-video'),
        document.getElementById('webcam-canvas'),
        document.getElementById('pip-label')
    );
    detector.start();
    
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            kbJumpHeld = true;
            if (state === 'waiting') {
                state = 'playing';
                scoreTracker.reset();
                hideScreen('start-screen');
            } else if (state === 'playing') {
                actionJump = true;
            } else if (state === 'dead') {
                actionRestart = true;
            }
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            kbJumpHeld = false;
        }
    });

    document.addEventListener('mousedown', (e) => {
        if (e.target.closest('#pip-container')) return;
        
        if (state === 'waiting') {
            state = 'playing';
            scoreTracker.reset();
            hideScreen('start-screen');
        } else if (state === 'dead') {
            actionRestart = true;
        } else if (state === 'playing') {
            actionJump = true;
            kbJumpHeld = true;
        }
    });

    document.addEventListener('mouseup', (e) => {
        kbJumpHeld = false;
    });

    requestAnimationFrame(gameLoop);
}

function hideScreen(id) {
    document.getElementById(id).classList.add('hidden');
}

function showScreen(id) {
    document.getElementById(id).classList.remove('hidden');
}

let lastTime = 0;
const frameDuration = 1000 / 60;

function gameLoop(timestamp) {
    if (!timestamp) timestamp = performance.now();
    
    requestAnimationFrame(gameLoop);
    const deltaTime = timestamp - lastTime;
    if (deltaTime < frameDuration - 1) {
        return;
    }
    lastTime = timestamp - (deltaTime % frameDuration);

    const currPinch = detector.isPinching();
    const pinchRose = currPinch && !prevPinch;
    prevPinch = currPinch;

    if (pinchRose) {
        if (state === 'waiting') {
            state = 'playing';
            scoreTracker.reset();
            hideScreen('start-screen');
        } else if (state === 'playing') {
            actionJump = true;
        } else if (state === 'dead') {
            actionRestart = true;
        }
    }

    if (actionRestart && state === 'dead') {
        state = 'playing';
        dino = new Dinosaur(dinoFrames);
        obstacles.reset();
        ground.reset();
        clouds.reset();
        scoreTracker.reset();
        nightMode = false;
        document.body.classList.remove('night-mode');
        hideScreen('game-over-screen');
        startFootstep();
    }
    actionRestart = false;

    if (state === 'playing') {
        scoreTracker.update();
        const speed = scoreTracker.speed;

        if (actionJump) {
            dino.jump();
        }
        
        const jumpHeld = (currPinch || kbJumpHeld) && !dino.on_ground;
        dino.update(jumpHeld);
        
        ground.update(speed);
        clouds.update(speed);
        obstacles.update(speed);

        const newNightMode = Math.floor(scoreTracker.score / DAY_CYCLE_SCORE) % 2 === 1;
        if (newNightMode !== nightMode) {
            nightMode = newNightMode;
            document.body.classList.toggle('night-mode', nightMode);
        }

        if (obstacles.checkCollision(dino.getRect())) {
            dino.dead = true;
            state = 'dead';
            showScreen('game-over-screen');
            stopFootstep();
            playDeath();
        } else {
            if (dino.on_ground) {
                startFootstep();
            } else {
                stopFootstep();
            }
        }
    } else if (state === 'dead') {
        dino.update(false);
    } else if (state === 'waiting') {
        ground.update(4.0);
        clouds.update(4.0);
    }
    
    actionJump = false;

    ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);
    
    if (state !== 'waiting') {
        clouds.draw(ctx);
        ground.draw(ctx);
        obstacles.draw(ctx);
        dino.draw(ctx);
    }
}

window.onload = init;
