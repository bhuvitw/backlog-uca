import { getCurrentUser, getCurrentWeek } from "../state/appState.js";
import { renderTopics } from "./topicsView.js";
import { renderWeeks } from "./weekView.js";
import { setupEvents } from "../events/events.js";
import { renderActiveUsersHeader } from "./activeUserView.js";
import { renderDiscussion } from "./discussionView.js";
import { SUMMARY_TAB_KEY } from "../utils/constant.js";

export function render() {
  const userStatus = document.getElementById('user-status');
  const activeUsersCount = document.getElementById('active-users-count');
  const activeUsersTooltip = document.getElementById('active-users-tooltip');
  const weekTabs = document.getElementById("week-tabs");
  const currentWeekTitle = document.getElementById("current-week-title");
  const topicContainer = document.getElementById("topic-container");
  const addTopicBtn = document.getElementById("add-topic-btn");
  const deleteWeekBtn = document.getElementById("delete-week-btn");
  const discussionPanel = document.getElementById("discussion-panel");

  if (!topicContainer || !currentWeekTitle) return;

  if (userStatus) userStatus.textContent = `User: ${getCurrentUser()}`;
  if (activeUsersCount && activeUsersTooltip) renderActiveUsersHeader(activeUsersCount, activeUsersTooltip);
  
  if (weekTabs) renderWeeks(weekTabs);
  renderTopics(currentWeekTitle, topicContainer, addTopicBtn, deleteWeekBtn);

  if (discussionPanel) {
      if (getCurrentWeek() === SUMMARY_TAB_KEY) {
          discussionPanel.style.display = "none";
      } else {
          discussionPanel.style.display = "flex";
          renderDiscussion();
      }
  }

  setupEvents();
}