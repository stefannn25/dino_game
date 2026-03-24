const OBSTACLE_COLOR = '#535353';
const PTERO_COLOR = '#535353';
const GROUND_Y = 430;
const PTERO_HEIGHTS = [GROUND_Y - 80, GROUND_Y - 140, GROUND_Y - 200];

export class Cactus {
    constructor(x, speed) {
        this.VARIANTS = [
            [14, 48, 22],
            [20, 60, 28],
            [16, 54, 24]
        ];

        const count = Math.floor(Math.random() * 3) + 1; // 1 to 3
        const variant = this.VARIANTS[Math.floor(Math.random() * this.VARIANTS.length)];
        
        this._stem_w = variant[0];
        this._stem_h = variant[1];
        this._arm_h = variant[2];

        this._spacing = this._stem_w + Math.floor(Math.random() * 5) + 2; // 2 to 6
        
        this.x = x;
        this.y = GROUND_Y - this._stem_h;
        this.w = this._spacing * (count - 1) + this._stem_w;
        this.h = this._stem_h;
        this._speed = speed;
        this._count = count;
    }

    update(speed) {
        this._speed = speed;
        this.x -= speed;
    }

    isOffscreen() {
        return this.x + this.w < 0;
    }

    getRect() {
        const margin = 4;
        return {
            x: this.x + margin,
            y: this.y + margin,
            width: this.w - margin * 2,
            height: this.h - margin * 2
        };
    }

    draw(ctx) {
        ctx.fillStyle = OBSTACLE_COLOR;
        for (let i = 0; i < this._count; i++) {
            const bx = Math.floor(this.x) + i * this._spacing;
            const by = Math.floor(this.y);
            const sw = this._stem_w;
            const sh = this._stem_h;
            const ah = this._arm_h;

            this._roundRect(ctx, bx, by, sw, sh, 2);
            ctx.beginPath();
            ctx.arc(bx + sw / 2, by + 4, sw / 2 + 1, 0, Math.PI * 2);
            ctx.fill();

            const arm_x = bx - sw / 2 - 2;
            const arm_y = by + sh / 2 - ah;
            this._roundRect(ctx, arm_x, arm_y, sw / 2 + 2, 10, 2);
            this._roundRect(ctx, arm_x, arm_y, 10, ah - 4, 2);

            const arm_x2 = bx + sw - 2;
            this._roundRect(ctx, arm_x2, arm_y, sw / 2 + 2, 10, 2);
            this._roundRect(ctx, arm_x2 + sw / 2 - 8, arm_y, 10, ah - 4, 2);
        }
    }

    _roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
}

export class Pterodactyl {
    constructor(x, speed) {
        this.width = 46;
        this.height = 34;
        this.x = x;
        this.y = PTERO_HEIGHTS[Math.floor(Math.random() * PTERO_HEIGHTS.length)] - this.height;
        this._speed = speed;
        this._anim_tick = 0;
        this._wing_up = true;
    }

    update(speed) {
        this._speed = speed;
        this.x -= speed;
        this._anim_tick++;
        if (this._anim_tick >= 8) {
            this._anim_tick = 0;
            this._wing_up = !this._wing_up;
        }
    }

    isOffscreen() {
        return this.x + this.width < 0;
    }

    getRect() {
        const margin = 6;
        return {
            x: Math.floor(this.x) + margin,
            y: Math.floor(this.y) + margin,
            width: this.width - margin * 2,
            height: this.height - margin * 2
        };
    }

    draw(ctx) {
        const col = PTERO_COLOR;
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);

        ctx.fillStyle = col;

        // Head and body ellipses
        this._fillEllipse(ctx, x + 10 + 13, y + 12 + 7, 13, 7); // x, y, rx, ry
        this._fillEllipse(ctx, x + 28 + 8, y + 8 + 6, 8, 6);

        // Beak
        this._fillPolygon(ctx, [
            [x + 42, y + 12],
            [x + 46, y + 15],
            [x + 42, y + 18]
        ]);

        // Eye White
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + 37, y + 12, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#282828';
        ctx.beginPath();
        ctx.arc(x + 38, y + 12, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = col;

        // Tail
        this._fillPolygon(ctx, [
            [x + 12, y + 18],
            [x, y + 14],
            [x + 2, y + 22]
        ]);

        // Wings
        if (this._wing_up) {
            this._fillPolygon(ctx, [
                [x + 14, y + 14],
                [x + 6, y + 2],
                [x + 22, y + 6],
                [x + 30, y + 2],
                [x + 36, y + 14]
            ]);
        } else {
            this._fillPolygon(ctx, [
                [x + 14, y + 18],
                [x + 6, y + 30],
                [x + 22, y + 24],
                [x + 30, y + 30],
                [x + 36, y + 18]
            ]);
        }
    }

    _fillEllipse(ctx, cx, cy, rx, ry) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    _fillPolygon(ctx, points) {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.closePath();
        ctx.fill();
    }
}

export class ObstacleManager {
    constructor() {
        this.BASE_SPEED = 8.0;
        this.MIN_GAP = 280;
        this.MAX_GAP = 700;
        this.obstacles = [];
        this._spawn_x = 1200.0;
        this._next_at = 1200.0;
    }

    reset() {
        this.obstacles = [];
        this._spawn_x = 1200.0;
        this._next_at = 1200.0;
    }

    update(speed) {
        for (let i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].update(speed);
        }
        this.obstacles = this.obstacles.filter(o => !o.isOffscreen());
        
        this._spawn_x -= speed;
        
        const gap = Math.floor(Math.random() * (this.MAX_GAP - this.MIN_GAP + 1)) + this.MIN_GAP;
        if (this._spawn_x <= this._next_at - gap) {
            this._next_at = this._spawn_x;
            const x = 1200.0;
            if (Math.random() < 0.3) {
                this.obstacles.push(new Pterodactyl(x, speed));
            } else {
                this.obstacles.push(new Cactus(x, speed));
            }
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].draw(ctx);
        }
    }

    checkCollision(dinoRect) {
        for (let i = 0; i < this.obstacles.length; i++) {
            const r1 = this.obstacles[i].getRect();
            const r2 = dinoRect;
            if (
                r1.x < r2.x + r2.width &&
                r1.x + r1.width > r2.x &&
                r1.y < r2.y + r2.height &&
                r1.y + r1.height > r2.y
            ) {
                return true;
            }
        }
        return false;
    }
}
