import { updateTopicTitle } from "../domain/topics.js";
import { setCurrentUser, setCurrentWeek } from "../state/appState.js";
import { render } from "../ui/render.js";

function setupEvents() {
    document.querySelectorAll(".topic-input").forEach(input => {
        input.addEventListener("input", (event) => {
            const topicIndex = Number(event.currentTarget.dataset.topicIndex);
            const newTitle = event.currentTarget.value;

            updateTopicTitle(topicIndex, newTitle);
        })
    })

    document.querySelectorAll(".week-tab").forEach(tab => {
        tab.addEventListener("click", (event) => {
            const week = event.currentTarget.dataset.week;

            // later:
            // setCurrentWeek(week)
            setCurrentWeek(week);
            render();
        });
    });

}

export { setupEvents };