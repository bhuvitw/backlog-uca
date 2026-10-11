import { getCurrentUser, getCurrentWeek } from "../state/appState.js";

const API_URL = `https://api.jsonbin.io/v3/b/6acb32adffd5d1605360be05`;
const API_KEY = "\$2a\$10\$MtvaDn4Utk.fuBQ08te0y.o4CAvIZpaFb5amKJFIB3hLC6uxJytHq";
const reqOpts = {
    headers: { 
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY 
    }
};


const userAvatarMap = new Map();
const PROFILES = [
  { emoji: '🐸', bg: '#d81b60' }, { emoji: '🐔', bg: '#e53935' }, { emoji: '🐮', bg: '#e06666' },
  { emoji: '🦖', bg: '#dcb888' }, { emoji: '🦘', bg: '#00796b' }, { emoji: '🐨', bg: '#8e24aa' }
];

export async function fetchActiveUsers() {
    try {
        const res = await fetch(`${API_URL}/latest`, reqOpts);
        if (res.ok) updatePresenceUI((await res.json()).record._activeUsers || {});
    } catch (err) {}
}

export async function broadcastPresence() {
    try {
        const res = await fetch(`${API_URL}/latest`, reqOpts);
        const list = (await res.json()).record._activeUsers || {};
        list[getCurrentUser()] = { lastSeen: Date.now(), week: getCurrentWeek() };

        await fetch(API_URL, { method: "PUT", ...reqOpts, body: JSON.stringify({ _activeUsers: list }) });
        updatePresenceUI(list);
    } catch (err) {}
}

function updatePresenceUI(list) {
    const badge = document.getElementById('active-users-badge');
    if (!badge) return;

    const now = Date.now();
    const activeSet = new Set(Object.entries(list).filter(([_, d]) => now - d.lastSeen < 60000).map(([n]) => n));

    let html = `<div class="avatar-group" title="Active: ${[...activeSet].join(', ')}">`;
    let count = 0;

    activeSet.forEach(user => {
        if (!userAvatarMap.has(user)) userAvatarMap.set(user, PROFILES[userAvatarMap.size % PROFILES.length]);
        if (count++ < 5) {
            const { emoji, bg } = userAvatarMap.get(user);
            const char = ['bhuvnesh', 'admin'].includes(user.toLowerCase()) ? user[0].toUpperCase() : emoji;
            html += `<div class="avatar-circle" style="background-color: ${bg}">${char}</div>`;
        }
    });

    if (activeSet.size > 5) html += `<div class="avatar-circle avatar-count">+${activeSet.size - 5}</div>`;
    badge.style.background = 'transparent';
    badge.innerHTML = html + `</div>`;
}