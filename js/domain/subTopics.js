import { getCurrentUser, getCurrentWeek, getState } from "../state/appState.js";

function addSubtopic(tIndex) {
    const state = getState(); 
    const currentWeek = getCurrentWeek(); 
    const currentUser = getCurrentUser();
    
    state[currentWeek][tIndex].subtopics.push({
        id: Date.now(),
        text: "New Subtopic",
        createdBy: currentUser,
        doubts: []
    })
}

function updateSubTopic(tIndex, sIndex, val) {
  getState()[getCurrentWeek()][tIndex].subtopics[sIndex].text = val; 
}

function deleteSubTopic(tIndex, sIndex) {
    getState()[getCurrentWeek()][tIndex].subtopics.splice(sIndex, 1);
}

export {addSubtopic, updateSubTopic, deleteSubTopic}