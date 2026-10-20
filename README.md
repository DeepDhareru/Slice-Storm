# ⚔️ SLICE STORM

**SLICE • COMBO • SURVIVE**

SLICE STORM is a fast, juicy fruit-slicing arcade game for the browser, built as a full-stack project for the **VELoop Rewards Full Stack Developer Internship**. Swipe with your mouse or finger to slice fruit, dodge bombs and chase a high score.

> **Project status:** 🚧 In development. The core game is playable. Authentication, leaderboard and backend are in progress (see the [Roadmap](#-roadmap)).

- 🌐 **Live game:** `https://slice-storm.vercel.app/`
- 💻 **GitHub:** `https://github.com/DeepDhareru/Slice-Storm`

---

## 🎮 Gameplay

Slice the fruit before it falls, avoid the bombs, and keep your lives.

### Controls

| Device | How to play |
|---|---|
| Desktop | Click and drag the mouse across the game area |
| Mobile / tablet | Swipe with your finger |
| Game over | Click **PLAY AGAIN**, or press `Enter` / `Space` |

### Game rules

- You start with **3 lives** (hearts).
- A fruit that falls without being sliced costs **1 life** (`MISS`).
- Slicing a **bomb** costs **1 life** and triggers an explosion, flash and screen shake.
- A bomb that falls without being sliced has **no penalty**.
- When lives reach **0**, the game is over. Your best score is stored in `localStorage`.
- One swipe can slice **several fruits at once** (multi-slice).

### Fruits

Every fruit has its own size, score and spawn probability. Sizes scale with the screen so the game feels the same on phones and desktops.

| Fruit | Score | Relative size | Spawn weight | Approx. chance (among fruit) |
|---|---|---|---|---|
| 🍎 Apple | +10 | 1.00 | 30 | 25.0% |
| 🍊 Orange | +15 | 1.05 | 25 | 20.8% |
| 🍌 Banana | +20 | 0.95 | 15 | 12.5% |
| 🍉 Watermelon | +25 | 1.60 | 8 | 6.7% |
| 🍓 Strawberry | +12 | 0.80 | 20 | 16.7% |
| 🥝 Kiwi | +18 | 0.90 | 15 | 12.5% |
| 🍍 Pineapple | +30 | 1.40 | 7 | 5.8% |

Each wave launches 1 to 3 objects every 0.9 to 1.5 seconds, and about 14% of spawns are bombs.

---

## ✨ Features

### Implemented

- [x] Canvas game loop with delta time, retina (DPR) support and resize handling
- [x] Random fruit spawning with different launch velocities, trajectories, rotation and gravity
- [x] 7 fruit types, each with its own score, size and spawn probability
- [x] Original, hand-coded fruit artwork with a unique cut cross-section for every fruit (seeds, segments, rind)
- [x] Mouse and touch slicing using Pointer Events
- [x] Glowing slice trail that fades out automatically
- [x] Fast-swipe-safe collision detection (line segment against circle)
- [x] Fruit splits into two halves with score popups
- [x] Multi-slice (several fruits in one swipe)
- [x] Bombs with realistic metal artwork and a burning fuse
- [x] Explosion effects: fireball, shockwave, sparks, smoke, debris, screen flash and shake
- [x] Lives, miss penalty and game over screen
- [x] Best score saved in `localStorage`
- [x] Restart without leaking objects, timers or listeners

### In progress / planned

- [ ] Polished HUD, start and pause menus with SLICE STORM branding
- [ ] Combo system and bonus score
- [ ] Slice particle effects and progressive difficulty levels
- [ ] Sound effects, background music and audio controls
- [ ] Authentication (register, login, JWT)
- [ ] Game sessions and server-side score validation
- [ ] Global leaderboard and player dashboard with game history
- [ ] Timed and Zen modes (bonus)
- [ ] Power-ups: Freeze, Double Score, Frenzy (bonus)
- [ ] Deployment, demo video and final README screenshots

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Game rendering | HTML5 Canvas API, `requestAnimationFrame` |
| Input | Pointer Events (mouse, touch, pen) |
| Backend *(planned)* | Node.js, Express |
| Database *(planned)* | MongoDB with Mongoose |
| Auth *(planned)* | JWT, bcrypt |
| Hosting | Vercel (frontend), backend host to be decided |

---

## 🏗️ Architecture notes

- **The game engine lives outside React.** React is used for pages and UI, while the game loop runs on a canvas with plain JavaScript classes. This avoids a React re-render on every frame.
- **Delta-time movement.** Motion depends on elapsed time, not on frame count, so the game feels the same at 60 Hz and 120 Hz. Large time gaps (such as switching tabs) are capped.
- **Screen-relative physics.** Gravity and object sizes scale with the canvas size.
- **Segment-circle collision.** Each new piece of the blade trail is tested against every object, so very fast swipes cannot skip over a fruit.
- **Sprite caching.** Detailed fruit and bomb artwork is drawn once on an offscreen canvas, then reused with `drawImage` on every frame for stable FPS.
- **Seeded randomness.** Fruit details such as kiwi hairs and watermelon seeds use a seeded generator, so a fruit looks the same in every frame and its sliced inside matches the outside.
- **Clean teardown.** `destroy()` and `reset()` cancel animation frames, remove event listeners and clear all object arrays, so restarting does not accumulate objects or timers.

---

## 📁 Project Structure

```
slice-storm/
├── client/
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   └── GameCanvas.jsx      # mounts the engine on a canvas
│       └── game/
│           ├── Engine.js           # game loop, input, spawning, rules, HUD
│           ├── Fruit.js            # whole fruit physics and drawing
│           ├── FruitHalf.js        # sliced halves
│           ├── fruitArt.js         # procedural fruit and cross-section artwork
│           ├── fruits.js           # fruit definitions and weighted picking
│           ├── Bomb.js             # bomb artwork, fuse and spark
│           ├── Explosion.js        # explosion and flash effects
│           ├── Blade.js            # slice trail
│           └── geometry.js         # segment-circle intersection
├── server/                          # backend (in progress)
├── docs/                            # research notes and screenshots
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (current LTS recommended)
- npm
- Git

### Run the game locally

```bash
git clone https://github.com/<your-username>/slice-storm.git
cd slice-storm/client
npm install
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

To test on a phone on the same Wi-Fi network:

```bash
npm run dev -- --host
```

then open the **Network** URL on your phone.

### Build for production

```bash
cd client
npm run build
npm run preview
```

### Backend *(in progress)*

```bash
cd server
npm install
cp .env.example .env     # fill in the values below
npm run dev
```

---

## 🔐 Environment Variables

Used by the backend (`server/.env`). Never commit your real `.env` file.

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port for the API server | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret used to sign tokens | a long random string |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |

---

## 🔌 API Documentation *(planned design, backend in progress)*

All game and leaderboard routes will require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account (name, email, password) |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/me` | Get the current user |
| POST | `/api/games/start` | Create a game session and return a `gameId` |
| POST | `/api/games/complete` | Submit the result of a session |
| GET | `/api/games/history` | Recent games of the current player |
| GET | `/api/leaderboard` | Global top players |
| GET | `/api/leaderboard/me` | Current player's rank |

### Score validation (planned)

`POST /api/games/complete` will reject a result when:

- the session does not exist, belongs to another user, or was already completed
- the duration does not match the server-side start time
- the score or fruit count is impossible for that duration
- the combo is larger than the number of fruits sliced

---

## 🗄️ Database *(planned)*

**User**

| Field | Type |
|---|---|
| name, email, password (hashed) | String |
| highestScore, totalGames, totalFruitsSliced, highestCombo | Number |
| createdAt, updatedAt | Date |

**Game**

| Field | Type |
|---|---|
| userId, gameId | ObjectId / String |
| mode, status | String |
| score, fruitsSliced, bombsHit, maxCombo, accuracy, duration | Number |
| createdAt | Date |

---

## 🌍 Deployment

- **Frontend:** Vercel. Import the repository and set **Root Directory** to `client` (Vite is detected automatically). Every push to `main` redeploys the live game.
- **Backend:** to be added.

---

## 🧩 Roadmap

| # | Milestone | Status |
|---|---|---|
| 1 | Project setup | ✅ Done |
| 2 | Canvas and game loop | ✅ Done |
| 3 | Fruit spawning and physics | ✅ Done |
| 4 | Pointer input and slice trail | ✅ Done |
| 5 | Slicing, split effect and score | ✅ Done |
| 6 | Realistic fruit artwork | ✅ Done |
| 7 | Bombs, lives and game over | ✅ Done |
| 8 | Realistic bomb and explosion | ✅ Done |
| 9 | HUD, menus and branding | 🔜 Next |
| 10 | Combo and multi-slice bonus | ⏳ Planned |
| 11 | Particles and difficulty | ⏳ Planned |
| 12 | Audio | ⏳ Planned |
| 13 | Backend: auth, sessions, validation | ⏳ Planned |
| 14 | Leaderboard and dashboard | ⏳ Planned |
| 15 | Modes, power-ups, responsive testing | ⏳ Planned |
| 16 | Deployment, README and demo video | ⏳ Planned |

---

## ⚠️ Known Limitations

- The backend, accounts and global leaderboard are not built yet, so scores are stored only in the browser.
- There is no sound or music yet.
- The game over screen and HUD are drawn on the canvas for now and will be replaced by the final UI.
- There are no start or pause menus yet, and the game starts immediately.
- Only one game mode (endless classic) exists at the moment.
- Fruit artwork is stylised vector art generated in code, not photo-realistic.
- Performance has been tuned for modern devices; testing on low-end phones is pending.

---

## ©️ Originality

SLICE STORM is inspired by the gameplay genre of fruit-slicing arcade games. It uses its own name, code, fruit and bomb artwork, blade effect and visual identity. No logos, artwork, sounds or code from any existing game are used.

---

## 👤 Author

**Deepak**, Full Stack Developer Intern at VELoop Rewards.