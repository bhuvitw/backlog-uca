import { getState, getCurrentUser,getCurrentWeek } from "../state/appState.js";
import { SUMMARY_TAB_KEY } from "../utils/constant.js";
import { renderSyllabusSummaryDashboard } from "./summaryView.js";

function renderTopics(
  currentWeekTitle,
  topicContainer,
  addTopicBtn,
  deleteWeekBtn
) {
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
          data-topic-index="${tIndex}"
        />
        <button class="icon-btn delete-topic-btn" data-topic-index="${tIndex}">Delete Topic</button>
      </div>
      <div class="subtopics-list">${subtopicsHtml}</div>
      <button class="add-sub-btn" data-topic-index="${tIndex}">+ Add subtopic</button>
    `;

    topicContainer.appendChild(card);
  });

  setTimeout(() => {
    document.querySelectorAll('.subtopic-input').forEach(el => {
      el.style.height = 'auto';
      el.style.height = (el.scrollHeight + 8) + 'px';
    });
  }, 50);
}

export {renderTopics}