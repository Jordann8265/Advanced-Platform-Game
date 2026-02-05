/**
 * PROJECTILES.JS
 * Handles Lightning Bolts, Fireballs, and the Impact Explosion effects.
 */

class Projectile {
    constructor(x, y, direction, type) {
        this.x = x;
        this.y = y;
        this.direction = direction === "right" ? 1 : -1;
        this.type = type; // "lightning" or "fireball"
        this.speed = 10;
        this.radius = 5; // For fireballs
        this.length = 20; // For lightning
        this.isActive = true;
    }

    update() {
        // Move horizontally based on direction (no gravity, as requested)
        this.x += this.speed * this.direction;
    }

    draw(ctx) {
        if (this.type === "lightning") {
            // LIGHTNING BOLT: Flashing between two fluorescent colors
            // We use Date.now() to toggle colors every 50 milliseconds
            ctx.strokeStyle = (Math.floor(Date.now() / 50) % 2 === 0) ? "#00FF00" : "#CCFF00";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x - cameraOffset, this.y);
            ctx.lineTo(this.x - cameraOffset + (this.length * this.direction), this.y);
            ctx.stroke();
        } else {
            // FIREBALL: Alternating between Bright Orange and Bright Red
            ctx.fillStyle = (Math.floor(Date.now() / 100) % 2 === 0) ? "#FF4500" : "#FF0000";
            ctx.beginPath();
            ctx.arc(this.x - cameraOffset, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/**
 * IMPACT EFFECT
 * The circle that expands and disappears when an attack hits something.
 */
class Impact {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 2;
        this.maxRadius = 25;
        this.opacity = 1.0;
        this.isFinished = false;
    }

    update() {
        this.radius += 2; // Grow the circle
        this.opacity -= 0.05; // Fade out
        if (this.opacity <= 0) this.isFinished = true;
    }

    draw(ctx) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x - cameraOffset, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}