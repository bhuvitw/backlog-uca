// CONFIGURATION: JsonBin credentials
const JSONBIN_BIN_ID = "6a888600f5f4af5e29321b4a";
const JSONBIN_API_KEY = "$2a$10$gj4311d5rdLAGcMEteWRxevY7dmIS1adsXqHSpANszxs8Xpq7usd2";

const API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Global App State
let currentUser = localStorage.getItem('study_user') || "Aman";
let currentWeek = "Week 1";
let state = {};

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

// Default Fallback State
const DEFAULT_SYLLABUS = {
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
  if (isUserTyping && !force) return;

  syncBtn.textContent = "⏳ Syncing...";
  try {
    const res = await fetch(`${API_URL}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.record && Object.keys(data.record).length > 0) {
        state = data.record;
      } else {
        state = DEFAULT_SYLLABUS;
        queueSaveCloudData();
      }
      render();
    }
  } catch (err) {
    console.error("Cloud fetch failed, using internal syllabus state", err);
    state = DEFAULT_SYLLABUS;
    render();
  } finally {
    syncBtn.textContent = "🟢 Live";
  }
}

// Push Data to JsonBin with Debounce & Optimistic Save
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
        body: JSON.stringify(state)
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
    currentUser = name;
    localStorage.setItem('study_user', currentUser);
    usernameInput.value = '';
    render();
  }
};

syncBtn.onclick = () => fetchCloudData(true);

// Add New Custom Week Logic
addWeekBtn.onclick = () => {
  const weekName = newWeekInput.value.trim();
  
  if (!weekName) {
    alert("Please enter a week title (e.g., Week 7).");
    return;
  }

  if (state[weekName]) {
    alert(`"${weekName}" already exists!`);
    return;
  }

  state[weekName] = [
    {
      id: Date.now(),
      title: "New Main Topic",
      subtopics: [{ id: Date.now() + 1, text: "New Subtopic", doubts: [] }]
    }
  ];

  currentWeek = weekName;
  newWeekInput.value = '';

  render();
  queueSaveCloudData();
};

// Render Sidebar Navigation Tabs
function renderTabs() {
  weekTabs.innerHTML = '';
  
  Object.keys(state).forEach(week => {
    const li = document.createElement('li');
    li.className = `week-tab ${week === currentWeek ? 'active' : ''}`;
    li.textContent = week;
    li.onclick = () => {
      currentWeek = week;
      render();
    };
    weekTabs.appendChild(li);
  });

  const summaryLi = document.createElement('li');
  summaryLi.className = `week-tab summary-tab ${currentWeek === SUMMARY_TAB_KEY ? 'active' : ''}`;
  summaryLi.textContent = SUMMARY_TAB_KEY;
  summaryLi.onclick = () => {
    currentWeek = SUMMARY_TAB_KEY;
    render();
  };
  weekTabs.appendChild(summaryLi);
}

// Render Document View or Summary Dashboard
function renderTopics() {
  currentWeekTitle.textContent = currentWeek;
  topicContainer.innerHTML = '';

  if (currentWeek === SUMMARY_TAB_KEY) {
    addTopicBtn.style.display = "none";
    renderSyllabusSummaryDashboard();
    return;
  }

  addTopicBtn.style.display = "block";

  if (!state[currentWeek]) return;

  state[currentWeek].forEach((topic, tIndex) => {
    const card = document.createElement('div');
    card.className = 'topic-card';

    const subtopicsHtml = topic.subtopics.map((sub, sIndex) => {
      const hasDoubt = sub.doubts.includes(currentUser);
      const doubtTags = sub.doubts.map(u => `<span class="user-tag">🙋 ${u}</span>`).join(' ');

      return `
        <div class="subtopic-item">
          <textarea 
            class="subtopic-input" 
            rows="1"
            onfocus="isUserTyping=true"
            onblur="isUserTyping=false"
            oninput="this.style.height='auto'; this.style.height=this.scrollHeight+'px'; updateSubtopic(${tIndex}, ${sIndex}, this.value)"
          >${sub.text}</textarea>
          <div class="subtopic-actions">
            ${doubtTags}
            <button class="icon-btn" onclick="toggleDoubt(${tIndex}, ${sIndex})">${hasDoubt ? '❌ Clear' : '🙋 Doubt'}</button>
            <button class="icon-btn" onclick="deleteSubtopic(${tIndex}, ${sIndex})">🗑️ Delete</button>
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
          oninput="updateTopicTitle(${tIndex}, this.value)" 
        />
        <button class="icon-btn" onclick="deleteTopic(${tIndex})">Delete Topic</button>
      </div>
      <div class="subtopics-list">${subtopicsHtml}</div>
      <button class="add-sub-btn" onclick="addSubtopic(${tIndex})">+ Add subtopic</button>
    `;

    topicContainer.appendChild(card);
  });

  setTimeout(() => {
    document.querySelectorAll('.subtopic-input').forEach(el => {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
  }, 0);
}

// Render Complete Syllabus Summary View
function renderSyllabusSummaryDashboard() {
  const container = document.createElement('div');

  Object.keys(state).forEach(week => {
    const weekSection = document.createElement('div');
    weekSection.className = 'summary-week-section';
    weekSection.innerHTML = `<h2 class="summary-week-title">${week}</h2>`;

    state[week].forEach(topic => {
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

// Local Mutations with Queued Background Saving
function updateTopicTitle(tIndex, val) { 
  state[currentWeek][tIndex].title = val; 
  queueSaveCloudData(); 
}

function deleteTopic(tIndex) {
  const topicName = state[currentWeek][tIndex].title || "this topic";
  if (confirm(`Are you sure you want to delete "${topicName}" and all its subtopics?`)) {
    state[currentWeek].splice(tIndex, 1);
    renderTopics();
    queueSaveCloudData();
  }
}

function addSubtopic(tIndex) { 
  state[currentWeek][tIndex].subtopics.push({ id: Date.now(), text: "New Subtopic", doubts: [] }); 
  renderTopics();
  queueSaveCloudData(); 
}

function updateSubtopic(tIndex, sIndex, val) { 
  state[currentWeek][tIndex].subtopics[sIndex].text = val; 
  queueSaveCloudData(); 
}

function deleteSubtopic(tIndex, sIndex) {
  const subtopicText = state[currentWeek][tIndex].subtopics[sIndex].text || "this subtopic";
  if (confirm(`Are you sure you want to delete "${subtopicText}"?`)) {
    state[currentWeek][tIndex].subtopics.splice(sIndex, 1);
    renderTopics();
    queueSaveCloudData();
  }
}

function toggleDoubt(tIndex, sIndex) {
  const doubts = state[currentWeek][tIndex].subtopics[sIndex].doubts;
  const idx = doubts.indexOf(currentUser);
  if (idx === -1) doubts.push(currentUser);
  else doubts.splice(idx, 1);
  renderTopics();
  queueSaveCloudData();
}

addTopicBtn.onclick = () => {
  if (!state[currentWeek]) state[currentWeek] = [];
  state[currentWeek].push({
    id: Date.now(),
    title: "New Main Topic",
    subtopics: [{ id: Date.now() + 1, text: "New Subtopic", doubts: [] }]
  });
  renderTopics();
  queueSaveCloudData();
};

function render() {
  userStatus.textContent = `User: ${currentUser}`;
  renderTabs();
  renderTopics();
}

// Background Polling Every 8 Seconds
setInterval(() => fetchCloudData(false), 8000);

// Initial Load
fetchCloudData(true);