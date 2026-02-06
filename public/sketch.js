let wordInput;
let addButton;
let wordList = [];
let redWordPositions = [];
let particles = [];

// slider
let countSlider, distSlider, speedSlider;
let resetBtn;

const DEFAULT_COUNT = 60;
const DEFAULT_DIST = 140;
const DEFAULT_SPEED = 1.0;
const WORD_SPREAD_X = 200;
const WORD_SPREAD_Y = 150;

console.log('hello')

// particle
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.3, 1.2));
    this.r = random(2.0, 3.5);
  }

  update(speedFactor) {
    this.pos.add(p5.Vector.mult(this.vel, speedFactor));

    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
  }

  drawDot() {
    noStroke();
    fill(255);
    circle(this.pos.x, this.pos.y, this.r * 2);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  // Input text box
  wordInput = createInput("");
  wordInput.position(10, 10);
  wordInput.attribute("placeholder", "Type a word");

  addButton = createButton("Add Word");
  addButton.position(200, 10);
  addButton.mousePressed(addWord);

  resetBtn = createButton("Reset (clear words)");
  resetBtn.position(300, 10);
  resetBtn.mousePressed(resetAll);

  // slide
  countSlider = createSlider(10, 160, DEFAULT_COUNT, 1);
  distSlider = createSlider(30, 280, DEFAULT_DIST, 1);
  speedSlider = createSlider(0, 3, DEFAULT_SPEED, 0.05);

  countSlider.style("width", "160px");
  distSlider.style("width", "160px");
  speedSlider.style("width", "160px");

  countSlider.style("accent-color", "rgb(100,100,100)");
  distSlider.style("accent-color", "rgb(100,100,100)");
  speedSlider.style("accent-color", "rgb(100,100,100)");

  positionSliders();

  createParticles(DEFAULT_COUNT);
}

function draw() {
  background(0);

  let targetCount = countSlider.value();
  let connectionDist = distSlider.value();
  let speedFactor = speedSlider.value();

  syncParticleCount(targetCount);

  for (let p of particles) p.update(speedFactor);

  drawConnections(connectionDist);

  for (let p of particles) p.drawDot();

  drawRedWordsOnCanvas();
  drawQuote();
  drawSliderLabels();
}

// add word
function addWord() {
  let newWord = wordInput.value().trim();

  if (newWord.length > 0) {
    wordList.push(newWord);
    wordInput.value("");

    //The overall composition is centered.
    let cx = width / 2;
    let cy = height / 2;

    redWordPositions.push({
      x: cx + random(-WORD_SPREAD_X, WORD_SPREAD_X),
      y: cy + random(-WORD_SPREAD_Y, WORD_SPREAD_Y),
      phase: random(TWO_PI),
      // redWordPositions.push({
      //   x: random(width * 0.35, width * 0.75),
      //   y: random(height * 0.25, height * 0.6),
      //   phase: random(TWO_PI)
    });
  }
}

// ======================
// reset
// ======================
function resetAll() {
  wordList = [];
  redWordPositions = [];

  createParticles(DEFAULT_COUNT);
  countSlider.value(DEFAULT_COUNT);
  distSlider.value(DEFAULT_DIST);
  speedSlider.value(DEFAULT_SPEED);
}

// ======================
// discribe word
// ======================
function drawRedWordsOnCanvas() {
  if (wordList.length === 0) return;

  textAlign(CENTER, CENTER);
  textSize(18);
  noStroke();

  for (let i = 0; i < wordList.length; i++) {
    let w = wordList[i];
    let pos = redWordPositions[i];

    pos.phase += 0.02;
    let ox = cos(pos.phase) * 8;
    let oy = sin(pos.phase * 1.3) * 6;

    fill(255, 0, 0, 60);
    text(w, pos.x + ox + 1.5, pos.y + oy + 1.5);
    fill(255, 0, 0, 220);
    text(w, pos.x + ox, pos.y + oy);
  }
}

function drawQuote() {
  let quote = "Past, present, future.";
  textAlign(CENTER, BOTTOM);
  textSize(26);
  fill(255, 220);
  text(quote, width / 2, height - 14);
  textStyle(NORMAL);
}

// particle networks
function createParticles(n) {
  particles = [];
  let cx = width / 2;
  let cy = height / 2;
  let R = min(width, height) * 0.22;

  for (let i = 0; i < n; i++) {
    let a = random(TWO_PI);
    let r = R * sqrt(random());
    particles.push(new Particle(cx + cos(a) * r, cy + sin(a) * r));
  }
}

function syncParticleCount(targetCount) {
  let diff = targetCount - particles.length;
  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      particles.push(new Particle(width / 2, height / 2));
    }
  } else if (diff < 0) {
    particles.splice(targetCount);
  }
}

function drawConnections(connectionDist) {
  strokeWeight(1);
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      let a = particles[i].pos;
      let b = particles[j].pos;
      let d = dist(a.x, a.y, b.x, b.y);

      if (d < connectionDist) {
        let alpha = map(d, 0, connectionDist, 220, 0);
        stroke(255, alpha);
        line(a.x, a.y, b.x, b.y);
      }
    }
  }
}

// slide text description
function drawSliderLabels() {
  fill(180);
  textSize(12);
  textAlign(LEFT, BOTTOM);

  let x = 10;
  let y = height - 110;

  text("Count (particles)", x, y);
  text("Distance (connections)", x, y + 30);
  text("Speed (movement)", x, y + 55);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionSliders();
  regenerateRedWordPositions();
}

function positionSliders() {
  let x = 10;
  let y = height - 110;
  countSlider.position(x, y);
  distSlider.position(x, y + 25);
  speedSlider.position(x, y + 50);
}

function regenerateRedWordPositions() {
  redWordPositions = redWordPositions.map(() => ({
    x: random(width * 0.35, width * 0.75),
    y: random(height * 0.25, height * 0.6),
    phase: random(TWO_PI),
  }));
}
function keyPressed() {
  if (key === "p" || key === "P") {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}
