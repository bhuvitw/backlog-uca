import { getState } from "../state/appState.js";

function renderSyllabusSummaryDashboard(topicContainer) {
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

export {renderSyllabusSummaryDashboard}