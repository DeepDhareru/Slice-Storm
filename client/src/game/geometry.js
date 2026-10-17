// line segment (x1,y1 -> x2,y2) circle (cx,cy,r) ko chhooti hai ya nahi
export function segmentHitsCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  // circle ke centre ke sabse paas wala point, segment ke upar
  let t = lenSq === 0 ? 0 : ((cx - x1) * dx + (cy - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const px = x1 + t * dx;
  const py = y1 + t * dy;
  const ddx = cx - px;
  const ddy = cy - py;
  return ddx * ddx + ddy * ddy <= r * r;
}