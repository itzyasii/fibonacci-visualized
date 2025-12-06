class FibonacciVisualizer {
  constructor() {
    this.sequence = [1, 1];
    this.isPlaying = false;
    this.autoPlayInterval = null;
    this.animationSpeed = 800;

    // DOM Elements
    this.chart = document.getElementById("chart");
    this.nextBtn = document.getElementById("nextBtn");
    this.autoBtn = document.getElementById("autoBtn");
    this.stopBtn = document.getElementById("stopBtn");
    this.resetBtn = document.getElementById("resetBtn");
    this.setCustomBtn = document.getElementById("setCustomBtn");
    this.start1Input = document.getElementById("start1");
    this.start2Input = document.getElementById("start2");
    this.autoLimitInput = document.getElementById("autoLimit");
    this.speedSlider = document.getElementById("speedSlider");
    this.speedValue = document.getElementById("speedValue");
    this.themeToggle = document.getElementById("themeToggle");
    this.copyBtn = document.getElementById("copyBtn");
    this.exportBtn = document.getElementById("exportBtn");

    this.currentNumberDisplay = document.getElementById("currentNumber");
    this.sequenceLengthDisplay = document.getElementById("sequenceLength");
    this.phiDisplay = document.getElementById("phiValue");

    // Canvas
    this.canvas = document.getElementById("spiralCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();

    this.init();

    // Handle resize
    window.addEventListener("resize", () => {
      this.resizeCanvas();
      this.drawSpiral();
    });

    // Advanced Animations
    this.initScrollAnimations();
    this.initTiltEffect();
    this.initKeyboardShortcuts();
  }

  init() {
    this.renderInitialBars();
    this.addEventListeners();
    this.updateStats();
    this.drawSpiral();
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = 400; // Fixed height
  }

  addEventListeners() {
    this.nextBtn.addEventListener("click", () => this.generateNext());
    this.resetBtn.addEventListener("click", () => this.reset());
    this.autoBtn.addEventListener("click", () => this.toggleAutoPlay());
    this.stopBtn.addEventListener("click", () => this.stopAutoPlay());
    this.setCustomBtn.addEventListener("click", () => this.setCustomSequence());

    // Speed slider
    this.speedSlider.addEventListener("input", (e) =>
      this.updateSpeed(e.target.value)
    );

    // Theme toggle
    this.themeToggle.addEventListener("click", () => this.toggleTheme());

    // Copy and Export
    this.copyBtn.addEventListener("click", () => this.copySequence());
    this.exportBtn.addEventListener("click", () => this.showExportMenu());

    // Load saved theme
    this.loadTheme();
  }

  setCustomSequence() {
    const n1 = parseInt(this.start1Input.value) || 1;
    const n2 = parseInt(this.start2Input.value) || 1;

    this.stopAutoPlay();
    this.sequence = [n1, n2];
    this.chart.innerHTML = "";
    this.createBar(n1, 0);
    this.createBar(n2, 1);
    this.updateStats();
    this.drawSpiral();
  }

  renderInitialBars() {
    this.chart.innerHTML = "";
    this.sequence.forEach((val, idx) => this.createBar(val, idx));
  }

  createBar(value, index) {
    const bar = document.createElement("div");
    bar.className = "bar fade-in";
    bar.dataset.value = value;

    // Logarithmic height scaling
    const scale = Math.log(value + 1) * 15 + 20;
    bar.style.height = `${scale}px`;

    // Add floating label showing the addition formula (for bars after the first two)
    if (index >= 2) {
      const prev1 = this.sequence[index - 1];
      const prev2 = this.sequence[index - 2];

      const label = document.createElement("span");
      label.className = "bar-label";
      label.textContent = `${prev2.toLocaleString()} + ${prev1.toLocaleString()}`;
      bar.appendChild(label);
    }

    // Remove pulse from previous bars
    const bars = this.chart.querySelectorAll(".bar");
    bars.forEach((b) => b.classList.remove("pulse"));

    // Add pulse to new bar
    bar.classList.add("pulse");

    this.chart.appendChild(bar);
    this.chart.scrollLeft = this.chart.scrollWidth;

    return bar;
  }

  generateNext() {
    const len = this.sequence.length;

    // Check limit if auto-playing
    if (this.isPlaying) {
      const limit = parseInt(this.autoLimitInput.value) || 50;
      if (len >= limit) {
        this.stopAutoPlay();
        return;
      }
    }

    const nextVal = this.sequence[len - 1] + this.sequence[len - 2];

    this.sequence.push(nextVal);
    this.createBar(nextVal, len);

    this.highlightBars(len - 1, len - 2);
    this.updateStats();
    this.drawSpiral();

    if (nextVal > 1000000000000000) {
      // Safety limit
      this.stopAutoPlay();
    }
  }

  highlightBars(idx1, idx2) {
    const bars = this.chart.children;
    if (bars[idx1]) bars[idx1].classList.add("highlight");
    if (bars[idx2]) bars[idx2].classList.add("highlight");

    setTimeout(() => {
      if (bars[idx1]) bars[idx1].classList.remove("highlight");
      if (bars[idx2]) bars[idx2].classList.remove("highlight");
    }, 600);
  }

  toggleAutoPlay() {
    if (this.isPlaying) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  startAutoPlay() {
    this.isPlaying = true;
    this.autoBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    this.autoBtn.classList.add("btn-primary");
    this.stopBtn.disabled = false;

    this.generateNext();
    this.autoPlayInterval = setInterval(() => {
      this.generateNext();
    }, this.animationSpeed);
  }

  stopAutoPlay() {
    this.isPlaying = false;
    this.autoBtn.innerHTML = '<i class="fa-solid fa-play"></i> Auto';
    this.autoBtn.classList.remove("btn-primary");
    this.stopBtn.disabled = true;
    clearInterval(this.autoPlayInterval);
  }

  reset() {
    this.stopAutoPlay();
    this.sequence = [1, 1];
    this.start1Input.value = 1;
    this.start2Input.value = 1;
    this.renderInitialBars();
    this.updateStats();
    this.drawSpiral();
  }

  updateStats() {
    const current = this.sequence[this.sequence.length - 1];
    const prev = this.sequence[this.sequence.length - 2];

    this.currentNumberDisplay.textContent = current.toLocaleString();
    this.sequenceLengthDisplay.textContent = this.sequence.length;

    // Calculate Phi
    if (prev > 0) {
      const phi = current / prev;
      this.phiDisplay.textContent = phi.toFixed(6);
    } else {
      this.phiDisplay.textContent = "1.000000";
    }

    // Update sum if element exists
    const sumDisplay = document.getElementById("sequenceSum");
    if (sumDisplay) {
      const sum = this.sequence.reduce((a, b) => a + b, 0);
      sumDisplay.textContent = sum.toLocaleString();
    }
  }

  drawSpiral() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(centerX, centerY);

    // Scale down to fit
    const maxVal = this.sequence[this.sequence.length - 1];
    let scale = 10;
    if (this.sequence.length > 5) {
      scale = 150 / Math.log(maxVal + 2); // Logarithmic zoom out
    }

    ctx.scale(scale, scale);
    ctx.lineWidth = 2 / scale;

    // Golden Spiral Formula
    const b = 0.306349;
    ctx.strokeStyle = "#ffd166";

    ctx.beginPath();
    for (let i = 0; i < this.sequence.length * 50; i++) {
      const theta = i * 0.1;
      const r = 0.5 * Math.exp(b * theta);

      const posX = r * Math.cos(theta);
      const posY = r * Math.sin(theta);

      if (i === 0) ctx.moveTo(posX, posY);
      else ctx.lineTo(posX, posY);
    }
    ctx.stroke();

    ctx.restore();
  }

  // --- Advanced Animations ---

  initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }

  initTiltEffect() {
    // Simple 3D tilt effect for glass cards
    const cards = document.querySelectorAll(".glass-card");

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg rotation
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform =
          "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
      });
    });
  }

  initKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === "INPUT") return;

      switch (e.key.toLowerCase()) {
        case " ": // Space - Next
          e.preventDefault();
          this.generateNext();
          break;
        case "a": // A - Auto/Pause
          e.preventDefault();
          this.toggleAutoPlay();
          break;
        case "r": // R - Reset
          e.preventDefault();
          this.reset();
          break;
        case "s": // S - Stop
        case "escape": // Escape - Stop
          e.preventDefault();
          this.stopAutoPlay();
          break;
        case "t": // T - Toggle theme
          e.preventDefault();
          this.toggleTheme();
          break;
      }
    });
  }

  updateSpeed(value) {
    this.animationSpeed = parseInt(value);
    this.speedValue.textContent = `${value}ms`;

    // Update interval if currently playing
    if (this.isPlaying) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }

  toggleTheme() {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");

    // Update button icon
    const icon = this.themeToggle.querySelector("i");
    icon.className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";

    // Save preference
    localStorage.setItem("theme", isLight ? "light" : "dark");

    // Redraw spiral with new colors
    this.drawSpiral();
  }

  loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
      const icon = this.themeToggle.querySelector("i");
      icon.className = "fa-solid fa-sun";
    }
  }

  async copySequence() {
    const text = this.sequence.join(", ");
    try {
      await navigator.clipboard.writeText(text);
      // Visual feedback
      const originalText = this.copyBtn.innerHTML;
      this.copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      this.copyBtn.style.background = "var(--accent-secondary)";

      setTimeout(() => {
        this.copyBtn.innerHTML = originalText;
        this.copyBtn.style.background = "";
      }, 2000);
    } catch (err) {
      alert("Failed to copy to clipboard");
    }
  }

  showExportMenu() {
    const format = prompt("Export format:\n1. CSV\n2. JSON\n\nEnter 1 or 2:");

    if (format === "1") {
      this.exportCSV();
    } else if (format === "2") {
      this.exportJSON();
    }
  }

  exportCSV() {
    const csv =
      "Index,Value\n" +
      this.sequence.map((val, idx) => `${idx},${val}`).join("\n");
    this.downloadFile(csv, "fibonacci_sequence.csv", "text/csv");
  }

  exportJSON() {
    const data = {
      sequence: this.sequence,
      length: this.sequence.length,
      sum: this.sequence.reduce((a, b) => a + b, 0),
      current: this.sequence[this.sequence.length - 1],
      phi:
        this.sequence[this.sequence.length - 1] /
        this.sequence[this.sequence.length - 2],
      timestamp: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, "fibonacci_sequence.json", "application/json");
  }

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Visual feedback
    const originalText = this.exportBtn.innerHTML;
    this.exportBtn.innerHTML = '<i class="fa-solid fa-check"></i> Exported!';
    this.exportBtn.style.background = "var(--accent-secondary)";

    setTimeout(() => {
      this.exportBtn.innerHTML = originalText;
      this.exportBtn.style.background = "";
    }, 2000);
  }
}

// --- New Features ---

class ParticleNetwork {
  constructor() {
    this.canvas = document.getElementById("bgCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.resize();

    window.addEventListener("resize", () => this.resize());
    this.initParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    const count = Math.min(window.innerWidth / 10, 100); // Responsive count
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(100, 100, 255, 0.2)";
      this.ctx.fill();

      // Connect particles
      for (let j = index + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(100, 100, 255, ${0.1 - dist / 1500})`;
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

class FunFactsManager {
  constructor() {
    this.facts = [
      "The Fibonacci sequence is named after Leonardo of Pisa, who was known as Fibonacci.",
      "Fibonacci numbers appear in the arrangement of leaves (phyllotaxis) to optimize sunlight exposure.",
      "The ratio of consecutive Fibonacci numbers converges to the Golden Ratio (approx. 1.618).",
      "Honeybees have a family tree that follows the Fibonacci sequence.",
      "The number of petals on a flower is often a Fibonacci number (e.g., lilies have 3, buttercups 5).",
      "Fibonacci numbers are used in computer algorithms, such as the Fibonacci search technique.",
      "The spiral of a pinecone follows Fibonacci numbers.",
      "November 23rd is celebrated as Fibonacci Day (11/23 -> 1, 1, 2, 3).",
    ];
    this.currentIndex = 0;
    this.textEl = document.getElementById("funFactText");
    this.btn = document.getElementById("nextFactBtn");

    this.btn.addEventListener("click", () => this.nextFact());
    this.showFact();
  }

  nextFact() {
    this.currentIndex = (this.currentIndex + 1) % this.facts.length;
    this.showFact();
  }

  showFact() {
    this.textEl.style.opacity = 0;
    setTimeout(() => {
      this.textEl.textContent = this.facts[this.currentIndex];
      this.textEl.style.opacity = 1;
    }, 300);
  }
}

class QuizManager {
  constructor() {
    this.questions = [
      {
        q: "What is the next number in the sequence: 1, 1, 2, 3, 5...?",
        options: ["7", "8", "9", "10"],
        correct: 1, // Index of correct answer
      },
      {
        q: "Which famous ratio do Fibonacci numbers approximate?",
        options: [
          "Pi (π)",
          "Golden Ratio (φ)",
          "Euler's Number (e)",
          "Silver Ratio",
        ],
        correct: 1,
      },
      {
        q: "Who introduced the Fibonacci sequence to Western mathematics?",
        options: [
          "Isaac Newton",
          "Leonardo of Pisa",
          "Pythagoras",
          "Archimedes",
        ],
        correct: 1,
      },
      {
        q: "Which of these flowers typically has 5 petals (a Fibonacci number)?",
        options: ["Lily", "Buttercup", "Daisy", "Rose"],
        correct: 1,
      },
    ];
    this.currentQ = 0;
    this.score = 0;

    this.qEl = document.getElementById("quizQuestion");
    this.optsEl = document.getElementById("quizOptions");
    this.feedbackEl = document.getElementById("quizFeedback");
    this.nextBtn = document.getElementById("nextQuestionBtn");

    this.nextBtn.addEventListener("click", () => this.nextQuestion());
    this.loadQuestion();
  }

  loadQuestion() {
    const q = this.questions[this.currentQ];
    this.qEl.textContent = q.q;
    this.optsEl.innerHTML = "";
    this.feedbackEl.textContent = "";
    this.feedbackEl.className = "quiz-feedback";
    this.nextBtn.style.display = "none";

    q.options.forEach((opt, idx) => {
      const btn = document.createElement("div");
      btn.className = "quiz-option";
      btn.textContent = opt;
      btn.addEventListener("click", () => this.checkAnswer(idx, btn));
      this.optsEl.appendChild(btn);
    });
  }

  checkAnswer(selectedIdx, btnElement) {
    if (this.feedbackEl.textContent) return; // Already answered

    const q = this.questions[this.currentQ];
    const options = this.optsEl.children;

    if (selectedIdx === q.correct) {
      btnElement.classList.add("correct");
      this.feedbackEl.textContent = "Correct! Well done.";
      this.feedbackEl.classList.add("success");
      this.score++;
    } else {
      btnElement.classList.add("incorrect");
      options[q.correct].classList.add("correct");
      this.feedbackEl.textContent =
        "Incorrect. The correct answer is highlighted.";
      this.feedbackEl.classList.add("error");
    }

    this.nextBtn.style.display = "block";
  }

  nextQuestion() {
    this.currentQ++;
    if (this.currentQ < this.questions.length) {
      this.loadQuestion();
    } else {
      this.showResults();
    }
  }

  showResults() {
    this.qEl.textContent = "Quiz Completed!";
    this.optsEl.innerHTML = `
      <div style="text-align: center; grid-column: 1 / -1;">
        <h3 style="font-size: 2rem; margin-bottom: 10px;">${this.score} / ${this.questions.length}</h3>
        <p>Thanks for playing!</p>
        <button id="restartQuiz" class="btn btn-primary" style="margin: 20px auto;">Restart Quiz</button>
      </div>
    `;
    this.feedbackEl.textContent = "";
    this.nextBtn.style.display = "none";

    document.getElementById("restartQuiz").addEventListener("click", () => {
      this.currentQ = 0;
      this.score = 0;
      this.loadQuestion();
    });
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  new FibonacciVisualizer();
  new ParticleNetwork();
  new FunFactsManager();
  new QuizManager();
});
