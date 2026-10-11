import { addTopic } from "./domain/topics.js";
import { broadcastPresence, fetchActiveUsers } from "./services/presenceDataService.js";
import { fetchCloudData as fetchCloudRecord, queueSaveData } from "./services/sharedDataService.js";
import { getCurrentUser, getState, setCurrentUser, setCurrentWeek, setState, getCurrentWeek } from "./state/appState.js";
import { render } from "./ui/render.js";
import { SUMMARY_TAB_KEY } from "./utils/constant.js";

const getEl = id => document.getElementById(id);
// Change lines 17-54 in main.js to wrap the UI events in a conditional block:

const ui = {
  userInp: getEl('username-input'),
  authBtn: getEl('auth-btn'),
  syncBtn: getEl('sync-btn'),
  addTopicBtn: getEl('add-topic-btn'),
  newWeekInp: getEl('new-week-input'),
  addWeekBtn: getEl('add-week-btn'),
  delWeekBtn: getEl('delete-week-btn')
};

// Only attach event listeners if we are actually on the main syllabus page
if (ui.authBtn && ui.syncBtn) {
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

  if(ui.addWeekBtn) {
      ui.addWeekBtn.onclick = () => {
        const weekName = ui.newWeekInp.value.trim();
        if (!weekName || getState()[weekName]) return alert("Invalid or duplicate week!");
        
        const currentUser = getCurrentUser();
        getState()[weekName] = [{ id: Date.now(), title: "New Main Topic", createdBy: currentUser, subtopics: [{ id: Date.now() + 1, text: "New Subtopic", doubts: [] }] }];
        setCurrentWeek(weekName);
        ui.newWeekInp.value = '';
        queueSaveData();
        render();
      };
  }

  if(ui.delWeekBtn) {
      ui.delWeekBtn.onclick = () => {
        if (getCurrentWeek() === SUMMARY_TAB_KEY) return;

        const weekData = getState()[getCurrentWeek()];
        if (weekData && weekData.length > 0 && weekData[0].createdBy) {
            if (weekData[0].createdBy !== getCurrentUser()) {
                return alert("Access Denied: You can only delete weeks that you created!");
            }
        }

        const keys = Object.keys(getState()).filter(k => k !== '_activeUsers');
        if (keys.length <= 1) return alert("Cannot delete the last week!");

        if (confirm(`Delete ${getCurrentWeek()}?`)) {
          delete getState()[getCurrentWeek()];
          setCurrentWeek(Object.keys(getState()).filter(k => k !== '_activeUsers')[0] || "Week 1");
          queueSaveData();
          render();
        }
      };
  }

  if(ui.addTopicBtn) {
      ui.addTopicBtn.onclick = () => {
        addTopic();
        queueSaveData();
        render();
      };
  }
}

setInterval(fetchCloudData, 300000);
setInterval(broadcastPresence, 60000);
setInterval(fetchActiveUsers, 30000);

fetchCloudData();
broadcastPresence();