import { toggleDoubt } from "./domain/doubt.js";
import { addSubtopic, deleteSubTopic, updateSubTopic } from "./domain/subTopics.js";
import { addTopic, deleteTopic, updateTopicTitle } from "./domain/topics.js";
import { getCurrentUser, getCurrentWeek, getState, setCurrentUser, setCurrentWeek, setState } from "./state/appState.js";

// CONFIGURATION: JsonBin credentials
const JSONBIN_BIN_ID = "6abe8ef4ffd5d160534359db";
const JSONBIN_API_KEY = "$2a$10$MtvaDn4Utk.fuBQ08te0y.o4CAvIZpaFb5amKJFIB3hLC6uxJytHq";

const API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Global App State



const SUMMARY_TAB_KEY = "📌 Complete Syllabus Summary";

// Sync Control Flags
let saveDebounceTimer = null;
let isSaving = false;
let isUserTyping = false;

// DOM Elements
const userStatus = document.getElementById('user-status');
const usernameInput = document.getElementById('username-input');
const authBtn = document.getElementById('auth-btn');
const syncBtn = document.getElementById('sync-btn');
const weekTabs = document.getElementById('week-tabs');
const currentWeekTitle = document.getElementById('current-week-title');
const topicContainer = document.getElementById('topic-container');
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

// Update Heartbeat for Active Presence
function updateActivePresence() {
  if (!getState()._activeUsers) setState()._activeUsers = {};
  getState()._activeUsers[getCurrentUser()] = {
    lastSeen: Date.now(),
    week: getCurrentWeek()
  };
}

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

// Render Sidebar Navigation Tabs
function renderTabs() {
  weekTabs.innerHTML = '';
  const activeUsers = getActiveUsers();

  Object.keys(getState())
    .filter(key => key !== '_activeUsers')
    .forEach(week => {
      const usersInThisWeek = activeUsers.filter(u => u.week === week);
      const userNamesInThisWeek = usersInThisWeek.map(u => u.name);

      const li = document.createElement('li');
      li.className = `week-tab ${week === getCurrentWeek() ? 'active' : ''}`;
      
      const titleSpan = document.createElement('span');
      titleSpan.textContent = week;
      li.appendChild(titleSpan);

      if (usersInThisWeek.length > 0) {
        const activeBadge = document.createElement('span');
        activeBadge.className = 'tab-active-indicator';
        
        if (usersInThisWeek.length === 1) {
          activeBadge.textContent = `🟢 ${userNamesInThisWeek[0]}`;
        } else {
          activeBadge.textContent = `🟢 ${usersInThisWeek.length} online (${userNamesInThisWeek.join(', ')})`;
        }
        
        li.appendChild(activeBadge);
      }

      li.onclick = () => {
        setCurrentWeek(week);
        updateActivePresence();
        queueSaveCloudData();
        render();
      };
      
      weekTabs.appendChild(li);
    });

  // Summary Tab
  const summaryUsers = activeUsers.filter(u => u.week === SUMMARY_TAB_KEY);
  const summaryLi = document.createElement('li');
  summaryLi.className = `week-tab summary-tab ${getCurrentWeek() === SUMMARY_TAB_KEY ? 'active' : ''}`;
  
  const summarySpan = document.createElement('span');
  summarySpan.textContent = SUMMARY_TAB_KEY;
  summaryLi.appendChild(summarySpan);

  if (summaryUsers.length > 0) {
    const activeBadge = document.createElement('span');
    activeBadge.className = 'tab-active-indicator';
    activeBadge.textContent = `🟢 ${summaryUsers.map(u => u.name).join(', ')}`;
    summaryLi.appendChild(activeBadge);
  }

  summaryLi.onclick = () => {
    setCurrentWeek(SUMMARY_TAB_KEY);
    updateActivePresence();
    queueSaveCloudData();
    render();
  };
  
  weekTabs.appendChild(summaryLi);
}

// Render Main Document View
function renderTopics() {
  currentWeekTitle.textContent = getCurrentWeek();
  topicContainer.innerHTML = '';

  if (getCurrentWeek() === SUMMARY_TAB_KEY) {
    addTopicBtn.style.display = "none";
    deleteWeekBtn.style.display = "none";
    renderSyllabusSummaryDashboard();
    return;
  }

  addTopicBtn.style.display = "block";
  deleteWeekBtn.style.display = "inline-block";

  if (!getState()[getCurrentWeek()]) return;

  getState()[getCurrentWeek()].forEach((topic, tIndex) => {
    const card = document.createElement('div');
    card.className = 'topic-card';

    const subtopicsHtml = topic.subtopics.map((sub, sIndex) => {
      const hasDoubt = sub.doubts ? sub.doubts.includes(getCurrentUser()) : false;
      const doubtTags = (sub.doubts || []).map(u => `<span class="user-tag">🙋 ${u}</span>`).join(' ');

      return `
        <div class="subtopic-item">
          <textarea 
            class="subtopic-input" 
            rows="1"
            onfocus="isUserTyping=true"
            onblur="isUserTyping=false"
            data-topic-index="${tIndex}" 
            data-subtopic-index="${sIndex}"
          >${sub.text}</textarea>
          <div class="subtopic-actions">
            ${doubtTags}
            <button class="icon-btn toggle-doubt-btn" data-topic-index="${tIndex}" data-subtopic-index="${sIndex}">${hasDoubt ? '❌ Clear' : '🙋 Doubt'}</button>
            <button class="icon-btn delete-subtopic-btn" data-topic-index="${tIndex}" data-subtopic-index="${sIndex}">🗑️ Delete</button>
          </div>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="card-header">
        <input 
          class="topic-input" 
          value="${topic.title}" 
          onfocus="isUserTyping=true"
          onblur="isUserTyping=false"
          data-topic-index="${tIndex}"
        />
        <button class="icon-btn delete-topic-btn" data-topic-index="${tIndex}">Delete Topic</button>
      </div>
      <div class="subtopics-list">${subtopicsHtml}</div>
      <button class="add-sub-btn" data-topic-index="${tIndex}">+ Add subtopic</button>
    `;

    topicContainer.appendChild(card);
  });

  document.querySelectorAll(".topic-input").forEach(input => {
      input.addEventListener("input", (event) => {
        const topicIndex = Number(event.currentTarget.dataset.topicIndex);
        const newTitle = event.currentTarget.value;

        updateTopicTitle(topicIndex, newTitle);
        queueSaveCloudData(); 
      })
    });

  document.querySelectorAll(".delete-topic-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      const topicIndex = Number(event.currentTarget.dataset.topicIndex); 
      
      const topicName = getState()[getCurrentWeek()][topicIndex].title || "this topic";

      if(confirm(`Are you sure you want to delete "${topicName}" and all the subtopics?`)) {
        deleteTopic(topicIndex); 
        renderTopics(); 
        queueSaveCloudData();
      }
    })
  });

  document.querySelectorAll(".add-sub-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      const topicIndex = Number(event.currentTarget.dataset.topicIndex);

      addSubtopic(topicIndex);
      renderTopics();
      queueSaveCloudData();
    })
  });

  document.querySelectorAll(".delete-subtopic-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      const topicIndex = Number(event.currentTarget.dataset.topicIndex); 
      const subtopicIndex = Number(event.currentTarget.dataset.subtopicIndex); 
      const subtopicText = getState()[getCurrentWeek()][topicIndex].subtopics[subtopicIndex].text || "this subtopic";

      if (confirm(`Are you sure you want to delete "${subtopicText}"?`)) {
        deleteSubTopic(topicIndex, subtopicIndex); 
        renderTopics();
        queueSaveCloudData();
      }
      
    })
  });

  document.querySelectorAll(".toggle-doubt-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      const topicIndex = Number(event.currentTarget.dataset.topicIndex); 
      const subtopicIndex = Number(event.currentTarget.dataset.subtopicIndex); 

      toggleDoubt(topicIndex, subtopicIndex); 
      renderTopics();
      queueSaveCloudData();

    })
  })

  document.querySelectorAll(".subtopic-input").forEach(input => {
    input.addEventListener("input", (event) => {
      const topicIndex = Number(event.currentTarget.dataset.topicIndex); 
      const subTopicIndex = Number(event.currentTarget.dataset.subtopicIndex); 
      const newSubTopicValue = event.currentTarget.value;

      updateSubTopic(topicIndex, subTopicIndex, newSubTopicValue);
      queueSaveCloudData(); 
    })
  });

  

  setTimeout(() => {
    document.querySelectorAll('.subtopic-input').forEach(el => {
      el.style.height = 'auto';
      el.style.height = (el.scrollHeight + 8) + 'px';
    });
  }, 50);
}

// Summary Dashboard
function renderSyllabusSummaryDashboard() {
  const container = document.createElement('div');

  (Object.keys(getState()))
    .filter(k => k !== '_activeUsers')
    .forEach(week => {
      const weekSection = document.createElement('div');
      weekSection.className = 'summary-week-section';
      weekSection.innerHTML = `<h2 class="summary-week-title">${week}</h2>`;

      getState()[week].forEach(topic => {
        const topicCard = document.createElement('div');
        topicCard.className = 'summary-topic-card';
        
        let subtopicsHtml = '';

        topic.subtopics.forEach(sub => {
          const doubtCount = sub.doubts ? sub.doubts.length : 0;
          const studentNames = doubtCount > 0 
            ? sub.doubts.map(u => `<span class="user-tag">🙋 ${u}</span>`).join(' ') 
            : `<span class="no-doubt-tag">✅ Clear</span>`;

          subtopicsHtml += `
            <div class="summary-subtopic-row">
              <div class="summary-subtopic-text">${sub.text}</div>
              <div class="summary-subtopic-meta">
                <span class="doubt-badge ${doubtCount > 0 ? 'has-doubts' : ''}">${doubtCount} Doubts</span>
                <div class="student-list">${studentNames}</div>
              </div>
            </div>
          `;
        });

        topicCard.innerHTML = `
          <div class="summary-topic-header">${topic.title}</div>
          <div class="summary-subtopics-list">${subtopicsHtml}</div>
        `;

        weekSection.appendChild(topicCard);
      });

      container.appendChild(weekSection);
    });

  topicContainer.appendChild(container);
}

addTopicBtn.onclick = () => {
  addTopic();
  renderTopics();
  queueSaveCloudData();
};

function render() {
  userStatus.textContent = `User: ${getCurrentUser()}`;
  renderActiveUsersHeader();
  renderTabs();
  renderTopics();
}

// Background Polling Every 5 Seconds
setInterval(() => {
  fetchCloudData(false);
}, 300000);

// Initial Load
fetchCloudData(true);