import { makeFruitSprite, drawSprite } from './fruitArt';

export default class Fruit {
  constructor(type, r, x, y, vx, vy) {
    this.type = type;
    this.r = r;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() * 2 - 1) * 4; // radian per second

    // seed se bahar aur kate hue andar ka design match karta hai
    this.seed = Math.floor(Math.random() * 1e9);
    this.sprite = makeFruitSprite(type.name, r, this.seed);
  }

  update(dt, gravity) {
    this.vy += gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.angle += this.spin * dt;
  }

  // neeche girke screen se bahar nikal gaya
  isGone(height) {
    return this.y - this.r > height && this.vy > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    drawSprite(ctx, this.sprite);
    ctx.restore();
  }
}