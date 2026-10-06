/**
 * Cyber Defender - Interactive HTML5 Canvas Arcade Mini-Game
 * Demonstrates Game Loop, 2D Vector Physics, Collision Detection, 
 * Particle Systems, and Web Audio API synthesis in pure Vanilla JavaScript.
 */

class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  laser() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch (e) {}
  }

  explode() {
    if (this.muted || !this.ctx) return;
    try {
      // Noise buffer for explosion
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.25);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  scorePing() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {}
  }
}

class CyberDefenderGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundFX();

    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('cyber_defender_highscore') || '0', 10);
    this.lives = 3;
    this.wave = 1;
    this.lastTime = 0;

    this.keys = {
      ArrowUp: false,
      ArrowLeft: false,
      ArrowRight: false,
      Space: false,
      KeyW: false,
      KeyA: false,
      KeyD: false
    };

    this.ship = null;
    this.lasers = [];
    this.asteroids = [];
    this.particles = [];
    this.floatingTexts = [];

    this.initCanvasSize();
    this.bindEvents();
    this.resetShip();
    this.renderIntroScreen();
  }

  initCanvasSize() {
    const container = this.canvas.parentElement;
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = rect.width * dpr;
      this.canvas.height = 420 * dpr;
      this.ctx.scale(dpr, dpr);
      this.width = rect.width;
      this.height = 420;
    };
    updateSize();
    window.addEventListener('resize', () => {
      updateSize();
      if (!this.isRunning) this.renderIntroScreen();
    });
  }

  resetShip() {
    this.ship = {
      x: this.width / 2,
      y: this.height / 2,
      radius: 14,
      angle: -Math.PI / 2,
      rotationSpeed: 4.8,
      thrust: 0,
      maxSpeed: 7,
      drag: 0.985,
      vx: 0,
      vy: 0,
      invulnerableTimer: 2.0,
      fireCooldown: 0
    };
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        // Prevent scrolling when playing inside the canvas viewport
        const rect = this.canvas.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          e.preventDefault();
        }
      }
      if (e.code === 'Space') {
        this.keys.Space = true;
        if (!this.isRunning) this.startGame();
      }
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') this.keys.Space = false;
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = false;
      }
    });

    // Touch controls on buttons
    const bindBtn = (id, key) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const press = (e) => {
        e.preventDefault();
        this.sound.init();
        if (!this.isRunning) this.startGame();
        this.keys[key] = true;
      };
      const release = (e) => {
        e.preventDefault();
        this.keys[key] = false;
      };
      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend', release, { passive: false });
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);
      btn.addEventListener('mouseleave', release);
    };

    bindBtn('game-ctrl-left', 'ArrowLeft');
    bindBtn('game-ctrl-right', 'ArrowRight');
    bindBtn('game-ctrl-thrust', 'ArrowUp');
    bindBtn('game-ctrl-fire', 'Space');

    // Canvas click to start or focus
    this.canvas.addEventListener('click', () => {
      this.sound.init();
      if (!this.isRunning) {
        this.startGame();
      }
    });

    // Audio toggle
    const audioBtn = document.getElementById('game-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.init();
        const isMuted = this.sound.toggleMute();
        audioBtn.innerHTML = isMuted 
          ? `<span class="icon">🔇</span> Sound: OFF`
          : `<span class="icon">🔊</span> Sound: ON`;
        audioBtn.classList.toggle('active', !isMuted);
      });
    }

    // Restart button
    const restartBtn = document.getElementById('game-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.init();
        this.startGame();
      });
    }
  }

  startGame() {
    this.sound.init();
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.isRunning = true;
    this.isPaused = false;
    this.lasers = [];
    this.asteroids = [];
    this.particles = [];
    this.floatingTexts = [];
    this.resetShip();
    this.spawnWave(4);
    this.lastTime = performance.now();
    this.updateHUD();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  spawnWave(count) {
    this.floatingTexts.push({
      text: `WAVE ${this.wave}`,
      x: this.width / 2,
      y: this.height / 2 - 40,
      life: 1.8,
      maxLife: 1.8,
      color: '#00f0ff',
      scale: 1.5
    });

    for (let i = 0; i < count; i++) {
      let x, y, dist;
      do {
        x = Math.random() * this.width;
        y = Math.random() * this.height;
        dist = Math.hypot(x - this.ship.x, y - this.ship.y);
      } while (dist < 140);

      this.spawnAsteroid(x, y, 32, 1);
    }
  }

  spawnAsteroid(x, y, radius, level) {
    const speed = (0.7 + Math.random() * 0.8) * (1 + (this.wave - 1) * 0.15);
    const angle = Math.random() * Math.PI * 2;
    const numPoints = 8 + Math.floor(Math.random() * 4);
    const offsets = [];
    for (let p = 0; p < numPoints; p++) {
      offsets.push(0.75 + Math.random() * 0.45);
    }

    this.asteroids.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      level,
      rot: 0,
      rotSpeed: (Math.random() - 0.5) * 1.5,
      numPoints,
      offsets,
      color: level === 1 ? '#a855f7' : level === 2 ? '#38bdf8' : '#34d399'
    });
  }

  fireLaser() {
    if (this.ship.fireCooldown > 0) return;
    this.ship.fireCooldown = 0.18; // Seconds between shots

    const noseX = this.ship.x + Math.cos(this.ship.angle) * (this.ship.radius + 4);
    const noseY = this.ship.y + Math.sin(this.ship.angle) * (this.ship.radius + 4);
    const speed = 10;

    this.lasers.push({
      x: noseX,
      y: noseY,
      vx: Math.cos(this.ship.angle) * speed + this.ship.vx * 0.3,
      vy: Math.sin(this.ship.angle) * speed + this.ship.vy * 0.3,
      life: 0.9,
      radius: 2.5
    });

    // Muzzle flash particle
    this.spawnMuzzleFlash(noseX, noseY, this.ship.angle);
    this.sound.laser();
  }

  spawnMuzzleFlash(x, y, angle) {
    for (let i = 0; i < 4; i++) {
      const spread = angle + (Math.random() - 0.5) * 0.5;
      const speed = 1 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(spread) * speed,
        vy: Math.sin(spread) * speed,
        life: 0.15,
        maxLife: 0.15,
        color: '#00f0ff',
        radius: 2
      });
    }
  }

  spawnExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        color: color || '#00f0ff',
        radius: 1.5 + Math.random() * 2.5
      });
    }
  }

  gameLoop(timestamp) {
    if (!this.isRunning) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    // Ship controls
    const isLeft = this.keys.ArrowLeft || this.keys.KeyA;
    const isRight = this.keys.ArrowRight || this.keys.KeyD;
    const isThrust = this.keys.ArrowUp || this.keys.KeyW;
    const isFire = this.keys.Space;

    if (isLeft) this.ship.angle -= this.ship.rotationSpeed * dt;
    if (isRight) this.ship.angle += this.ship.rotationSpeed * dt;

    if (isThrust) {
      const thrustPower = 7.5;
      this.ship.vx += Math.cos(this.ship.angle) * thrustPower * dt;
      this.ship.vy += Math.sin(this.ship.angle) * thrustPower * dt;

      // Thruster flame particles
      const tailX = this.ship.x - Math.cos(this.ship.angle) * this.ship.radius;
      const tailY = this.ship.y - Math.sin(this.ship.angle) * this.ship.radius;
      if (Math.random() < 0.6) {
        this.particles.push({
          x: tailX,
          y: tailY,
          vx: -Math.cos(this.ship.angle) * (2 + Math.random() * 3) + (Math.random() - 0.5) * 1.5,
          vy: -Math.sin(this.ship.angle) * (2 + Math.random() * 3) + (Math.random() - 0.5) * 1.5,
          life: 0.25,
          maxLife: 0.25,
          color: Math.random() > 0.5 ? '#00f0ff' : '#a855f7',
          radius: 1.8 + Math.random() * 1.5
        });
      }
    }

    if (isFire) {
      this.fireLaser();
    }

    // Cooldown
    if (this.ship.fireCooldown > 0) {
      this.ship.fireCooldown -= dt;
    }
    if (this.ship.invulnerableTimer > 0) {
      this.ship.invulnerableTimer -= dt;
    }

    // Apply drag and cap speed
    this.ship.vx *= Math.pow(this.ship.drag, dt * 60);
    this.ship.vy *= Math.pow(this.ship.drag, dt * 60);
    const speed = Math.hypot(this.ship.vx, this.ship.vy);
    if (speed > this.ship.maxSpeed) {
      this.ship.vx = (this.ship.vx / speed) * this.ship.maxSpeed;
      this.ship.vy = (this.ship.vy / speed) * this.ship.maxSpeed;
    }

    // Move ship & screen wrap
    this.ship.x += this.ship.vx;
    this.ship.y += this.ship.vy;
    this.wrapEntity(this.ship);

    // Update lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.x += l.vx;
      l.y += l.vy;
      this.wrapEntity(l);
      l.life -= dt;
      if (l.life <= 0) {
        this.lasers.splice(i, 1);
      }
    }

    // Update asteroids
    for (const a of this.asteroids) {
      a.x += a.vx;
      a.y += a.vy;
      a.rot += a.rotSpeed * dt;
      this.wrapEntity(a);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating score text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 25 * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Check Laser vs Asteroid collisions
    for (let li = this.lasers.length - 1; li >= 0; li--) {
      const l = this.lasers[li];
      for (let ai = this.asteroids.length - 1; ai >= 0; ai--) {
        const a = this.asteroids[ai];
        const dist = Math.hypot(l.x - a.x, l.y - a.y);
        if (dist < a.radius + l.radius) {
          // Hit!
          this.sound.explode();
          this.spawnExplosion(a.x, a.y, a.color, 18);
          
          const points = a.level === 1 ? 20 : a.level === 2 ? 50 : 100;
          this.score += points;
          this.floatingTexts.push({
            text: `+${points}`,
            x: a.x,
            y: a.y,
            life: 0.8,
            maxLife: 0.8,
            color: '#34d399',
            scale: 1
          });

          // Split asteroid if not at smallest level
          if (a.level < 3) {
            const nextLevel = a.level + 1;
            const nextRadius = a.radius * 0.58;
            this.spawnAsteroid(a.x, a.y, nextRadius, nextLevel);
            this.spawnAsteroid(a.x, a.y, nextRadius, nextLevel);
          }

          this.asteroids.splice(ai, 1);
          this.lasers.splice(li, 1);
          this.updateHUD();
          break;
        }
      }
    }

    // Check Ship vs Asteroid collisions
    if (this.ship.invulnerableTimer <= 0) {
      for (let ai = this.asteroids.length - 1; ai >= 0; ai--) {
        const a = this.asteroids[ai];
        const dist = Math.hypot(this.ship.x - a.x, this.ship.y - a.y);
        if (dist < a.radius + this.ship.radius - 2) {
          // Ship hit!
          this.sound.explode();
          this.spawnExplosion(this.ship.x, this.ship.y, '#f43f5e', 35);
          this.lives--;
          this.updateHUD();

          if (this.lives <= 0) {
            this.gameOver();
            return;
          } else {
            this.resetShip();
            this.floatingTexts.push({
              text: `${this.lives} LIVES REMAINING`,
              x: this.width / 2,
              y: this.height / 2 - 20,
              life: 1.5,
              maxLife: 1.5,
              color: '#fb7185',
              scale: 1.2
            });
          }
          break;
        }
      }
    }

    // Check wave completion
    if (this.asteroids.length === 0) {
      this.sound.scorePing();
      this.wave++;
      this.updateHUD();
      this.spawnWave(Math.min(3 + this.wave, 9));
    }
  }

  wrapEntity(e) {
    if (e.x < -20) e.x = this.width + 20;
    if (e.x > this.width + 20) e.x = -20;
    if (e.y < -20) e.y = this.height + 20;
    if (e.y > this.height + 20) e.y = -20;
  }

  updateHUD() {
    const scoreEl = document.getElementById('game-score-display');
    const livesEl = document.getElementById('game-lives-display');
    const waveEl = document.getElementById('game-wave-display');
    const highEl = document.getElementById('game-high-display');

    if (scoreEl) scoreEl.textContent = this.score.toString().padStart(5, '0');
    if (livesEl) livesEl.textContent = '🚀'.repeat(Math.max(0, this.lives));
    if (waveEl) waveEl.textContent = `WAVE ${this.wave}`;
    if (highEl) {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('cyber_defender_highscore', this.highScore.toString());
      }
      highEl.textContent = this.highScore.toString().padStart(5, '0');
    }
  }

  gameOver() {
    this.isRunning = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('cyber_defender_highscore', this.highScore.toString());
    }
    this.updateHUD();
    this.renderGameOverScreen();
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Deep space background with subtle grid
    this.ctx.fillStyle = '#060913';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Grid lines
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Render Particles
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;

    // Render Lasers
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 8;
    for (const l of this.lasers) {
      this.ctx.beginPath();
      this.ctx.moveTo(l.x, l.y);
      this.ctx.lineTo(l.x - l.vx * 0.9, l.y - l.vy * 0.9);
      this.ctx.stroke();
    }
    this.ctx.shadowBlur = 0;

    // Render Asteroids (Cyber Asteroids / Polygons)
    for (const a of this.asteroids) {
      this.ctx.save();
      this.ctx.translate(a.x, a.y);
      this.ctx.rotate(a.rot);
      this.ctx.strokeStyle = a.color;
      this.ctx.fillStyle = 'rgba(10, 15, 30, 0.7)';
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = a.color;
      this.ctx.shadowBlur = 6;

      this.ctx.beginPath();
      for (let p = 0; p < a.numPoints; p++) {
        const theta = (p / a.numPoints) * Math.PI * 2;
        const r = a.radius * a.offsets[p];
        const px = Math.cos(theta) * r;
        const py = Math.sin(theta) * r;
        if (p === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Inner tech core dot
      this.ctx.fillStyle = a.color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }
    this.ctx.shadowBlur = 0;

    // Render Ship (with invulnerability blinking)
    if (this.ship) {
      const isInvuln = this.ship.invulnerableTimer > 0;
      const shouldDraw = !isInvuln || Math.floor(Date.now() / 100) % 2 === 0;

      if (shouldDraw) {
        this.ctx.save();
        this.ctx.translate(this.ship.x, this.ship.y);
        this.ctx.rotate(this.ship.angle);

        // Ship Outer Glow
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.shadowBlur = 10;

        // Ship wireframe body
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.fillStyle = '#0f172a';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.moveTo(this.ship.radius + 4, 0); // Nose
        this.ctx.lineTo(-this.ship.radius, -this.ship.radius * 0.85); // Left wing
        this.ctx.lineTo(-this.ship.radius * 0.4, 0); // Tail notch
        this.ctx.lineTo(-this.ship.radius, this.ship.radius * 0.85); // Right wing
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Cockpit light
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.beginPath();
        this.ctx.arc(2, 0, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Forcefield circle when invulnerable
        if (isInvuln) {
          this.ctx.strokeStyle = '#a855f7';
          this.ctx.lineWidth = 1.5;
          this.ctx.setLineDash([4, 4]);
          this.ctx.beginPath();
          this.ctx.arc(0, 0, this.ship.radius + 10, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
        }

        this.ctx.restore();
        this.ctx.shadowBlur = 0;
      }
    }

    // Render Floating Text
    for (const ft of this.floatingTexts) {
      const alpha = ft.life / ft.maxLife;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = ft.color;
      this.ctx.font = `bold ${Math.round(14 * ft.scale)}px 'Orbitron', 'Segoe UI', monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = ft.color;
      this.ctx.shadowBlur = 8;
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }
  }

  renderIntroScreen() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#060913';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Decorative grid
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    this.ctx.save();
    this.ctx.textAlign = 'center';

    // Title
    this.ctx.font = "900 32px 'Orbitron', sans-serif";
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 15;
    this.ctx.fillText("CYBER DEFENDER", this.width / 2, this.height / 2 - 50);

    // Subtitle
    this.ctx.font = "600 14px 'Segoe UI', sans-serif";
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.shadowBlur = 0;
    this.ctx.fillText("Interactive Arcade Mini-Game • Built in Pure HTML5 Canvas & Web Audio", this.width / 2, this.height / 2 - 15);

    // Action CTA
    this.ctx.font = "bold 16px 'Orbitron', sans-serif";
    this.ctx.fillStyle = '#34d399';
    this.ctx.shadowColor = '#34d399';
    this.ctx.shadowBlur = 10;
    this.ctx.fillText("CLICK TO PLAY / PRESS SPACEBAR", this.width / 2, this.height / 2 + 40);

    // Controls explanation
    this.ctx.font = "12px 'Segoe UI', sans-serif";
    this.ctx.fillStyle = '#64748b';
    this.ctx.shadowBlur = 0;
    this.ctx.fillText("Controls: [W / ↑] Thrust  •  [A / D / ← →] Rotate  •  [Space] Fire", this.width / 2, this.height / 2 + 75);

    this.ctx.restore();
  }

  renderGameOverScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(6, 9, 19, 0.85)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.textAlign = 'center';
    this.ctx.font = "900 36px 'Orbitron', sans-serif";
    this.ctx.fillStyle = '#f43f5e';
    this.ctx.shadowColor = '#f43f5e';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText("GAME OVER", this.width / 2, this.height / 2 - 50);

    this.ctx.font = "bold 20px 'Segoe UI', sans-serif";
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowBlur = 0;
    this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.width / 2, this.height / 2);

    this.ctx.font = "14px 'Segoe UI', sans-serif";
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText(`Wave Reached: ${this.wave}  |  High Score: ${this.highScore}`, this.width / 2, this.height / 2 + 30);

    this.ctx.font = "bold 15px 'Orbitron', sans-serif";
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 8;
    this.ctx.fillText("CLICK OR PRESS SPACE TO RESTART", this.width / 2, this.height / 2 + 80);

    this.ctx.restore();
  }
}

// Auto instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.cyberDefenderGame = new CyberDefenderGame('arcade-canvas');
});
