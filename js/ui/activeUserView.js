import { getActiveUsers } from "../domain/presence.js";
import { getCurrentUser } from "../state/appState.js";

function renderActiveUsersHeader() {
  const activeList = getActiveUsers();
  
  const count = activeList.length > 0 ? activeList.length : 1;
  const names = activeList.length > 0 ? activeList.map(u => u.name).join(', ') : getCurrentUser();

  activeUsersCount.textContent = count;
  activeUsersTooltip.textContent = `Active: ${names}`;
}

export {renderActiveUsersHeader}