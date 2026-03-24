export class CloudManager {
    constructor(screenWidth) {
        this.screenWidth = screenWidth;
        this.clouds = [];
        this.spawnX = screenWidth + 100;
        this.nextAt = screenWidth + 100;
    }

    reset() {
        this.clouds = [];
        this.spawnX = this.screenWidth + 100;
        this.nextAt = this.screenWidth + 100;
    }

    update(speed) {
        const cSpeed = speed * 0.3; // Clouds move slower
        for (let i = 0; i < this.clouds.length; i++) {
            this.clouds[i].x -= cSpeed;
        }
        this.clouds = this.clouds.filter(c => c.x > -100);
        
        this.spawnX -= cSpeed;
        if (this.spawnX <= this.nextAt) {
            this.clouds.push({
                x: this.screenWidth + 100,
                y: Math.random() * 150 + 50,
                scale: Math.random() * 0.5 + 0.5
            });
            this.spawnX = this.screenWidth + 100;
            this.nextAt = this.screenWidth + 100 - (Math.random() * 300 + 200);
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#c8c8c8';
        for (let i = 0; i < this.clouds.length; i++) {
            const c = this.clouds[i];
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.scale(c.scale, c.scale);
            
            ctx.beginPath();
            ctx.arc(0, 0, 12,     Math.PI, Math.PI * 2);
            ctx.arc(14, -6, 16,   Math.PI, Math.PI * 2);
            ctx.arc(28, 0, 12,    Math.PI, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(-12, -4, 52, 16);
            ctx.beginPath();
            ctx.arc(-12, -4+8, 8, Math.PI*0.5, Math.PI*1.5);
            ctx.arc(40, -4+8, 8, Math.PI*2.5, Math.PI*1.5, true);
            ctx.fill();
            
            ctx.restore();
        }
    }
}

export class Ground {
    constructor(screenWidth) {
        this.screenWidth = screenWidth;
        this.GROUND_Y = 430;
        this.dots = [];
        for (let i = 0; i < 70; i++) {
            this.dots.push({
                x: Math.random() * screenWidth,
                y: this.GROUND_Y + Math.random() * 20,
                w: Math.random() > 0.5 ? 2 : 4
            });
        }
    }

    reset() {}

    update(speed) {
        for (let i = 0; i < this.dots.length; i++) {
            this.dots[i].x -= speed;
            if (this.dots[i].x < 0) {
                this.dots[i].x = this.screenWidth;
                this.dots[i].y = this.GROUND_Y + Math.random() * 20;
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#535353';
        ctx.fillRect(0, this.GROUND_Y, this.screenWidth, 1);
        
        for (let i = 0; i < this.dots.length; i++) {
            ctx.fillRect(Math.floor(this.dots[i].x), Math.floor(this.dots[i].y), this.dots[i].w, 2);
        }
    }
}
