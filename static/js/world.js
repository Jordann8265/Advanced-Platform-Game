/**
 * WORLD.JS
 * This file handles the generation of platforms, gaps, and enemies.
 * It manages the "Camera Offset" which makes the world feel like it's scrolling.
 */

// Global world variables
let cameraOffset = 0;
let platforms = [];
let enemies = [];
let foodItems = [];

// Constants for our modular grid
const PLATFORM_HEIGHT = 20;
const BASE_Y = 500; // The Y-coordinate for the ground level
const JUMP_UNIT = 120; // The standard distance for a single jump height

/**
 * Platform Class
 * Each platform is a rectangle with a specific type (base or floating).
 */
class Platform {
    constructor(x, y, width, isBase = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = PLATFORM_HEIGHT;
        this.isBase = isBase; // Helps distinguish the ground from floating pieces
    }

    draw(ctx) {
        ctx.fillStyle = "#555"; // Dark grey for platforms
        // Subtract cameraOffset from x to make the platform move as the player moves
        ctx.fillRect(this.x - cameraOffset, this.y, this.width, this.height);
    }
}

/**
 * Enemy Class (The Triangles)
 */
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.health = 2;
        this.speed = 2; // This will increase as levels progress
        this.flashCount = 0;
        this.isDead = false;
    }

    update() {
        // Triangles march toward the left of the screen
        this.x -= this.speed;
    }

    draw(ctx) {
        // If flashCount is active, skip drawing every few frames to create a 'flicker'
        if (this.flashCount > 0 && Math.floor(Date.now() / 50) % 2 === 0) return;

        ctx.fillStyle = "#ff0000"; // Red triangles
        ctx.beginPath();
        // Drawing a triangle based on the current position
        // Point 1: Top center
        ctx.moveTo(this.x - cameraOffset, this.y - this.size);
        // Point 2: Bottom left
        ctx.lineTo(this.x - cameraOffset - (this.size / 2), this.y);
        // Point 3: Bottom right
        ctx.lineTo(this.x - cameraOffset + (this.size / 2), this.y);
        ctx.closePath();
        ctx.fill();
    }
}

/**
 * World Generation Logic
 * This function is called to populate the level with pieces.
 */
function generateLevelSegment(startX, endX) {
    let currentX = startX;

    while (currentX < endX) {
        let segmentWidth = 200 + Math.random() * 300;
        let isGap = Math.random() < 0.15; // 15% chance for a gap in the base

        if (!isGap) {
            // Create a base platform
            platforms.push(new Platform(currentX, BASE_Y, segmentWidth, true));
            
            // Randomly spawn an enemy on this base segment (20% chance)
            if (Math.random() < 0.2) {
                enemies.push(new Enemy(currentX + segmentWidth / 2, BASE_Y));
            }
        } else {
            // If there is a gap, we MUST spawn a "safety" floating platform
            // at a height the player can reach with a single jump.
            let safetyX = currentX + (segmentWidth / 4);
            platforms.push(new Platform(safetyX, BASE_Y - JUMP_UNIT, segmentWidth / 2));
        }

        // Add extra random floating platforms at modular heights
        if (Math.random() < 0.3) {
            let heightLevel = Math.random() < 0.5 ? 1 : 2; // Level 1 or Level 2 height
            platforms.push(new Platform(currentX, BASE_Y - (heightLevel * JUMP_UNIT), 100));
        }

        currentX += segmentWidth + 50; // Move cursor forward for the next segment
    }
}