import { getCurrentUser } from "../state/appState.js";
import { renderTopics } from "./topicsView.js";
import { renderWeeks } from "./weekView.js";

function render() {
  userStatus.textContent = `User: ${getCurrentUser()}`;
//   renderActiveUsersHeader();
  renderWeeks();
  renderTopics();
}

export {render}