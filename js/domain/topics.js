import { getCurrentWeek, getState } from "../state/appState.js";

function updateTopicTitle(tIndex, newTitle) {
    getState()[getCurrentWeek()][tIndex].title = newTitle; 
}

function deleteTopic(tIndex) {
    getState()[getCurrentWeek()].splice(tIndex, 1);
}

function addTopic() {
    const week = getCurrentWeek(); 
    const state = getState(); 

    if(!state[week]) {
        state[week] = [];
    }

    state[week].push({
        id: Date.now(),
        title: "New Main Topic",
        subtopics: [
            {
                id: Date.now() + 1,
                text: "New Subtopic",
                doubts: [] 
            }
        ]
    })
}

export {updateTopicTitle, deleteTopic, addTopic};