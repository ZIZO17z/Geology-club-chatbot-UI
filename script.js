// Initialize Icons
lucide.createIcons();

// ================= CONFIG =================
const API_URL = "https://miaaiassistant-geology-professor.hf.space/chat";
let conversationHistory = [];

// ================= DOM =================
const preloader = document.getElementById("preloader");
const bgSound = document.getElementById("bg-sound");
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");
const welcomeScreen = document.getElementById("welcome-screen");
const chatContainer = document.getElementById("chat-container");
const chatForm = document.getElementById("chat-form");
const canvas = document.getElementById("fw-canvas");
const ctx = canvas.getContext("2d");

// ================= CANVAS FIREWORKS =================
let particles = [];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = {
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8
    };
    this.alpha = 1;
    this.friction = 0.95;
  }
  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.02;
  }
}

function createFirework(x, y) {
  const colors = ["#f59e0b", "#fbbf24", "#ef4444", "#ffffff"];
  for (let i = 0; i < 30; i++) {
    particles.push(
      new Particle(x, y, colors[Math.floor(Math.random() * colors.length)])
    );
  }
}

function animateFireworks() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    if (p.alpha > 0) {
      p.update();
      p.draw();
    } else {
      particles.splice(i, 1);
    }
  });
  requestAnimationFrame(animateFireworks);
}
animateFireworks();

document.addEventListener("click", (e) => {
  if (e.target.closest("#main-logo") || e.target.closest(".msg-ai")) {
    createFirework(e.clientX, e.clientY);
  }
});

// ================= PRELOADER =================
document.addEventListener(
  "click",
  () => {
    bgSound.play().catch(() => {});
    preloader.style.opacity = "0";
    setTimeout(() => {
      preloader.style.display = "none";
    }, 500);
  },
  { once: true }
);

// ================= CHAT UI =================
const appendMessage = (content, isUser) => {
  const msg = document.createElement("div");
  msg.className = `flex gap-4 animate-fade-in ${
    isUser ? "flex-row-reverse" : ""
  }`;

  const avatar = isUser
    ? `<div class="w-10 h-10 rounded-lg flex items-center justify-center bg-obsidian-700 border border-white/10">
         <i data-lucide="user" class="w-5 h-5"></i>
       </div>`
    : `<div class="w-10 h-10 rounded-lg overflow-hidden border border-magma-500/30">
         <img src="logo.jpg" class="w-full h-full object-cover">
       </div>`;

  const textHTML = isUser ? content : marked.parse(content);

  msg.innerHTML = `
    ${avatar}
    <div class="msg-${isUser ? "user" : "ai"} shadow-xl">${textHTML}</div>
  `;

  chatMessages.appendChild(msg);
  lucide.createIcons();
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth"
  });
};

// ================= CHAT LOGIC =================
const handleChat = async (e) => {
  if (e) e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  welcomeScreen.classList.add("hidden");
  chatMessages.classList.remove("hidden");
  document.body.classList.add("is-loading");

  appendMessage(text, true);
  userInput.value = "";

  const loading = document.createElement("div");
  loading.className =
    "text-magma-500 animate-pulse text-sm font-mono ml-16 mt-2 mb-4";
  loading.innerText = "Analyzing strata...";
  chatMessages.appendChild(loading);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: text,
        history: conversationHistory
      })
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();
    loading.remove();

    appendMessage(data.answer || "No response.", false);
    conversationHistory.push(text, data.answer);
  } catch (err) {
    loading.innerText = "⚠️ Failed to connect to AI.";
  } finally {
    document.body.classList.remove("is-loading");
  }
};

chatForm.addEventListener("submit", handleChat);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleChat();
  }
});
