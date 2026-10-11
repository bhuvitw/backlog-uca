import { getState, getCurrentWeek, getCurrentUser } from "../state/appState.js";

export function renderDiscussion() {
    const weekLabel = document.getElementById("discuss-week-label");
    const messagesContainer = document.getElementById("discuss-messages");
    
    // --> ADD THIS SAFETY CHECK <---
    if (!weekLabel || !messagesContainer) {
        return; 
    }

    const currentWeek = getCurrentWeek();

    // Update Header
    weekLabel.textContent = currentWeek;
    messagesContainer.innerHTML = '';

    const state = getState();
    const discussions = state._discussions?.[currentWeek] || [];

    if (discussions.length === 0) {
        messagesContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size: 12px; margin-top: 20px;">No messages yet for ${currentWeek}. Start the discussion!</div>`;
        return;
    }

    const currentUser = getCurrentUser();

    // Render Messages
    discussions.forEach(msg => {
        const isSelf = msg.user === currentUser;
        
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.marginBottom = '12px';

        const meta = document.createElement('div');
        meta.className = `chat-meta ${isSelf ? 'self' : 'other'}`;
        const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        meta.textContent = `${isSelf ? 'You' : msg.user} • ${timeStr}`;

        const bubble = document.createElement('div');
        bubble.className = `chat-message ${isSelf ? 'self' : 'other'}`;
        bubble.textContent = msg.text;

        wrapper.appendChild(meta);
        wrapper.appendChild(bubble);
        messagesContainer.appendChild(wrapper);
    });

    // Auto-scroll to the newest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}