const TAU = Math.PI * 2;
const S = 2; // sprite resolution (retina screens par saaf dikhne ke liye)

/* ---------- helpers ---------- */

// seed se same random numbers milte hain, isliye fruit ka design har frame same rehta hai
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function grad(ctx, x0, y0, r0, x1, y1, r1, stops) {
  const g = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

function gloss(ctx, x, y, rx, ry, rot, a = 0.4) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function disc(ctx, radius, fill) {
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

function seedAt(ctx, x, y, long, short, rot, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, long, short, rot, 0, TAU);
  ctx.fill();
}

/* ---------- poore fruit (bahar ka design) ---------- */

function apple(ctx, r) {
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.72);
  ctx.bezierCurveTo(r * 0.5, -r * 1.05, r * 1.08, -r * 0.4, r * 0.95, r * 0.2);
  ctx.bezierCurveTo(r * 0.85, r * 0.8, r * 0.35, r * 1.02, 0, r * 0.88);
  ctx.bezierCurveTo(-r * 0.35, r * 1.02, -r * 0.85, r * 0.8, -r * 0.95, r * 0.2);
  ctx.bezierCurveTo(-r * 1.08, -r * 0.4, -r * 0.5, -r * 1.05, 0, -r * 0.72);
  ctx.closePath();
  ctx.fillStyle = grad(ctx, -r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.1, [
    [0, '#ff7a6b'], [0.35, '#e5282b'], [1, '#8e0f18'],
  ]);
  ctx.fill();

  // peele-hare dhaari wala blush
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = '#ffd36b';
  ctx.lineWidth = r * 0.07;
  for (let i = 0; i < 7; i++) {
    const x = (-0.72 + i * 0.24) * r;
    ctx.beginPath();
    ctx.moveTo(x * 0.5, -r * 0.7);
    ctx.quadraticCurveTo(x * 1.3, 0, x * 0.8, r * 0.8);
    ctx.stroke();
  }
  ctx.restore();

  // upar ka gaddha, tana, patta
  ctx.fillStyle = 'rgba(60,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.72, r * 0.2, r * 0.08, 0, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = r * 0.09;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.72);
  ctx.quadraticCurveTo(r * 0.05, -r * 1.0, r * 0.18, -r * 1.2);
  ctx.stroke();

  ctx.fillStyle = '#3fae49';
  ctx.beginPath();
  ctx.moveTo(r * 0.08, -r * 0.98);
  ctx.quadraticCurveTo(r * 0.45, -r * 1.3, r * 0.8, -r * 1.05);
  ctx.quadraticCurveTo(r * 0.45, -r * 0.8, r * 0.08, -r * 0.98);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,90,30,0.7)';
  ctx.lineWidth = r * 0.03;
  ctx.beginPath();
  ctx.moveTo(r * 0.1, -r * 0.98);
  ctx.quadraticCurveTo(r * 0.45, -r * 1.05, r * 0.72, -r * 1.05);
  ctx.stroke();

  gloss(ctx, -r * 0.42, -r * 0.3, r * 0.17, r * 0.34, -0.45, 0.45);
}

function orange(ctx, r, rand) {
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fillStyle = grad(ctx, -r * 0.35, -r * 0.35, r * 0.1, 0, 0, r, [
    [0, '#ffc15a'], [0.45, '#ff8c1a'], [1, '#c2560a'],
  ]);
  ctx.fill();

  // peel ke chhote dimples
  ctx.save();
  ctx.clip();
  for (let i = 0; i < 70; i++) {
    const a = rand() * TAU;
    const d = Math.sqrt(rand()) * r * 0.95;
    ctx.fillStyle = rand() > 0.5 ? 'rgba(160,60,0,0.25)' : 'rgba(255,225,160,0.28)';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d, r * 0.025, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // upar ka hara tara
  ctx.fillStyle = '#3d8f3a';
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.translate(0, -r * 0.9);
    ctx.rotate(-1 + i * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.06, r * 0.04, r * 0.12, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  gloss(ctx, -r * 0.4, -r * 0.4, r * 0.2, r * 0.11, -0.7, 0.4);
}

function banana(ctx, r) {
  ctx.save();
  ctx.translate(0, -r * 0.3); // shape ko circle ke beech laane ke liye

  ctx.beginPath();
  ctx.moveTo(-r * 0.95, -r * 0.15);
  ctx.bezierCurveTo(-r * 0.6, r * 0.95, r * 0.6, r * 0.95, r * 1.0, -r * 0.45);
  ctx.bezierCurveTo(r * 0.55, r * 0.35, -r * 0.55, r * 0.35, -r * 0.95, -r * 0.15);
  ctx.closePath();

  const g = ctx.createLinearGradient(0, -r * 0.5, 0, r * 0.8);
  g.addColorStop(0, '#fff08a');
  g.addColorStop(0.5, '#f6d62e');
  g.addColorStop(1, '#c9970a');
  ctx.fillStyle = g;
  ctx.fill();

  // beech ki ridge line
  ctx.strokeStyle = 'rgba(150,100,0,0.4)';
  ctx.lineWidth = r * 0.04;
  ctx.beginPath();
  ctx.moveTo(-r * 0.85, -r * 0.12);
  ctx.bezierCurveTo(-r * 0.5, r * 0.62, r * 0.5, r * 0.62, r * 0.9, -r * 0.4);
  ctx.stroke();

  // chamak
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = r * 0.06;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-r * 0.6, r * 0.08);
  ctx.bezierCurveTo(-r * 0.3, r * 0.3, r * 0.2, r * 0.33, r * 0.55, r * 0.15);
  ctx.stroke();

  // dono siro par bhoora hissa
  ctx.fillStyle = '#4a3512';
  ctx.beginPath();
  ctx.ellipse(-r * 0.95, -r * 0.15, r * 0.07, r * 0.08, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#6b5a1e';
  ctx.beginPath();
  ctx.ellipse(r * 1.02, -r * 0.47, r * 0.1, r * 0.07, -0.7, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function watermelon(ctx, r) {
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fillStyle = grad(ctx, -r * 0.3, -r * 0.3, r * 0.1, 0, 0, r, [
    [0, '#7be07a'], [0.5, '#2fa14a'], [1, '#14602b'],
  ]);
  ctx.fill();

  // gehri hari dhaariyan
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(10,70,25,0.55)';
  ctx.lineWidth = r * 0.14;
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * r * 0.3;
    ctx.beginPath();
    ctx.moveTo(x * 0.4, -r);
    ctx.bezierCurveTo(x * 1.6, -r * 0.4, x * 1.6, r * 0.4, x * 0.4, r);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = '#5a6b2a';
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.97, r * 0.09, r * 0.05, 0, 0, TAU);
  ctx.fill();

  gloss(ctx, -r * 0.4, -r * 0.4, r * 0.22, r * 0.11, -0.7, 0.35);
}

function strawberry(ctx, r) {
  ctx.save();
  ctx.translate(0, r * 0.05);

  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(0, r * 0.95);
    ctx.bezierCurveTo(-r * 0.5, r * 0.7, -r * 0.95, r * 0.1, -r * 0.85, -r * 0.35);
    ctx.bezierCurveTo(-r * 0.75, -r * 0.85, -r * 0.2, -r * 0.8, 0, -r * 0.6);
    ctx.bezierCurveTo(r * 0.2, -r * 0.8, r * 0.75, -r * 0.85, r * 0.85, -r * 0.35);
    ctx.bezierCurveTo(r * 0.95, r * 0.1, r * 0.5, r * 0.7, 0, r * 0.95);
    ctx.closePath();
  };

  shape();
  ctx.fillStyle = grad(ctx, -r * 0.3, -r * 0.2, r * 0.1, 0, 0, r * 1.1, [
    [0, '#ff6b6b'], [0.5, '#e5173f'], [1, '#a00b2b'],
  ]);
  ctx.fill();

  // beej
  ctx.save();
  shape();
  ctx.clip();
  for (let row = 0; row < 8; row++) {
    const y = -r * 0.4 + row * r * 0.18;
    for (let c = 0; c < 6; c++) {
      const x = (-0.75 + (c + (row % 2) * 0.5) * 0.3) * r;
      seedAt(ctx, x, y + r * 0.025, r * 0.03, r * 0.05, 0, 'rgba(110,0,20,0.45)');
      seedAt(ctx, x, y, r * 0.025, r * 0.045, 0, '#ffe58f');
    }
  }
  ctx.restore();

  gloss(ctx, -r * 0.4, -r * 0.2, r * 0.12, r * 0.3, 0.2, 0.35);

  // hara crown
  for (const a of [-1.0, -0.5, 0, 0.5, 1.0]) {
    ctx.save();
    ctx.translate(0, -r * 0.62);
    ctx.rotate(a);
    ctx.fillStyle = '#3da34a';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.2, r * 0.12, r * 0.28, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = '#4b6b2a';
  ctx.lineWidth = r * 0.07;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.62);
  ctx.lineTo(r * 0.05, -r * 1.0);
  ctx.stroke();
  ctx.restore();
}

function kiwi(ctx, r, rand) {
  ctx.save();
  ctx.rotate(-0.3);

  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.88, 0, 0, TAU);
  ctx.fillStyle = grad(ctx, -r * 0.3, -r * 0.3, r * 0.1, 0, 0, r, [
    [0, '#c9a06a'], [0.6, '#92643a'], [1, '#5e3b1e'],
  ]);
  ctx.fill();

  // chhilke par rue (hairs)
  ctx.save();
  ctx.clip();
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 110; i++) {
    const a = rand() * TAU;
    const d = Math.sqrt(rand()) * r;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d * 0.88;
    const ang = rand() * TAU;
    const len = r * (0.05 + rand() * 0.06);
    ctx.strokeStyle = rand() > 0.5 ? 'rgba(60,35,15,0.5)' : 'rgba(225,190,140,0.5)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = '#4a2c12';
  ctx.beginPath();
  ctx.ellipse(r * 0.95, 0, r * 0.06, r * 0.1, 0, 0, TAU);
  ctx.fill();

  gloss(ctx, -r * 0.4, -r * 0.35, r * 0.2, r * 0.1, -0.5, 0.25);
  ctx.restore();
}

function pineapple(ctx, r) {
  // crown pehle (peeche)
  ctx.save();
  ctx.translate(0, -r * 0.6);
  const leaves = [-0.95, -0.6, -0.3, 0, 0.3, 0.6, 0.95];
  leaves.sort((a, b) => Math.abs(b) - Math.abs(a));
  for (const a of leaves) {
    ctx.save();
    ctx.rotate(a);
    const len = r * (0.78 + 0.12 * (1 - Math.abs(a)));
    ctx.beginPath();
    ctx.moveTo(-r * 0.11, 0);
    ctx.quadraticCurveTo(-r * 0.14, -len * 0.55, 0, -len);
    ctx.quadraticCurveTo(r * 0.14, -len * 0.55, r * 0.11, 0);
    ctx.closePath();
    ctx.fillStyle = Math.abs(a) > 0.7 ? '#1f6b2c' : Math.abs(a) > 0.3 ? '#2e8b3d' : '#3fae49';
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // body
  ctx.save();
  ctx.translate(0, r * 0.2);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.72, r * 0.88, 0, 0, TAU);
  ctx.fillStyle = grad(ctx, -r * 0.25, -r * 0.3, r * 0.1, 0, 0, r, [
    [0, '#ffd54a'], [0.5, '#e8a317'], [1, '#a86a0a'],
  ]);
  ctx.fill();

  ctx.save();
  ctx.clip();
  const d = r * 0.36;
  ctx.strokeStyle = 'rgba(110,60,0,0.55)';
  ctx.lineWidth = r * 0.05;
  for (let k = -6; k <= 6; k++) {
    ctx.beginPath();
    ctx.moveTo(-r, k * d - r);
    ctx.lineTo(r, k * d + r);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r, k * d + r);
    ctx.lineTo(r, k * d - r);
    ctx.stroke();
  }
  // har diamond ke beech chhota dot
  ctx.fillStyle = 'rgba(90,50,0,0.6)';
  for (let n = -6; n <= 6; n++) {
    for (let m = -6; m <= 6; m++) {
      if (Math.abs(n + m) % 2 === 1) {
        ctx.beginPath();
        ctx.arc((n * d) / 2, (m * d) / 2, r * 0.045, 0, TAU);
        ctx.fill();
      }
    }
  }
  ctx.restore();

  gloss(ctx, -r * 0.35, -r * 0.35, r * 0.14, r * 0.3, 0.2, 0.3);
  ctx.restore();
}

/* ---------- kate hue fruit ka andar ka design (poori disc, half clip baad mein) ---------- */

function appleIn(ctx, r) {
  disc(ctx, r, '#c4202b');
  disc(ctx, r * 0.93, grad(ctx, 0, 0, r * 0.1, 0, 0, r * 0.93, [[0, '#fffbe3'], [1, '#f2e5a6']]));

  ctx.strokeStyle = 'rgba(190,160,70,0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35);
    ctx.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85);
    ctx.stroke();
  }

  ctx.fillStyle = '#ecdc8a';
  ctx.strokeStyle = '#c9b85a';
  ctx.lineWidth = r * 0.03;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.26, r * 0.38, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();

  seedAt(ctx, -r * 0.08, -r * 0.1, r * 0.09, r * 0.05, 1.2, '#5a3414');
  seedAt(ctx, r * 0.09, r * 0.1, r * 0.09, r * 0.05, 1.9, '#5a3414');
}

function orangeIn(ctx, r) {
  disc(ctx, r, '#ff8a14');
  disc(ctx, r * 0.9, '#fff1cf');

  const N = 10;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * TAU + 0.05;
    const a1 = ((i + 1) / N) * TAU - 0.05;
    const am = (a0 + a1) / 2;

    ctx.beginPath();
    ctx.moveTo(Math.cos(am) * r * 0.06, Math.sin(am) * r * 0.06);
    ctx.arc(0, 0, r * 0.8, a0, a1);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, 0, 0, r * 0.1, 0, 0, r * 0.8, [[0, '#ffb347'], [1, '#ff9a1f']]);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,230,160,0.45)';
    ctx.lineWidth = 1.2;
    for (let k = 0; k < 3; k++) {
      const aa = a0 + (a1 - a0) * (0.25 + k * 0.25);
      ctx.beginPath();
      ctx.moveTo(Math.cos(aa) * r * 0.25, Math.sin(aa) * r * 0.25);
      ctx.lineTo(Math.cos(aa) * r * 0.7, Math.sin(aa) * r * 0.7);
      ctx.stroke();
    }
  }
}

function bananaIn(ctx, r) {
  disc(ctx, r, '#f0cf3a');
  disc(ctx, r * 0.88, grad(ctx, 0, 0, r * 0.1, 0, 0, r * 0.88, [[0, '#fffbe6'], [1, '#f7e9b4']]));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU + 0.5;
    seedAt(ctx, Math.cos(a) * r * 0.14, Math.sin(a) * r * 0.14, r * 0.035, r * 0.03, 0, '#6b4a1a');
  }
}

function watermelonIn(ctx, r, rand) {
  disc(ctx, r, '#1f7a35');
  disc(ctx, r * 0.93, '#9fe3a0');
  disc(ctx, r * 0.88, '#f4ffe9');
  disc(ctx, r * 0.82, grad(ctx, 0, 0, r * 0.05, 0, 0, r * 0.82, [
    [0, '#ff9aa5'], [0.55, '#ff3d5a'], [1, '#e0193e'],
  ]));

  // kaale beej, do ring mein
  for (const [count, dist] of [[8, 0.55], [5, 0.25]]) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + rand() * 0.4;
      const d = r * dist * (0.9 + rand() * 0.2);
      seedAt(ctx, Math.cos(a) * d, Math.sin(a) * d, r * 0.07, r * 0.035, a, '#1b1b1b');
    }
  }
}

function strawberryIn(ctx, r) {
  disc(ctx, r, '#d6153b');
  disc(ctx, r * 0.92, grad(ctx, 0, 0, r * 0.05, 0, 0, r * 0.92, [
    [0, '#fff1f1'], [0.25, '#ffc4cc'], [0.6, '#ff4c6d'], [1, '#e0183f'],
  ]));

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.18, Math.sin(a) * r * 0.18);
    ctx.lineTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8);
    ctx.stroke();
  }
  gloss(ctx, 0, 0, r * 0.14, r * 0.2, 0, 0.55);
}

function kiwiIn(ctx, r, rand) {
  disc(ctx, r, '#7a5230');
  disc(ctx, r * 0.94, grad(ctx, 0, 0, r * 0.05, 0, 0, r * 0.94, [
    [0, '#f3f9c4'], [0.2, '#cdeb7a'], [1, '#6fb81f'],
  ]));

  ctx.strokeStyle = 'rgba(240,255,200,0.45)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2);
    ctx.lineTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,235,0.92)';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.2, r * 0.14, 0, 0, TAU);
  ctx.fill();

  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * TAU + rand() * 0.1;
    const d = r * (0.36 + rand() * 0.04);
    seedAt(ctx, Math.cos(a) * d, Math.sin(a) * d, r * 0.045, r * 0.022, a, '#161616');
  }
}

function pineappleIn(ctx, r) {
  disc(ctx, r, '#b9801a');
  disc(ctx, r * 0.93, grad(ctx, 0, 0, r * 0.1, 0, 0, r * 0.93, [
    [0, '#fff3a8'], [0.6, '#ffd84a'], [1, '#f2b20e'],
  ]));

  ctx.strokeStyle = 'rgba(200,140,0,0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.28, Math.sin(a) * r * 0.28);
    ctx.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85);
    ctx.stroke();
  }

  ctx.fillStyle = '#fff6c9';
  ctx.strokeStyle = '#f0d36a';
  ctx.lineWidth = r * 0.03;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.24, 0, TAU);
  ctx.fill();
  ctx.stroke();
}

const WHOLE = { apple, orange, banana, watermelon, strawberry, kiwi, pineapple };
const INSIDE = {
  apple: appleIn, orange: orangeIn, banana: bananaIn, watermelon: watermelonIn,
  strawberry: strawberryIn, kiwi: kiwiIn, pineapple: pineappleIn,
};

/* ---------- sprites: ek baar draw karo, baar-baar sasta drawImage karo ---------- */

function makeSprite(size, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(size * S);
  canvas.height = Math.ceil(size * S);
  const ctx = canvas.getContext('2d');
  ctx.scale(S, S);
  ctx.translate(size / 2, size / 2);
  drawFn(ctx);
  return { canvas, size };
}

export function makeFruitSprite(name, r, seed) {
  const rand = rng(seed);
  const fn = WHOLE[name] || orange;
  return makeSprite(r * 3, (ctx) => fn(ctx, r, rand));
}

export function makeInteriorSprite(name, r, seed) {
  const rand = rng(seed);
  const fn = INSIDE[name] || orangeIn;
  return makeSprite(r * 2 + 4, (ctx) => fn(ctx, r, rand));
}

export function drawSprite(ctx, sprite) {
  ctx.drawImage(sprite.canvas, -sprite.size / 2, -sprite.size / 2, sprite.size, sprite.size);
}