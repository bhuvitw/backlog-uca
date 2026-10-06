import { getCurrentWeek, getState } from "../state/appState.js";

function updateTopicTitle(tIndex, newTitle) {
    getState()[getCurrentWeek()][tIndex].title = newTitle; 
}

function deleteTopic(tIndex) {
    getState()[getCurrentWeek()].splice(tIndex, 1);
}

function addTopic() {
    if(!getState()[getCurrentWeek()]) {
        getState()[getCurrentWeek] = [];
    }

    getState()[getCurrentWeek()].push({
        id: Date.now(),
        title: "New Main Topic",
        subtopics: [
            {
                id: Date.now() + 1,
                title: "New Subtopic",
                doubt: [] 
            }
        ]
    })
}

export {updateTopicTitle, deleteTopic, addTopic};