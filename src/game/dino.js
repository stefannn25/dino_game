import { playJump } from './audio.js';

const GRAVITY = 1.8;
const JUMP_VELOCITY = -16.0;
const BOOST_GRAVITY = 0.55;
const GROUND_Y = 430;
const TOP_CLAMP = 10;

const MIN_BOOST_FRAMES = 12;
const MAX_BOOST_FRAMES = 60;

const ANIM_FRAMES = 6;
const IDX_RUN_A = 0;
const IDX_RUN_B = 1;
const IDX_JUMP = 2;
const IDX_DEAD = 3;

export class SpriteLoader {
    static async loadAndExtractSprites() {
        const img = new Image();
        img.src = 'assets/dino.png';
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error("Failed to load dino.png"));
        });
        
        const scale = 5;
        const dw = Math.floor(img.width / scale);
        const dh = Math.floor(img.height / scale);
        
        const offscreen = document.createElement('canvas');
        offscreen.width = img.width;
        offscreen.height = img.height;
        const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
        offCtx.drawImage(img, 0, 0);
        const rawData = offCtx.getImageData(0, 0, img.width, img.height).data;
        
        const downscaled = document.createElement('canvas');
        downscaled.width = dw;
        downscaled.height = dh;
        const downCtx = downscaled.getContext('2d');
        const downData = downCtx.createImageData(dw, dh);
        
        for (let y = 0; y < dh; y++) {
            for (let x = 0; x < dw; x++) {
                const px = x * scale + Math.floor(scale / 2);
                const py = y * scale + Math.floor(scale / 2);
                const idx = (py * img.width + px) * 4;
                
                const r = rawData[idx];
                const g = rawData[idx+1];
                const b = rawData[idx+2];
                const a = rawData[idx+3];
                
                const outIdx = (y * dw + x) * 4;
                if (r < 128 && g < 128 && b < 128 && a > 128) {
                    downData.data[outIdx] = 83;
                    downData.data[outIdx+1] = 83;
                    downData.data[outIdx+2] = 83;
                    downData.data[outIdx+3] = 255;
                } else {
                    downData.data[outIdx] = 0;
                    downData.data[outIdx+1] = 0;
                    downData.data[outIdx+2] = 0;
                    downData.data[outIdx+3] = 0;
                }
            }
        }
        downCtx.putImageData(downData, 0, 0);
        
        const extract = (sx, sy, sw, sh) => {
            const canvas = document.createElement('canvas');
            canvas.width = sw;
            canvas.height = sh;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(downscaled, sx, sy, sw, sh, 0, 0, sw, sh);
            return canvas;
        };
        
        return [
            extract(24, 66, 44, 47), // RUN_A
            extract(78, 66, 44, 47), // RUN_B
            extract(132, 66, 44, 47), // JUMP
            extract(187, 66, 59, 47)  // DEAD
        ];
    }
}

export class Dinosaur {
    constructor(frames) {
        this.frames = frames;
        this.width = 44;
        this.height = 47;
        
        this.x = 90;
        this.y = GROUND_Y - this.height;
        this.vel_y = 0.0;
        this.on_ground = true;
        this.dead = false;
        
        this._boosting = false;
        this._boost_frame = 0;
        this._min_boost_ok = false;
        
        this._anim_tick = 0;
        this._run_frame = IDX_RUN_A;
        this._dead_tick = 0;
    }

    jump() {
        if (this.on_ground && !this.dead) {
            this.vel_y = JUMP_VELOCITY;
            this.on_ground = false;
            this._boosting = true;
            this._boost_frame = 0;
            this._min_boost_ok = false;
            playJump();
        }
    }

    update(jump_held = false) {
        if (this.dead) {
            this._dead_tick++;
            return;
        }

        if (!this.on_ground) {
            this._apply_physics(jump_held);
        }

        if (this.on_ground) {
            this._anim_tick++;
            if (this._anim_tick >= ANIM_FRAMES) {
                this._anim_tick = 0;
                this._run_frame = this._run_frame === IDX_RUN_B ? IDX_RUN_A : IDX_RUN_B;
            }
        }
    }

    getRect() {
        const mx = 6;
        const my = 4;
        return {
            x: this.x + mx,
            y: Math.floor(this.y) + my,
            width: this.width - mx * 2,
            height: this.height - my * 2
        };
    }

    draw(ctx) {
        if (this.dead) {
            if (Math.floor(this._dead_tick / 4) % 2 === 0) {
                const frame = this.frames[IDX_DEAD];
                ctx.drawImage(frame, Math.floor(this.x), Math.floor(this.y));
            }
            return;
        }

        let frame;
        if (!this.on_ground) {
            frame = this.frames[IDX_JUMP];
        } else {
            frame = this.frames[this._run_frame];
        }

        ctx.drawImage(frame, Math.floor(this.x), Math.floor(this.y));
    }

    _apply_physics(jump_held) {
        if (this._boosting) {
            if (this._boost_frame >= MIN_BOOST_FRAMES) {
                this._min_boost_ok = true;
            }

            const boost_continues = (
                !this._min_boost_ok ||
                (jump_held && this._boost_frame < MAX_BOOST_FRAMES)
            );

            if (boost_continues) {
                const t = this._boost_frame / MAX_BOOST_FRAMES;
                const eff_grav = BOOST_GRAVITY + (GRAVITY - BOOST_GRAVITY) * t;
                this.vel_y += eff_grav;
                this._boost_frame++;
            } else {
                this._boosting = false;
                this.vel_y += GRAVITY;
            }
        } else {
            this.vel_y += GRAVITY;
        }

        this.y += this.vel_y;

        if (this.y < TOP_CLAMP) {
            this.y = TOP_CLAMP;
            this.vel_y = 0.0;
        }

        if (this.y >= GROUND_Y - this.height) {
            this.y = GROUND_Y - this.height;
            this.vel_y = 0.0;
            this.on_ground = true;
            this._boosting = false;
        }
    }
}
