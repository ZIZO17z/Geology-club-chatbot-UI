// Initialize Icons
lucide.createIcons();

// --- CONFIGURATION ---
const API_URL = "https://miaaiassistant-geology-professor.hf.space/chat";

// Chat History Memory
let conversationHistory = [];

// DOM Elements
const preloader = document.getElementById('preloader');
const bgSound = document.getElementById('bg-sound');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const welcomeScreen = document.getElementById('welcome-screen');
const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');

// Function to create HTML for messages
const createMessageElement = (content, isUser) => {
    const div = document.createElement('div');
    div.className = `flex gap-4 md:gap-6 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`;
    
    const avatarColor = isUser ? 'bg-obsidian-700/80' : 'bg-magma-600 shadow-[0_0_15px_rgba(217,119,6,0.3)]';
    const icon = isUser ? 'user' : 'bot';
    
    div.innerHTML = `
        <div class="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl ${avatarColor} flex items-center justify-center border border-white/10">
            <i data-lucide="${icon}" class="w-5 h-5 md:w-6 md:h-6 ${isUser ? 'text-stone-400' : 'text-obsidian-950'}"></i>
        </div>
        <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]">
            <div class="${isUser ? 'msg-user text-stone-200' : 'msg-ai text-stone-300'} text-base md:text-lg">
                ${isUser ? content : marked.parse(content)}
            </div>
            <span class="text-[10px] uppercase tracking-widest text-stone-600 mt-2 font-mono">
                ${isUser ? 'Researcher' : 'GeoMind Core'} • ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
        </div>
    `;
    return div;
};

// Handle Form Submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Setup UI for Chat
    welcomeScreen.classList.add('hidden');
    chatMessages.classList.remove('hidden');
    userInput.value = '';
    userInput.style.height = 'auto';

    // 2. Add User Message
    chatMessages.appendChild(createMessageElement(text, true));
    
    // 3. Add Loading Indicator
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = "flex gap-4 animate-pulse";
    loadingDiv.innerHTML = `
        <div class="w-12 h-12 rounded-2xl bg-stone-800 flex items-center justify-center border border-white/5">
            <div class="w-2 h-2 bg-magma-500 rounded-full animate-bounce"></div>
        </div>
        <div class="bg-stone-800/50 p-4 rounded-2xl text-stone-500 italic">Analyzing geological data...</div>
    `;
    chatMessages.appendChild(loadingDiv);
    
    // Scroll to bottom
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });

    try {
        // 4. API Request
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                question: text, 
                history: conversationHistory 
            })
        });

        if (!res.ok) throw new Error(`Server Error (${res.status})`);

        // 5. Process Response
        const data = await res.json();
        document.getElementById(loadingId).remove();
        
        const aiText = data.answer || "I'm sorry, I couldn't process that geological data.";
        
        // 6. Display AI Response
        chatMessages.appendChild(createMessageElement(aiText, false));

        // 7. Update History Memory
        conversationHistory.push(text); 
        conversationHistory.push(aiText);

    } catch (err) {
        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();
        chatMessages.appendChild(createMessageElement(`⚠️ Connection Error: ${err.message}. Please check if the API is active.`, false));
    }
    
    // Refresh icons and scroll
    lucide.createIcons();
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
});

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Handle Enter Key
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});
