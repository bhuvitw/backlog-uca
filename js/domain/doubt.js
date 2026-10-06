import { getCurrentUser, getCurrentWeek, getState } from "../state/appState.js";


function toggleDoubt(tIndex, sIndex) {
  if (!getState()[getCurrentWeek()][tIndex].subtopics[sIndex].doubts) {
    getState()[getCurrentWeek()][tIndex].subtopics[sIndex].doubts = [];
  }
  const doubts = getState()[getCurrentWeek()][tIndex].subtopics[sIndex].doubts;
  const idx = doubts.indexOf(getCurrentUser());
  if (idx === -1) doubts.push(getCurrentUser());
  else doubts.splice(idx, 1);
}

export {toggleDoubt};