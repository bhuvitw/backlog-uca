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

// Grounded Syllabus Dataset from UCA Assignment Data
const DEFAULT_SYLLABUS = {
  "Week 1": [
    {
      id: 101,
      title: "Linux & Operating System Basics",
      subtopics: [
        { id: 1011, text: "Linux Distribution & Distribution Info (/etc/os-release)", doubts: [] },
        { id: 1012, text: "File System Concepts, Metadata, Attributes & Permissions", doubts: [] },
        { id: 1013, text: "Hard Links, UID, GID & Timestamps (atime, mtime, ctime)", doubts: [] }
      ]
    },
    {
      id: 102,
      title: "Git, Environment Setup & POSIX Calls",
      subtopics: [
        { id: 1021, text: "Git Configuration (git config, clone, .gitignore, push)", doubts: [] },
        { id: 1022, text: "C/C++ & Java Environment Compilation & Execution", doubts: [] },
        { id: 1023, text: "POSIX File I/O Calls (open, read, write, close, stat)", doubts: [] }
      ]
    },
    {
      id: 103,
      title: "Sorting Algorithms & Empirical Analysis",
      subtopics: [
        { id: 1031, text: "O(n²) Sorts vs O(n log n) Sorts (Bubble, Insertion, Quick, Merge, Heap)", doubts: [] },
        { id: 1032, text: "Empirical Execution Timing vs Theoretical Complexity", doubts: [] },
        { id: 1033, text: "Handling Random, Ascending & Descending Input Arrays", doubts: [] }
      ]
    },
    {
      id: 104,
      title: "Web, DBMS & Shell Utilities",
      subtopics: [
        { id: 1041, text: "Viewport Configuration, CSR vs SSR Rendering Concepts", doubts: [] },
        { id: 1042, text: "Log Management with find, print0, xargs -P & gzip", doubts: [] },
        { id: 1043, text: "Parsing CPU Info (lscpu, grep, awk, sed, cut)", doubts: [] }
      ]
    }
  ],
  "Week 2": [
    {
      id: 201,
      title: "Clean Code & Algorithmic Optimizations",
      subtopics: [
        { id: 2011, text: "Expressive Naming, Naming Conventions & Intent Clarity", doubts: [] },
        { id: 2012, text: "Fibonacci Optimizations (O(n)/O(log n) Time & O(1) Space)", doubts: [] }
      ]
    },
    {
      id: 202,
      title: "C File I/O & AWK Text Processing",
      subtopics: [
        { id: 2021, text: "Low-level C File Handling & File Descriptors", doubts: [] },
        { id: 2022, text: "AWK Scripting (NR, NF, BEGIN/END, Row Aggregation)", doubts: [] }
      ]
    },
    {
      id: 203,
      title: "JavaScript Mechanics & Async Execution",
      subtopics: [
        { id: 2031, text: "Hoisting, Temporal Dead Zone (var vs let vs const)", doubts: [] },
        { id: 2032, text: "Function Declarations vs Function Expressions vs Arrow Functions", doubts: [] },
        { id: 2033, text: "Generators (function*, yield, infinite iteration)", doubts: [] },
        { id: 2034, text: "Async JS, Promises, Event Loop Scheduling & Microtasks", doubts: [] }
      ]
    }
  ],
  "Week 3": [
    {
      id: 301,
      title: "Linux System Programming & Stream Editing",
      subtopics: [
        { id: 3011, text: "POSIX APIs, File Metadata & Command-line Arguments", doubts: [] },
        { id: 3012, text: "sed Stream Editing (Regex substitution, In-place log masking)", doubts: [] }
      ]
    },
    {
      id: 302,
      title: "JS Execution Engine & Relational DBs",
      subtopics: [
        { id: 3021, text: "Call Stack, Callback Queue & Asynchronous Event Loop", doubts: [] },
        { id: 3022, text: "Web Rendering Strategies & Browser Viewport", doubts: [] },
        { id: 3023, text: "Relational Data Modeling & Basic SQL Query Filtering", doubts: [] }
      ]
    }
  ],
  "Week 4": [
    {
      id: 401,
      title: "Bitwise Operations & Two's Complement",
      subtopics: [
        { id: 4011, text: "Bitwise Operators (&, |, ^, ~, <<, >>) & Custom Bit Masks", doubts: [] },
        { id: 4012, text: "Two's Complement Representation & fitsBits Logic", doubts: [] },
        { id: 4013, text: "Sign Detection & 32-bit Integer Byte Extraction", doubts: [] }
      ]
    },
    {
      id: 402,
      title: "Experimental Sorting Benchmarks",
      subtopics: [
        { id: 4021, text: "Runtime Benchmarks Across Best, Worst & Average Cases", doubts: [] },
        { id: 4022, text: "Plotting Execution Time vs Array Input Size", doubts: [] }
      ]
    }
  ],
  "Week 5": [
    {
      id: 501,
      title: "SQL Subqueries & Set Operations",
      subtopics: [
        { id: 5011, text: "Nested & Aggregate Subqueries (AVG, Salary comparisons)", doubts: [] },
        { id: 5012, text: "Correlated Subqueries (IN, EXISTS, ANY, ALL)", doubts: [] },
        { id: 5013, text: "SQL Set Operators (UNION, UNION ALL, INTERSECT, EXCEPT)", doubts: [] }
      ]
    },
    {
      id: 502,
      title: "Advanced Data Structures & Base64",
      subtopics: [
        { id: 5021, text: "Running Median Problem & Online Data Streaming", doubts: [] },
        { id: 5022, text: "Heap Sort (Max Heap, Heapify, Heapify-down)", doubts: [] },
        { id: 5023, text: "Base64 Encoding/Decoding & 24-bit to 6-bit Bit Packing", doubts: [] }
      ]
    }
  ],
  "Week 6": [
    {
      id: 601,
      title: "Generic Heaps & Pointer Manipulation",
      subtopics: [
        { id: 6011, text: "Generic Heap Sort in C (void*, memcpy, function pointers)", doubts: [] },
        { id: 6012, text: "Finding Repeated Frequency Elements (O(n) time, O(1) space)", doubts: [] }
      ]
    },
    {
      id: 602,
      title: "Virtual Memory & Hardware Page Translation",
      subtopics: [
        { id: 6021, text: "32-bit Address Translation (20-bit Page #, 12-bit Offset, 0xFFF Masking)", doubts: [] },
        { id: 6022, text: "LRU Page Replacement Algorithm Simulation & Page Fault Tracking", doubts: [] }
      ]
    },
    {
      id: 603,
      title: "ES6 Collections & Object-Oriented JS",
      subtopics: [
        { id: 6031, text: "ES6 Map vs Set (Key equality, unique value collections)", doubts: [] },
        { id: 6032, text: "Constructor Functions, 'new' Execution Mechanics & Prototypes", doubts: [] },
        { id: 6033, text: "ES6 Classes vs Factory Functions Memory Comparison", doubts: [] }
      ]
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

  // Adjust heights for initial load
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