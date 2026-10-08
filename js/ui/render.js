import { getCurrentUser } from "../state/appState.js";
import { renderTopics } from "./topicsView.js";
import { renderWeeks } from "./weekView.js";
import { setupEvents } from "../events/events.js";

const weekTabs = document.getElementById("week-tabs");
const currentWeekTitle = document.getElementById("current-week-title");
const topicContainer = document.getElementById("topic-container");
const addTopicBtn = document.getElementById("add-topic-btn");
const deleteWeekBtn = document.getElementById("delete-week-btn");
const userStatus = document.getElementById('user-status');

function render() {
  userStatus.textContent = `User: ${getCurrentUser()}`;
  // renderActiveUsersHeader();
  renderWeeks(weekTabs);
  renderTopics(currentWeekTitle, topicContainer, addTopicBtn, deleteWeekBtn);
  setupEvents();
}

export {render}