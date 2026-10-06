import { getCurrentWeek, getState } from "../state/appState.js";

function addSubtopic(tIndex) {
    getState()[getCurrentWeek()][tIndex].subtopics.push({ id: Date.now(), text: "New Subtopic", doubts: [] }); 
}

function updateSubTopic(tIndex, sIndex, val) {
  getState()[getCurrentWeek()][tIndex].subtopics[sIndex].text = val; 
}

function deleteSubTopic(tIndex, sIndex) {
    getState()[getCurrentWeek()][tIndex].subtopics.splice(sIndex, 1);
}

export {addSubtopic, updateSubTopic, deleteSubTopic}