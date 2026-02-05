/**
 * PLAYER.JS
 * Manages the square character, its health-based colors, 
 * the "Fast Flick" turning logic, and combat projectiles.
 */

class Player {
    constructor() {
        // Position and Size
        this.x = 50; 
        this.y = 100;
        this.width = 40;
        this.height = 40;

        // Movement Physics
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpForce = -12;
        this.gravity = 0.6;
        
        // State Management
        this.health = 3;
        this.facing = "right"; // "left" or "right"
        this.isGrounded = false;
        this.jumpCount = 0;
        
        // Turn-then-Move Logic
        this.isTurning = false;
        this.turnTimer = 0;
        this.TURN_DELAY = 5; // Number of frames to 'flick' before moving
    }

    /**
     * Updates player color based on health: 
     * 3: Light Blue, 2: Dark Blue, 1: Bright Red
     */
    getColor() {
        if (this.health === 3) return "#ADD8E6"; // Light Blue
        if (this.health === 2) return "#00008B"; // Dark Blue
        return "#FF0000"; // Bright Red
    }

    update(input, platforms) {
        // 1. HANDLE TURNING (The "Fast Flick")
        let moveInput = 0;
        if (input.left) moveInput = -1;
        if (input.right) moveInput = 1;

        if (moveInput !== 0) {
            let newFacing = moveInput === 1 ? "right" : "left";
            
            // If we just pressed a new direction
            if (this.facing !== newFacing) {
                this.facing = newFacing;
                this.isTurning = true;
                this.turnTimer = this.TURN_DELAY;
                this.velocityX = 0; // Stop movement during the flick
            }

            // If the flick animation is done, allow movement
            if (this.isTurning) {
                this.turnTimer--;
                if (this.turnTimer <= 0) {
                    this.isTurning = false;
                }
            } else {
                this.velocityX = moveInput * this.speed;
            }
        } else {
            this.velocityX = 0;
        }

        // 2. APPLY PHYSICS (Gravity and Velocity)
        this.velocityY += this.gravity;
        this.x += this.velocityX;
        this.y += this.velocityY;

        // 3. COLLISION WITH PLATFORMS
        this.isGrounded = false;
        for (let plat of platforms) {
            // Check if player is falling onto a platform
            if (this.x < plat.x + plat.width &&
                this.x + this.width > plat.x &&
                this.y + this.height > plat.y &&
                this.y + this.height < plat.y + plat.height &&
                this.velocityY >= 0) {
                
                this.y = plat.y - this.height; // Snap feet to top of platform
                this.velocityY = 0;
                this.isGrounded = true;
                this.jumpCount = 0; // Reset double jump
            }
        }
    }

    draw(ctx) {
        // Draw the main body (The Square)
        ctx.fillStyle = this.getColor();
        // Note: We subtract cameraOffset in the main game loop, 
        // but here we use the screen position.
        ctx.fillRect(this.x - cameraOffset, this.y, this.width, this.height);

        // Draw the "Eye" (The direction indicator)
        ctx.fillStyle = "white";
        let eyeSize = 10;
        let eyeX = (this.facing === "right") 
            ? (this.x + this.width - eyeSize - 5) 
            : (this.x + 5);
        let eyeY = this.y + 5;
        
        ctx.fillRect(eyeX - cameraOffset, eyeY, eyeSize, eyeSize);
    }

    jump() {
        if (this.jumpCount < 2) {
            this.velocityY = this.jumpForce;
            this.jumpCount++;
        }
    }
}