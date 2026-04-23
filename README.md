# ◈ Ruka: The Child of the Sea ◈

**Stellar Journey** is an immersive, cinematic 3D web experience built with React and Three.js. It is heavily inspired by the movie, "The Children of the Sea" which released in 2019 and directed by Ayumu Watanabe.

"Once every millennium, the sky and sea meet—a sacred event known as the Birth Festival. Players step into the role of the *Child of the Sea*, a chosen witness tasked with mapping the sky and restoring lost constellations to trigger a cosmic revelation."

## ✨ Experience Features

- **8 Unique Biomes**: Journey through a continuous world space featuring the Enchanted Forest, Ocean Realm, Sky Realm, Frost Realm, Sakura Realm, Spring Valley, Rainbow Sky Isles, and the Twilight Zone.
- **Cinematic Prologue**: A scroll-driven narrative that sets the stage for the journey.
- **Interactive Star Collection**: Find and collect unique stars in each biome to rebuild the constellations.
- **Dynamic World Lighting**: Real-time atmospheric lighting transitions as you move between biomes.
- **Procedural Audio System**: Context-aware background music that fades and transitions seamlessly based on the player's location.
- **The Revelation Finale**: A high-intensity cinematic ending featuring the *Mother Whale* and a transcendence sequence synchronized with the music.

## 🚀 Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **3D Engine**: [Three.js](https://threejs.org/) via [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)
- **3D Utilities**: [@react-three/drei](https://github.com/pmndrs/drei)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Pure CSS3 for cinematic overlays and UI.

## 🕹️ Controls

| Key | Action |
|-----|--------|
| **W / A / S / D** | Movement |
| **Arrows** | Movement |
| **Space** | Ascend |
| **Shift** | Descend |
| **Click + Drag** | Look around (Camera) |
| **Mouse Click** | Collect Stars |
| **Enter / Space** | Skip Prologue / Dialogue |

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ruka-stellar-journey.git
   cd Ruka
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run in development mode**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📁 Project Structure

- `src/App.jsx`: The core engine, world layout, and lighting manager.
- `src/Prologue.jsx`: The scroll-linked narrative opening.
- `src/PlayerController.jsx`: Physics-based 3D movement logic.
- `src/FinalSequence.jsx`: Cinematic logic for the Mother Whale and the end-game revelation.
- `src/Starfield.jsx`: Background star rendering and constellation logic.
- `public/audio/`: Seamlessly managed BGM and cinematic audio assets.

## 📜 License

This project is licensed under the Apache License 2.0.

---
*Created with stardust and code.*
