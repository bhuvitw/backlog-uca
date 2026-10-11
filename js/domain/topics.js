import { getCurrentUser, getCurrentWeek, getState } from "../state/appState.js";

function updateTopicTitle(tIndex, newTitle) {
    getState()[getCurrentWeek()][tIndex].title = newTitle; 
}

function deleteTopic(tIndex) {
    getState()[getCurrentWeek()].splice(tIndex, 1);
}

function addTopic() {
    const week = getCurrentWeek(); 
    const state = getState(); 
    const currentUser = getCurrentUser(); 

    if(!state[week]) {
        state[week] = [];
    }

    state[week].push({
        id: Date.now(),
        title: "New Main Topic",
        createdBy: currentUser,
        subtopics: [
            {
                id: Date.now() + 1,
                text: "New Subtopic",
                createdBy: currentUser,
                doubts: [] 
            }
        ]
    })
}

export {updateTopicTitle, deleteTopic, addTopic};