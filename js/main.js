import { updateActivePresence } from "./domain/presence.js";
import { addTopic} from "./domain/topics.js";
import { getCurrentUser, getCurrentWeek, getState, setCurrentUser, setCurrentWeek, setState } from "./state/appState.js";
import { render } from "./ui/render.js";
import { renderTopics } from "./ui/topicsView.js";

// CONFIGURATION: JsonBin credentials
const JSONBIN_BIN_ID = "6abe8ef4ffd5d160534359db";
const JSONBIN_API_KEY = "$2a$10$MtvaDn4Utk.fuBQ08te0y.o4CAvIZpaFb5amKJFIB3hLC6uxJytHq";

const API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Sync Control Flags
let saveDebounceTimer = null;
let isSaving = false;
let isUserTyping = false;

// DOM Elements
const usernameInput = document.getElementById('username-input');
const authBtn = document.getElementById('auth-btn');
const syncBtn = document.getElementById('sync-btn');
const addTopicBtn = document.getElementById('add-topic-btn');
const newWeekInput = document.getElementById('new-week-input');
const addWeekBtn = document.getElementById('add-week-btn');
const deleteWeekBtn = document.getElementById('delete-week-btn');
const activeUsersCount = document.getElementById('active-users-count');
const activeUsersTooltip = document.getElementById('active-users-tooltip');

// Default Fallback State
const DEFAULT_SYLLABUS = {
  _activeUsers: {},
  "Week 1": [
    {
      id: Date.now(),
      title: "Sample Topic",
      subtopics: [{ id: Date.now() + 1, text: "Sample Subtopic", doubts: [] }]
    }
  ]
};

// Filter Active Users (< 30s inactive)
function getActiveUsers() {
  if (!getState()._activeUsers) return [];
  const now = Date.now();
  
  return Object.entries(getState()._activeUsers)
    .filter(([_, data]) => {
      const lastSeen = typeof data === 'number' ? data : data.lastSeen;
      return now - lastSeen < 30000;
    })
    .map(([name, data]) => ({
      name,
      week: typeof data === 'object' && data.week ? data.week : "Week 1"
    }));
}

// Render Top Bar Active Users Counter
function renderActiveUsersHeader() {
  const activeList = getActiveUsers();
  const count = activeList.length > 0 ? activeList.length : 1;
  const names = activeList.length > 0 ? activeList.map(u => u.name).join(', ') : getCurrentUser();

  activeUsersCount.textContent = count;
  activeUsersTooltip.textContent = `Active: ${names}`;
}

// Fetch Live Data from JsonBin
async function fetchCloudData(force = false) {
  // Prevent background sync from overwriting state during user edits or ongoing saves
  if ((isUserTyping || isSaving) && !force) return;

  syncBtn.textContent = "⏳ Syncing...";
  try {
    const res = await fetch(`${API_URL}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.record && Object.keys(data.record).length > 0) {
        setState(data.record);
      } else {
        setState(DEFAULT_SYLLABUS);
      }
      updateActivePresence();
      render();
    }
  } catch (err) {
    console.error("Cloud fetch failed", err);
    if (!getState()["Week 1"]) setState(DEFAULT_SYLLABUS);
    render();
  } finally {
    syncBtn.textContent = "🟢 Live";
  }
}

// Push Data to JsonBin
function queueSaveCloudData() {
  syncBtn.textContent = "⏳ Saving...";
  clearTimeout(saveDebounceTimer);
  
  saveDebounceTimer = setTimeout(async () => {
    isSaving = true;
    try {
      await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_API_KEY
        },
        body: JSON.stringify(getState())
      });
      syncBtn.textContent = "🟢 Live";
    } catch (err) {
      console.error("Cloud save failed", err);
      syncBtn.textContent = "🔴 Error";
    } finally {
      isSaving = false;
    }
  }, 400);
}

// User Authentication Input
authBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (name) {
    setCurrentUser(name);
    localStorage.setItem('study_user', getCurrentUser());
    usernameInput.value = '';
    updateActivePresence();
    queueSaveCloudData();
    render();
  }
};

syncBtn.onclick = () => {
  updateActivePresence();
  queueSaveCloudData();
  fetchCloudData(true);
};

// Add New Custom Week Logic
addWeekBtn.onclick = () => {
  const weekName = newWeekInput.value.trim();
  
  if (!weekName) {
    alert("Please enter a week title (e.g., Week 7).");
    return;
  }

  if (getState()[weekName]) {
    alert(`"${weekName}" already exists!`);
    return;
  }

  getState()[weekName] = [
    {
      id: Date.now(),
      title: "New Main Topic",
      subtopics: [{ id: Date.now() + 1, text: "New Subtopic", doubts: [] }]
    }
  ];

  setCurrentWeek(weekName);
  newWeekInput.value = '';

  render();
  queueSaveCloudData();
};

// Fixed Delete Current Week Logic
deleteWeekBtn.onclick = () => {
  if (getCurrentWeek() === SUMMARY_TAB_KEY) return;

  const weekKeys = Object.keys(getState()).filter(k => k !== '_activeUsers');
  
  if (weekKeys.length <= 1) {
    alert("You cannot delete the only remaining week!");
    return;
  }

  if (confirm(`Are you sure you want to delete "${getCurrentWeek()}" and all topics inside it?`)) {
    delete getState()[getCurrentWeek()];
    
    const remainingWeeks = Object.keys(getState()).filter(k => k !== '_activeUsers');
    setCurrentWeek(remainingWeeks[0] || "Week 1");

    render();
    queueSaveCloudData();
  }
};

addTopicBtn.onclick = () => {
  addTopic();
  renderTopics();
  queueSaveCloudData();
};

// Background Polling Every 5 Seconds
setInterval(() => {
  fetchCloudData(false);
}, 300000);

// Initial Load
fetchCloudData(true);