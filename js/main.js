import { addTopic } from "./domain/topics.js";
import { broadcastPresence, fetchActiveUsers } from "./services/presenceDataService.js";
import { fetchCloudData as fetchCloudRecord, queueSaveData } from "./services/sharedDataService.js";
import { getCurrentUser, getState, setCurrentUser, setCurrentWeek, setState, getCurrentWeek } from "./state/appState.js";
import { render } from "./ui/render.js";
import { SUMMARY_TAB_KEY } from "./utils/constant.js";

const getEl = id => document.getElementById(id);
const ui = {
  userInp: getEl('username-input'),
  authBtn: getEl('auth-btn'),
  syncBtn: getEl('sync-btn'),
  addTopicBtn: getEl('add-topic-btn'),
  newWeekInp: getEl('new-week-input'),
  addWeekBtn: getEl('add-week-btn'),
  delWeekBtn: getEl('delete-week-btn')
};

const DEFAULT_STATE = { "Week 1": [{ id: Date.now(), title: "Sample Topic", subtopics: [{ id: Date.now() + 1, text: "Sample Subtopic", doubts: [] }] }] };

async function fetchCloudData() {
  ui.syncBtn.textContent = "⏳ Syncing...";
  try {
    const record = await fetchCloudRecord();
    setState(record && Object.keys(record).length ? record : DEFAULT_STATE);
  } catch (err) {
    if (!getState()["Week 1"]) setState(DEFAULT_STATE);
  } finally {
    ui.syncBtn.textContent = "🟢 Live";
    render();
  }
}

ui.authBtn.onclick = () => {
  const name = ui.userInp.value.trim();
  if (!name) return;
  setCurrentUser(name);
  localStorage.setItem('study_user', name);
  ui.userInp.value = '';
  queueSaveData();
  render();
};

ui.syncBtn.onclick = () => {
  queueSaveData();
  fetchCloudData();
};

ui.addWeekBtn.onclick = () => {
  const weekName = ui.newWeekInp.value.trim();
  if (!weekName || getState()[weekName]) return alert("Invalid or duplicate week!");
  
  getState()[weekName] = [{ id: Date.now(), title: "New Main Topic", subtopics: [{ id: Date.now() + 1, text: "New Subtopic", doubts: [] }] }];
  setCurrentWeek(weekName);
  ui.newWeekInp.value = '';
  queueSaveData();
  render();
};

ui.delWeekBtn.onclick = () => {
  if (getCurrentWeek() === SUMMARY_TAB_KEY) return;
  const keys = Object.keys(getState()).filter(k => k !== '_activeUsers');
  if (keys.length <= 1) return alert("Cannot delete the last week!");

  if (confirm(`Delete ${getCurrentWeek()}?`)) {
    delete getState()[getCurrentWeek()];
    setCurrentWeek(Object.keys(getState()).filter(k => k !== '_activeUsers')[0] || "Week 1");
    queueSaveData();
    render();
  }
};

ui.addTopicBtn.onclick = () => {
  addTopic();
  queueSaveData();
  render();
};

setInterval(fetchCloudData, 300000);
setInterval(broadcastPresence, 30000);
setInterval(fetchActiveUsers, 15000);

fetchCloudData();
broadcastPresence();