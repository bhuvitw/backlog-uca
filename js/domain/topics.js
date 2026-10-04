import { getCurrentWeek, getState } from "../state/appState.js";

function updateTopicTitle(tIndex, newTitle) {
    getState()[getCurrentWeek()][tIndex].title = newTitle; 
}
// deleteTopic()
// addTopic()

export {updateTopicTitle};