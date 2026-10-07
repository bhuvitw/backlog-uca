import { updateTopicTitle } from "../domain/topics.js";

function setupEvents() {
    document.querySelectorAll(".topic-input").forEach(input => {
        input.addEventListener("input", (event) => {
            const topicIndex = Number(event.currentTarget.dataset.topicIndex);
            const newTitle = event.currentTarget.value;

            updateTopicTitle(topicIndex, newTitle);
        })
    })
}

export { setupEvents };