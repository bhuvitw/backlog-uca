import { getState, getCurrentUser,getCurrentWeek } from "../state/appState.js";

function renderTopics() {
  currentWeekTitle.textContent = getCurrentWeek();
  topicContainer.innerHTML = '';

  if (getCurrentWeek() === SUMMARY_TAB_KEY) {
    addTopicBtn.style.display = "none";
    deleteWeekBtn.style.display = "none";
    renderSyllabusSummaryDashboard(topicContainer);
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

export {renderTopics}