import { getState } from "../state/appState.js";

function renderSyllabusSummaryDashboard(topicContainer) {
  const container = document.createElement('div');

  // --- 1. WEB WORKER INTEGRATION (Analytics Dashboard) ---
  const analyticsDiv = document.createElement('div');
  analyticsDiv.innerHTML = `<p style="font-weight: 500; color: var(--text-muted);">⏳ Crunching syllabus analytics in background...</p>`;
  analyticsDiv.style.cssText = "margin-bottom: 24px; padding: 16px; background: var(--accent-blue-bg); border: 1px solid var(--accent-blue); border-radius: 8px;";
  container.appendChild(analyticsDiv);

  if (window.Worker) {
    // Initialize Web Worker
    const worker = new Worker('./js/utils/analyticsWorker.js');
    
    // Pass the entire application state to the background worker
    worker.postMessage(getState()); 

    // Listen for the result
    worker.onmessage = function(e) {
      const { totalTopics, totalSubtopics, totalDoubts, hotTopic } = e.data;
      
      analyticsDiv.innerHTML = `
        <h3 style="margin-bottom: 12px; color: var(--accent-blue); font-size: 16px;">📊 Live Syllabus Analytics</h3>
        <div style="display: flex; gap: 20px; flex-wrap: wrap; font-size: 14px;">
          <div><strong>Total Topics:</strong> ${totalTopics}</div>
          <div><strong>Total Subtopics:</strong> ${totalSubtopics}</div>
          <div><strong>Total Doubts:</strong> <span style="color: var(--accent-red); font-weight: bold;">${totalDoubts}</span></div>
          <div><strong>🔥 Hot Topic:</strong> ${hotTopic}</div>
        </div>
      `;
      worker.terminate(); // Clean up worker after use
    };
  }
  // --- END WORKER INTEGRATION ---

  // --- 2. EXISTING SUMMARY RENDER LOGIC ---
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