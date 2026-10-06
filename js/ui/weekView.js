import { getState,getCurrentWeek } from "../state/appState.js";

function renderWeeks() {
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
};

export {renderWeeks};