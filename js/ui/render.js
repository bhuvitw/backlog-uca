import { getCurrentUser } from "../state/appState.js";
import { renderTopics } from "./topicsView.js";
import { renderWeeks } from "./weekView.js";
import { setupEvents } from "../events/events.js";
import { renderActiveUsersHeader } from "./activeUserView.js";
import { renderDiscussion } from "./discussionView.js";

export function render() {
  const userStatus = document.getElementById('user-status');
  const activeUsersCount = document.getElementById('active-users-count');
  const activeUsersTooltip = document.getElementById('active-users-tooltip');
  const weekTabs = document.getElementById("week-tabs");
  const currentWeekTitle = document.getElementById("current-week-title");
  const topicContainer = document.getElementById("topic-container");
  const addTopicBtn = document.getElementById("add-topic-btn");
  const deleteWeekBtn = document.getElementById("delete-week-btn");

  // EARLY EXIT: If the main workspace elements don't exist (like on notes.html), stop here.
  if (!topicContainer || !currentWeekTitle) return;

  if (userStatus) userStatus.textContent = `User: ${getCurrentUser()}`;
  if (activeUsersCount && activeUsersTooltip) renderActiveUsersHeader(activeUsersCount, activeUsersTooltip);
  
  if (weekTabs) renderWeeks(weekTabs);
  renderTopics(currentWeekTitle, topicContainer, addTopicBtn, deleteWeekBtn);
  renderDiscussion();
  setupEvents();
}
