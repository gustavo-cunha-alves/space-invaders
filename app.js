const $ = (query) => document.querySelector(query);
const canvas = $('canvas');
const DELAY_MOVING = 500;

class Element {
  constructor(x, y, color) {
    this.width = 30;
    this.height = 30;
    this.x = x;
    this.y = y;
    this.color = color;
    this.isAlive = true;
    this.ctx = canvas.getContext('2d');
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  clearDraw() {
    this.ctx.clearRect(this.x, this.y, this.width, this.height);
  }

  moveRight() {
    this.clearDraw();
    if (this.x + 30 < canvas.width)
      this.x += 30;

    if (this.isAlive)
      this.draw();

  }

  moveLeft() {
    this.clearDraw();
    if (this.x - 30 >= 0)
      this.x -= 30;

    if (this.isAlive)
      this.draw();
  }
}

class Shot extends Element {
  constructor(x, y) {
    super(x, y, 'orange');
  }

  moveUp() {
    this.clearDraw();
    if (this.y >= 0) {
      this.y -= 30;
    } else {
      this.isAlive = false;
    }
    this.draw();
  }

  isHitInvader(invader) {
    return this.isAlive &&
      invader.isAlive &&
      this.x === invader.x &&
      this.y === invader.y
  }
}

class Invader extends Element {
  constructor(x, y) {
    super(x, y, 'white');
    this.isAlive = true;
  }

  moveDown() {
    this.clearDraw();
    this.y += 30;

    if (this.isAlive) {
      this.draw();
    }
  }
}

class Player extends Element {
  constructor(x, y) {
    super(x, y, 'green');
    this.draw(x, y);
  }

  shoot(invaders) {
    const shot = new Shot(this.x, this.y - 30);
    setInterval(() => {
      invaders.map(invader => {
        if (shot.isHitInvader(invader)) {
          invader.isAlive = false;
          shot.isAlive = false;
        }
      });

      if (shot.isAlive) {
        shot.moveUp();
      } else {
        shot.clearDraw();
        shot.y = -30;
        clearInterval(this)
      }
    }, 100)
  }
}

class InvadersController {
  constructor(maxInvaders) {
    this.invaders = this.generateInvaders(maxInvaders);
    this.isMovingToRight = true;
    this.direction = 'moveRight';
  }

  generateInvaders(maxInvaders) {
    const invaders = [];
    let x = 0;
    let y = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < maxInvaders; j++) {
        invaders.push(new Invader(x, y));
        x += 30;
      }
      x = 0;
      y += 30;
    }
    for (let i = 0; i < invaders.length; i++) {
      invaders[i].draw();
    }
    return invaders;
  }

  move() {
    setInterval(() => {
      this[this.direction]();
    }, DELAY_MOVING)
  }

  moveRight() {
    for (let i = this.invaders.length - 1; i >= 0; i--) {
      this.invaders[i].moveRight();
    }
    if (this.invaders[this.invaders.length - 1].x === canvas.width - 30) {
      this.direction = 'moveDown';
      this.isMovingToRight = false;
    }
  }

  moveLeft() {
    for (let i = 0; i < this.invaders.length; i++) {
      this.invaders[i].moveLeft();
    }
    if (this.invaders[0].x === 0) {
      this.direction = 'moveDown'
      this.isMovingToRight = true;
    }
  }

  moveDown() {
    for (let i = this.invaders.length - 1; i >= 0; i--) {
      this.invaders[i].moveDown();
    }
    if(this.isMovingToRight){
      this.direction = 'moveRight';
    }else{
      this.direction = 'moveLeft';
    }
  }
}

const invadersController = new InvadersController(10);
invadersController.move();

const player = new Player(180, 570);

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case "ArrowRight":
      player.moveRight();
      break;
    case "ArrowLeft":
      player.moveLeft();
      break;
    case " ":
      player.shoot(invadersController.invaders);
      break;
  }
});
