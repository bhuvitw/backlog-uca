import { getCurrentUser } from "../state/appState.js";
import { renderTopics } from "./topicsView.js";
import { renderWeeks } from "./weekView.js";
import { setupEvents } from "../events/events.js";

function render(userStatus) {
  userStatus.textContent = `User: ${getCurrentUser()}`;
  // renderActiveUsersHeader();
  renderWeeks();
  renderTopics();
  setupEvents();
}

export {render}