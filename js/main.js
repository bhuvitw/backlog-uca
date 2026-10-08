import { updateActivePresence } from "./domain/presence.js";
import { addTopic} from "./domain/topics.js";
import { queueSaveData } from "./services/sharedDataService.js";
import { getCurrentUser, getCurrentWeek, getState, setCurrentUser, setCurrentWeek, setState } from "./state/appState.js";
import { render } from "./ui/render.js";
import { SUMMARY_TAB_KEY } from "./utils/constant.js";

const JSONBIN_BIN_ID = "6abe8ef4ffd5d160534359db";
const JSONBIN_API_KEY = "$2a$10$MtvaDn4Utk.fuBQ08te0y.o4CAvIZpaFb5amKJFIB3hLC6uxJytHq";

const API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Sync Control Flags

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


// User Authentication Input
authBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (name) {
    setCurrentUser(name);
    localStorage.setItem('study_user', getCurrentUser());
    usernameInput.value = '';
    updateActivePresence();
    queueSaveData();
    render();
  }
};

syncBtn.onclick = () => {
  updateActivePresence();
  queueSaveData();
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
  queueSaveData();
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
    queueSaveData();
  }
};



addTopicBtn.onclick = () => {
  addTopic();
  render()
  queueSaveData();
};

// Background Polling Every 5 Seconds
setInterval(() => {
  fetchCloudData(false);
}, 300000);

// Initial Load
fetchCloudData(true);