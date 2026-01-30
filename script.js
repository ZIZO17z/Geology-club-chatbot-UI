<<<<<<< HEAD
// Initialize Icons
lucide.createIcons();

// --- CONFIGURATION ---
// FIX 1: Added "/chat" to the end of the URL. This is critical!
const API_URL = "https://miaaiassistant-geology-professor.hf.space/chat";

// Chat History Memory
let conversationHistory = [];

=======
>>>>>>> 2d1b195 (Update UI files)
// DOM Elements
const preloader = document.getElementById('preloader');
const bgSound = document.getElementById('bg-sound');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const welcomeScreen = document.getElementById('welcome-screen');
const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const canvas = document.getElementById('fw-canvas');
const ctx = canvas.getContext('2d');

<<<<<<< HEAD
// Function to create HTML for messages
const createMessageElement = (content, isUser) => {
    const div = document.createElement('div');
    div.className = `flex gap-4 md:gap-6 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`;
    
    const avatarColor = isUser ? 'bg-obsidian-700/80' : 'bg-magma-600 shadow-[0_0_15px_rgba(217,119,6,0.3)]';
    const icon = isUser ? 'user' : 'mountain';
    const textColor = isUser ? 'text-gray-200' : 'text-gray-100';

    // Basic formatting for AI response
    let formattedContent = content;
    if (!isUser) {
        formattedContent = content
            // Bold conversion (**text** -> <strong>text</strong>)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Code block conversion (simple)
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-obsidian-800 p-2 rounded my-2 overflow-x-auto"><code>$1</code></pre>')
            // Line breaks
            .replace(/\n/g, '<br>');
=======
let conversationHistory = [];
const API_URL = "https://miaaiassistant-geology-professor.hf.space/chat";

// Fireworks Logic
let particles = [];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
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
>>>>>>> 2d1b195 (Update UI files)
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
    const colors = ['#f59e0b', '#fbbf24', '#ef4444', '#ffffff'];
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]));
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

// Event listeners for fireworks
document.addEventListener('click', (e) => {
    if (e.target.closest('#main-logo') || e.target.closest('.msg-ai')) {
        createFirework(e.clientX, e.clientY);
    }
});

// Boot Sequence
document.addEventListener('click', () => {
    bgSound.play().catch(() => {});
    preloader.style.opacity = '0';
    setTimeout(() => preloader.style.display = 'none', 500);
}, { once: true });

// Chat Logic
const appendMessage = (content, isUser, sources = []) => {
    const msg = document.createElement('div');
    msg.className = `flex gap-4 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`;
    
    const avatarHTML = isUser 
        ? `<div class="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center bg-obsidian-700 text-white mt-1 border border-white/10 shadow-lg"><i data-lucide="user" class="w-5 h-5"></i></div>`
        : `<div class="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center bg-transparent mt-1 shadow-lg"><img src="logo.jpg" class="w-full h-full object-cover rounded-lg border border-magma-500/30"></div>`;

    let textHTML = isUser ? content : marked.parse(content);
    msg.innerHTML = `${avatarHTML}<div class="msg-${isUser ? 'user' : 'ai'} shadow-xl">${textHTML}</div>`;
    
    chatMessages.appendChild(msg);
    lucide.createIcons();
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
};

<<<<<<< HEAD
// Handle Form Submit
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
=======
const handleChat = async (e) => {
    if (e) e.preventDefault();
>>>>>>> 2d1b195 (Update UI files)
    const text = userInput.value.trim();
    if (!text) return;

    welcomeScreen.classList.add('hidden');
    chatMessages.classList.remove('hidden');
    document.body.classList.add('is-loading');
    
    appendMessage(text, true);
    userInput.value = '';

    const loadingDiv = document.createElement('div');
    loadingDiv.className = "text-magma-500 animate-pulse text-sm font-mono ml-16 mt-2 mb-4";
    loadingDiv.innerHTML = "Analyzing strata...";
    chatMessages.appendChild(loadingDiv);

    try {
        const res = await fetch(API_URL, {
            method: "POST",
<<<<<<< HEAD
            headers: {
                "Content-Type": "application/json"
            },
            // FIX 2: Changed "message" to "question" to match Python backend
            body: JSON.stringify({
                "question": text,
                "history": conversationHistory 
            })
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Remove Loader
        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();

        // FIX 3: Changed "data.response" to "data.answer"
        const aiText = data.answer; 
        
        // 6. Display AI Response
        chatMessages.appendChild(createMessageElement(aiText, false));

        // 7. Update History Memory
        // We push plain text to history to keep it simple for the backend
        conversationHistory.push(text); 
        conversationHistory.push(aiText);

    } catch (err) {
        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();
        chatMessages.appendChild(createMessageElement(`⚠️ Connection Error: ${err.message}`, false));
    }
    
    // Refresh icons and scroll
    lucide.createIcons();
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
});
=======
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: text, history: conversationHistory })
        });
        const data = await res.json();
        loadingDiv.remove();
        appendMessage(data.answer, false, data.source_documents);
        conversationHistory.push(text, data.answer);
    } catch (err) {
        loadingDiv.innerText = "Error connecting to AI.";
    } finally {
        document.body.classList.remove('is-loading');
    }
};

chatForm.addEventListener('submit', handleChat);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); }
});
>>>>>>> 2d1b195 (Update UI files)
