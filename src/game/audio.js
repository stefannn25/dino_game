let _JUMP = null;
let _FOOTSTEP = null;
let _DEATH = null;
let _SPEED_UP = null;

export function initAudio() {
    _JUMP = new Audio('assets/sounds/jump.wav');
    _FOOTSTEP = new Audio('assets/sounds/footstep.wav');
    _DEATH = new Audio('assets/sounds/death.wav');
    _SPEED_UP = new Audio('assets/sounds/speed_up.wav');

    // Preload to ensure smooth playback
    _JUMP.preload = 'auto';
    _FOOTSTEP.preload = 'auto';
    _DEATH.preload = 'auto';
    _SPEED_UP.preload = 'auto';

    if (_FOOTSTEP) {
        _FOOTSTEP.volume = 0.3;
        _FOOTSTEP.loop = true;
    }
}

export function playJump() {
    if (_JUMP) {
        _JUMP.currentTime = 0;
        _JUMP.play().catch(e => console.warn("Audio play blocked by browser:", e));
    }
}

export function playSpeedUp() {
    if (_SPEED_UP) {
        _SPEED_UP.currentTime = 0;
        _SPEED_UP.play().catch(e => console.warn("Audio play blocked by browser:", e));
    }
}

export function playDeath() {
    if (_DEATH) {
        _DEATH.currentTime = 0;
        _DEATH.play().catch(e => console.warn("Audio play blocked by browser:", e));
    }
}

export function startFootstep() {
    if (_FOOTSTEP && _FOOTSTEP.paused) {
        _FOOTSTEP.play().catch(e => console.warn("Audio play blocked by browser:", e));
    }
}

export function stopFootstep() {
    if (_FOOTSTEP && !_FOOTSTEP.paused) {
        _FOOTSTEP.pause();
    }
}
