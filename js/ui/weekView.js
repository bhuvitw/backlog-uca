import { getActiveUsers } from "../domain/presence.js";
import { getState,getCurrentWeek } from "../state/appState.js";
import { SUMMARY_TAB_KEY } from "../utils/constant.js";

function renderWeeks(weekTabs) {
  weekTabs.innerHTML = '';
  const activeUsers = getActiveUsers();

  Object.keys(getState())
    .filter(key => key !== '_activeUsers')
    .forEach(week => {
      const usersInThisWeek = activeUsers.filter(u => u.week === week);
      const userNamesInThisWeek = usersInThisWeek.map(u => u.name);

      const li = document.createElement('li');
      li.className = `week-tab ${week === getCurrentWeek() ? 'active' : ''}`;
      li.dataset.week = week;

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

      
      
      weekTabs.appendChild(li);
    });

  // Summary Tab
  const summaryUsers = activeUsers.filter(u => u.week === SUMMARY_TAB_KEY);
  const summaryLi = document.createElement('li');
  summaryLi.className = `week-tab summary-tab ${getCurrentWeek() === SUMMARY_TAB_KEY ? 'active' : ''}`;
  summaryLi.dataset.week = SUMMARY_TAB_KEY;

  const summarySpan = document.createElement('span');
  summarySpan.textContent = SUMMARY_TAB_KEY;
  summaryLi.appendChild(summarySpan);

  if (summaryUsers.length > 0) {
    const activeBadge = document.createElement('span');
    activeBadge.className = 'tab-active-indicator';
    activeBadge.textContent = `🟢 ${summaryUsers.map(u => u.name).join(', ')}`;
    summaryLi.appendChild(activeBadge);
  }
  
  weekTabs.appendChild(summaryLi);
};

export {renderWeeks};