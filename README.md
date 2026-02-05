# 2D Procedural Platformer with Python/Flask Backend

A retro-style side-scrolling platformer with procedural world generation, physics-based combat, and a persistent scoring system. Built to demonstrate the integration of a JavaScript/Canvas frontend with a Python REST API.

Technical Highlights
Procedural Generation: Implemented a modular algorithm to generate jumpable terrain and enemy placements in real-time.

Physics Engine:** Custom-built gravity, collision detection, and a "flick-turning" mechanic for responsive player movement.

Backend Integration: State-managed Python/Flask server that handles game-over events and persists user stats via JSON.

Reactive UI: Dynamic CSS transitions that shift level themes (backgrounds) based on distance traveled.

Tech Stack
Frontend: HTML5 Canvas, Vanilla JavaScript (ES6+), CSS3

Backend: Python 3, Flask

Data Persistence: JSON-based local storage

Key Features
Dynamic Combat: Dual-attack system (Lightning and Fireballs) with unique animation cycles and collision impact effects.

Health-Based Visuals: The player character dynamically shifts color (Light Blue -> Dark Blue -> Red) based on health state.

Infinite Scrolling: A virtual camera system that tracks player progress and offloads off-screen assets to optimize memory.

