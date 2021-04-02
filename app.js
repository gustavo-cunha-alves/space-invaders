const $ = (query) => document.querySelector(query);
const canvas = $('canvas');
const DELAY_MOVING = 500;

function sleep(ms) {
  return new Promise(resolve => {
    return setTimeout(resolve, ms);
  })
}

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

    if (this.isAlive)
      this.draw();
  }
}

class Player extends Element {
  constructor(x, y) {
    super(x, y, 'green');
    this.draw(x, y);
  }

  async shoot(invaders) {
    const shot = new Shot(this.x, this.y - 30);
    while (shot.y > -30) {
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
      }
      await sleep(100);
    }
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
    this[this.direction]();
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
    if (this.isMovingToRight)
      this.direction = 'moveRight';
    else
      this.direction = 'moveLeft';
  }
}

class Game {
  constructor(invadersController, player) {
    this.invadersController = invadersController;
    this.player = player;
  }

  async play() {
    alert('INSTRUÇÕES DO JOGO:\n\nSeta direita: Mover\nSeta esquerda: Mover\nBarra de espaço: Atirar\n\nNão deixe os invasores alcançarem a base!')
    this.enablePlayer();
    while (!this.isGameWon() && !this.isGameLost()) {
      invadersController.move();
      await sleep(DELAY_MOVING);
    }
    if(this.isGameWon()){
      alert('Parabéns! Você impediu o ataque dos invasores!\n\nRecarregue a página para jogar novamente.');
    }
    if(this.isGameLost()){
      alert('Essa não! Os invasores alcançaram a base! :/\n\nRecarregue a página para jogar novamente.');
    }
  }

  isGameWon() {
    const livingInvaders = this.invadersController.invaders.filter(invader => {
      return invader.isAlive ? invader : undefined;
    })
    return livingInvaders.length === 0;
  }

  isGameLost() {
    return this.invadersController.invaders[this.invadersController.invaders.length-1].y === canvas.height-30;
  }

  enablePlayer() {
    document.addEventListener('keyup', async (event) => {
      switch (event.key) {
        case "ArrowRight":
          this.player.moveRight();
          break;
        case "ArrowLeft":
          this.player.moveLeft();
          break;
        case " ":
          await this.player.shoot(invadersController.invaders);
          break;
      }
    });
  }
}

const player = new Player(180, 570);
const invadersController = new InvadersController(10);
const game = new Game(invadersController, player);
game.play();
