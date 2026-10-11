import { getCurrentUser, getCurrentWeek } from "../state/appState.js";

// CONFIGURATION: Use your API Key and the NEW Bin ID here
const PRESENCE_BIN_ID = "6acb32adffd5d1605360be05"; 
const JSONBIN_API_KEY = "\$2a\$10\$MtvaDn4Utk.fuBQ08te0y.o4CAvIZpaFb5amKJFIB3hLC6uxJytHq";
const API_URL = `https://api.jsonbin.io/v3/b/${PRESENCE_BIN_ID}`;

// Fetch live users and update the UI
async function fetchActiveUsers() {
    try {
        const response = await fetch(`${API_URL}/latest`, {
            headers: { "X-Master-Key": JSONBIN_API_KEY }
        });
        if (!response.ok) return;
        
        const data = await response.json();
        const activeUsersList = data.record._activeUsers || {};
        
        updatePresenceUI(activeUsersList);
    } catch (error) {
        console.warn("Presence fetch failed", error);
    }
}

// Push current user's heartbeat to the cloud
async function broadcastPresence() {
    try {
        // First get the latest list to avoid overwriting others
        const response = await fetch(`${API_URL}/latest`, {
            headers: { "X-Master-Key": JSONBIN_API_KEY }
        });
        const data = await response.json();
        const activeUsersList = data.record._activeUsers || {};

        // Update own presence
        activeUsersList[getCurrentUser()] = {
            lastSeen: Date.now(),
            week: getCurrentWeek()
        };

        // Send updated list back to the presence bin
        await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": JSONBIN_API_KEY
            },
            body: JSON.stringify({ _activeUsers: activeUsersList })
        });
        
        updatePresenceUI(activeUsersList);
    } catch (error) {
        console.warn("Failed to broadcast presence");
    }
}

// Update the DOM elements
// Map to store assigned avatars so they don't change randomly
const userAvatarMap = new Map();
const AVATAR_PROFILES = [
  { emoji: '🐸', bg: '#d81b60' }, // Pink
  { emoji: '🐔', bg: '#e53935' }, // Red
  { emoji: '🐮', bg: '#e06666' }, // Light Red
  { emoji: '🦖', bg: '#dcb888' }, // Tan
  { emoji: '🦘', bg: '#00796b' }, // Teal
  { emoji: '🐨', bg: '#8e24aa' }, // Purple
];

function updatePresenceUI(activeUsersList) {
    const activeUsersBadgeContainer = document.getElementById('active-users-badge');
    if (!activeUsersBadgeContainer) return;

    const now = Date.now();
    
    // Using ES6 Set to ensure absolutely unique active users
    const uniqueActiveUsers = new Set();
    
    Object.entries(activeUsersList).forEach(([name, data]) => {
        if ((now - data.lastSeen) < 60000) {
            uniqueActiveUsers.add(name);
        }
    });

    // Generate Avatar HTML
    let avatarHTML = `<div class="avatar-group" title="Active: ${Array.from(uniqueActiveUsers).join(', ')}">`;
    
    let count = 0;
    const MAX_VISIBLE = 5;

    uniqueActiveUsers.forEach(user => {
        // Assign a deterministic profile using Map
        if (!userAvatarMap.has(user)) {
            const profile = AVATAR_PROFILES[userAvatarMap.size % AVATAR_PROFILES.length];
            userAvatarMap.set(user, profile);
        }

        if (count < MAX_VISIBLE) {
            const profile = userAvatarMap.get(user);
            // If user is exactly "Bhuvnesh", show initial, otherwise show anonymous animal
            const displayChar = (user.toLowerCase() === 'bhuvnesh' || user.toLowerCase() === 'admin') 
                ? user.charAt(0).toUpperCase() 
                : profile.emoji;

            avatarHTML += `<div class="avatar-circle" style="background-color: ${profile.bg};" title="${user}">${displayChar}</div>`;
        }
        count++;
    });

    // The "+1" bubble (like in the image)
    if (uniqueActiveUsers.size > MAX_VISIBLE) {
        const extra = uniqueActiveUsers.size - MAX_VISIBLE;
        avatarHTML += `<div class="avatar-circle avatar-count">+${extra}</div>`;
    }

    avatarHTML += `</div>`;
    
    // Replace the old green dot UI with the new Avatar UI
    activeUsersBadgeContainer.style.background = 'transparent';
    activeUsersBadgeContainer.innerHTML = avatarHTML;
}

export { fetchActiveUsers, broadcastPresence };