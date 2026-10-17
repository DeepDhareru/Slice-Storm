export const FRUITS = [
  { name: 'apple',      color: '#ff4d4d', dark: '#a30f1c', flesh: '#fff6d6', score: 10, size: 1.0,  weight: 30 },
  { name: 'orange',     color: '#ffb347', dark: '#d9640b', flesh: '#ffd37a', score: 15, size: 1.05, weight: 25 },
  { name: 'banana',     color: '#ffe55c', dark: '#d4a90a', flesh: '#fff3b8', score: 20, size: 0.95, weight: 15 },
  { name: 'watermelon', color: '#5ad36b', dark: '#1b7a34', flesh: '#ff4f6a', score: 25, size: 1.6,  weight: 8 },
  { name: 'strawberry', color: '#ff6b81', dark: '#b3123a', flesh: '#ffc2cc', score: 12, size: 0.8,  weight: 20 },
  { name: 'kiwi',       color: '#9ccc3c', dark: '#5a7d12', flesh: '#b8e65c', score: 18, size: 0.9,  weight: 15 },
  { name: 'pineapple',  color: '#f4c430', dark: '#b8860b', flesh: '#fff0a0', score: 30, size: 1.4,  weight: 7 },
];

const TOTAL = FRUITS.reduce((sum, f) => sum + f.weight, 0);

// weight jitna zyada, fruit utni zyada baar aayega
export function pickFruit() {
  let n = Math.random() * TOTAL;
  for (const f of FRUITS) {
    n -= f.weight;
    if (n <= 0) return f;
  }
  return FRUITS[0];
}