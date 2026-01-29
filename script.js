// Initialize Icons
lucide.createIcons();

// --- CONFIGURATION ---
// FIX 1: Added "/chat" to the end of the URL. This is critical!
const API_URL = "https://miaaiassistant-geology-professor.hf.space/chat";

// Chat History Memory
let conversationHistory = [];

// DOM Elements
const userInput = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');
const welcomeScreen = document.getElementById('welcome-screen');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');

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
    }

    div.innerHTML = `
        <div class="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${avatarColor} text-white mt-1">
            <i data-lucide="${icon}" class="w-5 h-5"></i>
        </div>
        <div class="relative max-w-[85%] md:max-w-[75%]">
            <div class="prose ${textColor} text-base leading-7">
                ${formattedContent}
            </div>
        </div>
    `;
    return div;
};

// Handle Form Submit
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();

    if (!text) return;

    // 1. UI Transitions
    welcomeScreen.classList.add('hidden');
    chatMessages.classList.remove('hidden');
    
    // 2. Add User Message to UI
    chatMessages.appendChild(createMessageElement(text, true));
    
    // 3. Reset Input
    userInput.value = '';
    userInput.style.height = 'auto'; 
    lucide.createIcons();
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });

    // 4. Add Loading Indicator
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'flex gap-4 md:gap-6 animate-fade-in';
    loadingDiv.innerHTML = `
        <div class="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-magma-600 text-white mt-1 shadow-[0_0_15px_rgba(217,119,6,0.3)]">
            <i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>
        </div>
        <div class="flex items-center gap-1 mt-2">
            <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
            <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
            <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    lucide.createIcons();

    try {
        // 5. Call Your Local Python Backend
        const response = await fetch(API_URL, {
            method: "POST",
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
