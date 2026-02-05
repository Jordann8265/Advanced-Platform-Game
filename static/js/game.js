/**
 * GAME.JS
 * The central engine that coordinates the Player, World, and Projectiles.
 * This file handles the timing, input, and communication with the Python backend.
 */

// 1. INITIAL SETUP
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Initialize Game Objects
let player = new Player();
let gameActive = true;
let distanceTraveled = 0;
let enemiesDefeated = 0;
let currentLevel = 1;

// Arrays to track active objects in the world
let activeProjectiles = [];
let activeImpacts = [];

// 2. BOOTSTRAP THE WORLD
// We must create the first platforms BEFORE the game loop starts
// This prevents the "Falling through a blank screen" issue.
if (platforms.length === 0) {
    // Generate a solid starting area from X=0 to X=2000
    generateLevelSegment(0, 2000);
}

/**
 * FETCH LAST RUN DATA
 * Asks the Python Flask server for the stats of the previous game.
 */
async function loadLastRun() {
    try {
        const response = await fetch('/get_score');
        const data = await response.json();
        
        // If data exists, update the HUD
        if (data.distance > 0) {
            document.getElementById('last-run-val').innerText = 
                `${data.distance}m | ${data.enemies_defeated} Kills`;
        }
    } catch (error) {
        console.log("Waiting for Python server to provide data...");
    }
}

// Call the score loader immediately
loadLastRun();

// 3. INPUT HANDLING
const keys = { right: false, left: false, up: false };

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowUp') player.jump(); // Jump triggers once per press
    
    // Combat Keys
    if (e.code === 'KeyZ') spawnProjectile('lightning'); // Z for Lightning
    if (e.code === 'KeyX') spawnProjectile('fireball');  // X for Fireball
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowLeft') keys.left = false;
});

function spawnProjectile(type) {
    // Projectiles originate from the player's center
    activeProjectiles.push(new Projectile(player.x + 20, player.y + 20, player.facing, type));
}

// 4. THE MAIN GAME LOOP
function gameLoop() {
    if (!gameActive) return;

    // A. CLEAR SCREEN
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // B. PROCEDURAL GENERATION
    // If the player is getting close to the end of the existing platforms, make more.
    if (cameraOffset + canvas.width > platforms[platforms.length - 1]?.x) {
        let lastX = platforms[platforms.length - 1].x;
        generateLevelSegment(lastX, lastX + 1000);
    }

    // C. UPDATE PLAYER & CAMERA
    player.update(keys, platforms);

    // Camera Logic: The camera follows the player once they pass 1/3 of the screen width
    if (player.x > cameraOffset + (canvas.width / 3)) {
        let diff = player.x - (cameraOffset + (canvas.width / 3));
        cameraOffset += diff;
        // Increase distance counter based on camera movement
        distanceTraveled += Math.floor(diff / 10);
    }

    // D. RENDER & UPDATE WORLD OBJECTS
    // Draw Platforms
    platforms.forEach(p => p.draw(ctx));

    // Update and Draw Enemies
    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw(ctx);

        // Check if a Projectile hit an Enemy
        activeProjectiles.forEach((proj, pIndex) => {
            if (proj.x > enemy.x - 15 && proj.x < enemy.x + 15 && 
                proj.y > enemy.y - 30 && proj.y < enemy.y) {
                
                activeImpacts.push(new Impact(proj.x, proj.y));
                activeProjectiles.splice(pIndex, 1); // Remove bullet
                enemy.health--;
                enemy.flashCount = 20; // Flash red for feedback

                if (enemy.health <= 0) {
                    enemiesDefeated++;
                    enemies.splice(index, 1); // Remove enemy
                }
            }
        });

        // Check if Player touched an Enemy
        if (player.x < enemy.x + 15 && player.x + player.width > enemy.x - 15 &&
            player.y < enemy.y && player.y + player.height > enemy.y - 30) {
            
            player.health--;
            enemies.splice(index, 1); // Enemy dies on impact
            if (player.health <= 0) gameOver();
        }
    });

    // E. MANAGE PROJECTILES & EFFECTS
    activeProjectiles.forEach((p, i) => {
        p.update();
        p.draw(ctx);
        // Clean up projectiles that fly too far away
        if (Math.abs(p.x - player.x) > 1000) activeProjectiles.splice(i, 1);
    });

    activeImpacts.forEach((imp, i) => {
        imp.update();
        imp.draw(ctx);
        if (imp.isFinished) activeImpacts.splice(i, 1);
    });

    // F. DRAW PLAYER
    player.draw(ctx);

    // G. REFRESH UI & DIFFICULTY
    updateUI();
    checkLevelProgression();

    // H. DEATH CHECK (Falling off the screen)
    if (player.y > canvas.height) gameOver();

    // Tell the browser to run this loop again (~60 times a second)
    requestAnimationFrame(gameLoop);
}

// 5. HELPER FUNCTIONS
function updateUI() {
    document.getElementById('distance-val').innerText = distanceTraveled;
    document.getElementById('kills-val').innerText = enemiesDefeated;
}

function checkLevelProgression() {
    // Change the background color based on distance reached
    if (distanceTraveled > 2000) {
        document.body.className = "level-3";
    } else if (distanceTraveled > 1000) {
        document.body.className = "level-2";
    } else {
        document.body.className = "level-1";
    }
}

async function gameOver() {
    gameActive = false;
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-stats').innerText = `Distance: ${distanceTraveled}m | Kills: ${enemiesDefeated}`;

    // SAVE TO PYTHON: POST data to the Flask server
    await fetch('/save_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            distance: distanceTraveled, 
            enemies_defeated: enemiesDefeated 
        })
    });
}

function resetGame() {
    // Reloads the page to reset all variables and the world
    location.reload();
}

// Start the engine!
gameLoop();