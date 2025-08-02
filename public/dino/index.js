// Unified Dino Game
  class Cactus {
    constructor(ctx, x, y, width, height, image) {
      this.ctx = ctx;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.image = image;
    }

    update(speed, gameSpeed, frameTimeDelta, scaleRatio) {
      this.x -= speed * gameSpeed * frameTimeDelta * scaleRatio;
    }

    draw() {
      this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    collideWith(sprite) {
      const adjustBy = 1.4;
      return (
        sprite.x < this.x + this.width / adjustBy &&
        sprite.x + sprite.width / adjustBy > this.x &&
        sprite.y < this.y + this.height / adjustBy &&
        sprite.height + sprite.y / adjustBy > this.y
      );
    }
  }

  class CactiController {
    CACTUS_INTERVAL_MIN = 500;
    CACTUS_INTERVAL_MAX = 2000;
    nextCactusInterval = null;
    cacti = [];

    constructor(ctx, cactiImages, scaleRatio, speed) {
      this.ctx = ctx;
      this.canvas = ctx.canvas;
      this.cactiImages = cactiImages;
      this.scaleRatio = scaleRatio;
      this.speed = speed;
      this.setNextCactusTime();
    }

    setNextCactusTime() {
      this.nextCactusInterval = this.getRandomNumber(
        this.CACTUS_INTERVAL_MIN,
        this.CACTUS_INTERVAL_MAX
      );
    }

    getRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    createCactus() {
      const index = this.getRandomNumber(0, this.cactiImages.length - 1);
      const cactusImage = this.cactiImages[index];
      const x = this.canvas.width * 1.5;
      const y = this.canvas.height - cactusImage.height;
      this.cacti.push(new Cactus(this.ctx, x, y, cactusImage.width, cactusImage.height, cactusImage.image));
    }

    update(gameSpeed, frameTimeDelta) {
      if (this.nextCactusInterval <= 0) {
        this.createCactus();
        this.setNextCactusTime();
      }
      this.nextCactusInterval -= frameTimeDelta;
      this.cacti.forEach((c) => c.update(this.speed, gameSpeed, frameTimeDelta, this.scaleRatio));
      this.cacti = this.cacti.filter((c) => c.x > -c.width);
    }

    draw() {
      this.cacti.forEach((c) => c.draw());
    }

    collideWith(sprite) {
      return this.cacti.some((c) => c.collideWith(sprite));
    }

    reset() {
      this.cacti = [];
    }
  }

  class Ground {
    constructor(ctx, width, height, speed, scaleRatio) {
      this.ctx = ctx;
      this.canvas = ctx.canvas;
      this.width = width;
      this.height = height;
      this.speed = speed;
      this.scaleRatio = scaleRatio;
      this.x = 0;
      this.y = this.canvas.height - this.height;
      this.groundImage = new Image();
      this.groundImage.src = "images/ground.png";
    }

    update(gameSpeed, frameTimeDelta) {
      this.x -= gameSpeed * frameTimeDelta * this.speed * this.scaleRatio;
      if (this.x < -this.width) this.x = 0;
    }

    draw() {
      this.ctx.drawImage(this.groundImage, this.x, this.y, this.width, this.height);
      this.ctx.drawImage(this.groundImage, this.x + this.width, this.y, this.width, this.height);
    }

    reset() {
      this.x = 0;
    }
  }

  class Player {
    WALK_ANIMATION_TIMER = 200;
    walkAnimationTimer = this.WALK_ANIMATION_TIMER;
    dinoRunImages = [];

    jumpPressed = false;
    jumpInProgress = false;
    falling = false;
    JUMP_SPEED = 0.6;
    GRAVITY = 0.4;

    constructor(ctx, width, height, minJumpHeight, maxJumpHeight, scaleRatio) {
      this.ctx = ctx;
      this.canvas = ctx.canvas;
      this.width = width;
      this.height = height;
      this.minJumpHeight = minJumpHeight;
      this.maxJumpHeight = maxJumpHeight;
      this.scaleRatio = scaleRatio;

      this.x = 10 * scaleRatio;
      this.yStandingPosition = this.canvas.height - this.height - 1.5 * scaleRatio;
      this.y = this.yStandingPosition;

      this.standingStillImage = new Image();
      this.standingStillImage.src = "images/standing_still.png";
      this.image = this.standingStillImage;

      const dinoRun1 = new Image(); dinoRun1.src = "images/dino_run1.png";
      const dinoRun2 = new Image(); dinoRun2.src = "images/dino_run2.png";
      this.dinoRunImages.push(dinoRun1, dinoRun2);

      window.addEventListener("keydown", this.keydown.bind(this));
      window.addEventListener("keyup", this.keyup.bind(this));
      window.addEventListener("touchstart", this.touchstart.bind(this));
      window.addEventListener("touchend", this.touchend.bind(this));
    }

    keydown(e) { if (e.code === "Space") this.jumpPressed = true; }
    keyup(e) { if (e.code === "Space") this.jumpPressed = false; }
    touchstart() { this.jumpPressed = true; }
    touchend() { this.jumpPressed = false; }

    update(gameSpeed, frameTimeDelta) {
      this.run(gameSpeed, frameTimeDelta);
      if (this.jumpInProgress) this.image = this.standingStillImage;
      this.jump(frameTimeDelta);
    }

    jump(frameTimeDelta) {
      if (this.jumpPressed && !this.jumpInProgress && !this.falling) {
        this.jumpInProgress = true;
      }

      if (this.jumpInProgress && !this.falling) {
        const min = this.y > this.canvas.height - this.minJumpHeight;
        const max = this.y > this.canvas.height - this.maxJumpHeight && this.jumpPressed;
        if (min || max) {
          this.y -= this.JUMP_SPEED * frameTimeDelta * this.scaleRatio;
        } else {
          this.falling = true;
        }
      } else {
        if (this.y < this.yStandingPosition) {
          this.y += this.GRAVITY * frameTimeDelta * this.scaleRatio;
          if (this.y > this.yStandingPosition) this.y = this.yStandingPosition;
        } else {
          this.falling = false;
          this.jumpInProgress = false;
        }
      }
    }

    run(gameSpeed, frameTimeDelta) {
      if (this.walkAnimationTimer <= 0) {
        this.image = this.image === this.dinoRunImages[0] ? this.dinoRunImages[1] : this.dinoRunImages[0];
        this.walkAnimationTimer = this.WALK_ANIMATION_TIMER;
      }
      this.walkAnimationTimer -= frameTimeDelta * gameSpeed;
    }

    draw() {
      this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    cleanup() {
      window.removeEventListener("keydown", this.keydown);
      window.removeEventListener("keyup", this.keyup);
      window.removeEventListener("touchstart", this.touchstart);
      window.removeEventListener("touchend", this.touchend);
    }
  }

  let canvas, ctx;

  const GAME_SPEED_START = 1;
  const GAME_SPEED_INCREMENT = 0.00001;

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 200;
  const PLAYER_WIDTH = 88 / 1.5;
  const PLAYER_HEIGHT = 94 / 1.5;
  const MAX_JUMP_HEIGHT = GAME_HEIGHT;
  const MIN_JUMP_HEIGHT = 150;
  const GROUND_WIDTH = 2400;
  const GROUND_HEIGHT = 24;
  const GROUND_AND_CACTUS_SPEED = 0.5;

  const CACTI_CONFIG = [
    { width: 48 / 1.5, height: 100 / 1.5, image: "images/cactus_1.png" },
    { width: 98 / 1.5, height: 100 / 1.5, image: "images/cactus_2.png" },
    { width: 68 / 1.5, height: 70 / 1.5, image: "images/cactus_3.png" },
  ];

  // Game state
  let player = null;
  let ground = null;
  let cactiController = null;

  let scaleRatio = null;
  let previousTime = null;
  let gameSpeed = GAME_SPEED_START;
  let gameOver = false;
  let hasAddedEventListenersForRestart = false;
  let onGameOverCallback = null;
  let waitingToStart = true; // Only start game after user clicks

  function getScaleRatio() {
    const screenHeight = Math.min(
      window.innerHeight,
      document.documentElement.clientHeight
    );
    const screenWidth = Math.min(
      window.innerWidth,
      document.documentElement.clientWidth
    );
    return screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT
      ? screenWidth / GAME_WIDTH
      : screenHeight / GAME_HEIGHT;
  }

  function createSprites() {
    const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
    const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
    const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
    const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;
    const groundWidthInGame = GROUND_WIDTH * scaleRatio;
    const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

    player = new Player(
      ctx,
      playerWidthInGame,
      playerHeightInGame,
      minJumpHeightInGame,
      maxJumpHeightInGame,
      scaleRatio
    );

    ground = new Ground(
      ctx,
      groundWidthInGame,
      groundHeightInGame,
      GROUND_AND_CACTUS_SPEED,
      scaleRatio
    );

    const cactiImages = CACTI_CONFIG.map((cactus) => {
      const image = new Image();
      image.src = cactus.image;
      return {
        image: image,
        width: cactus.width * scaleRatio,
        height: cactus.height * scaleRatio,
      };
    });

    cactiController = new CactiController(
      ctx,
      cactiImages,
      scaleRatio,
      GROUND_AND_CACTUS_SPEED
    );
  }

  function setScreen() {
    scaleRatio = getScaleRatio();
    canvas.width = GAME_WIDTH * scaleRatio;
    canvas.height = GAME_HEIGHT * scaleRatio;
    createSprites();
  }

  function showGameOver() {
    const fontSize = 70 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "grey";
    const x = canvas.width / 3.8;
    const y = canvas.height / 2;
    ctx.fillText("YOU DIED!", x, y);
  }

  function clearScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function updateGameSpeed(delta) {
    gameSpeed += delta * GAME_SPEED_INCREMENT;
  }

  function reset() {
    hasAddedEventListenersForRestart = false;
    gameOver = false;
    waitingToStart = false;
    player.cleanup();
    createSprites();
    gameSpeed = GAME_SPEED_START;
    previousTime = null;
    requestAnimationFrame(gameLoop);
  }

  function setupGameReset() {
  if (hasAddedEventListenersForRestart) return;
  hasAddedEventListenersForRestart = true;

  const restart = (e) => {
    // // Only restart on Space key, mouse click, or touch
    // if (
    //   (e.type === "keydown" && e.code !== "Space") ||
    //   (e.type === "mousedown" && e.button !== 0)
    // ) {
    //   return;
    // }
    // // Prevent restart if not on game over screen
    // if (!gameOver) return;

    // window.removeEventListener("keydown", restart);
    // window.removeEventListener("mousedown", restart);
    // window.removeEventListener("touchstart", restart);
    // hasAddedEventListenersForRestart = false;
    // reset();
    return;
  };

  window.addEventListener("keydown", restart);
  window.addEventListener("mousedown", restart);
  window.addEventListener("touchstart", restart);
}

  let pausedByParent = false;
  let pauseOverlay = null;
  let animationFrameId = null;

  function showPauseOverlay() {
    if (!pauseOverlay) {
      pauseOverlay = document.createElement("div");
      pauseOverlay.style.position = "fixed";
      pauseOverlay.style.inset = "0";
      pauseOverlay.style.zIndex = "10000";
      pauseOverlay.style.background = "black";
      pauseOverlay.style.pointerEvents = "auto";
      document.body.appendChild(pauseOverlay);
    }
  }

  function hidePauseOverlay() {
    if (pauseOverlay) {
      document.body.removeChild(pauseOverlay);
      pauseOverlay = null;
    }
  }

  function pauseGameLoop() {
    pausedByParent = true;
    showPauseOverlay();
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function resumeGameLoop() {
    if (pausedByParent) {
      pausedByParent = false;
      hidePauseOverlay();
      requestAnimationFrame(gameLoop);
    }
  }

  // Listen for parent messages
  window.addEventListener("message", (e) => {
    if (e.data === "PAUSE") {
      pauseGameLoop();
    } else if (e.data === "RESUME") {
      resumeGameLoop();
    }
  });

  // Patch gameLoop to use animationFrameId
  function gameLoop(currentTime) {
  if (pausedByParent) return;
  animationFrameId = requestAnimationFrame(gameLoop);

  if (waitingToStart) return;

  if (previousTime === null) {
    previousTime = currentTime;
    return;
  }

  const delta = currentTime - previousTime;
  previousTime = currentTime;

  if (!gameOver) {
    clearScreen(); // <-- Only clear when game is active

    ground.update(gameSpeed, delta);
    cactiController.update(gameSpeed, delta);
    player.update(gameSpeed, delta);

    ground.draw();
    cactiController.draw();
    player.draw();

    updateGameSpeed(delta);

    if (cactiController.collideWith(player)) {
      gameOver = true;
      showGameOver();
      setupGameReset();
      if (onGameOverCallback) onGameOverCallback();
      window.parent.postMessage('GAME_OVER', '*');
    }
  } else {
    // Do not clear the screen or update game objects
    showGameOver(); // Only draw "GAME OVER" on top of last frame
  }
}

  export function setupGame({ onGameOver } = {}) {
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    onGameOverCallback = onGameOver || null;

    setScreen();

    if (screen.orientation) {
      screen.orientation.addEventListener("change", setScreen);
    }
    window.addEventListener("resize", () => setTimeout(setScreen, 500));

    // Don't start gameLoop here, it's started in DOMContentLoaded and waits for waitingToStart
  }

  // Get song ID from URL
  const getSongIdFromUrl = () => {
    const path = window.location.pathname;
    const match = path.match(/\/play\/(\d+)/);
    return match ? match[1] : '1'; // Default to song 1 if no ID found
  };

  const songId = getSongIdFromUrl();
  console.log(`Playing song with ID: ${songId}`); 
  const music = new Audio(`assets/songs/${songId}.mp3`);
  music.loop = true;

  // Start music on first user interaction
  let musicStarted = false;
  function startMusic() {
    if (!musicStarted) {
      musicStarted = true;
      music.play().catch(e => console.warn("Music play failed:", e));
    }
  }

  function showClickToPlay() {
    if (!canvas || !ctx) return;
    clearScreen();
    const fontSize = 70 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "grey";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Click to play", canvas.width / 2, canvas.height / 2);
  }

window.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  setScreen();
  setupGame();

  // Simulate actual click + focus
  canvas.click();
  canvas.focus();

  // Start everything immediately
  waitingToStart = false;
  startMusic();
  window.parent?.postMessage?.('GAME_STARTED', '*');
  requestAnimationFrame(gameLoop);
});

