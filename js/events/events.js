import { updateActivePresence } from "../domain/presence.js";
import { updateTopicTitle } from "../domain/topics.js";
import { saveData } from "../services/sharedDataService.js";
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
            updateActivePresence()
            render();
        });
    });

    document.querySelectorAll(".subtopic-input").forEach(input => {
        input.addEventListener("input", (event) => {
        const topicIndex = Number(event.currentTarget.dataset.topicIndex); 
        const subTopicIndex = Number(event.currentTarget.dataset.subtopicIndex); 
        const newText = event.currentTarget.value;

        updateSubTopic(topicIndex, subTopicIndex, newText);
        })
    });

    document.querySelectorAll(".toggle-doubt-btn").forEach(button => {
        button.addEventListener("click", (event) => {
        const topicIndex = Number(event.currentTarget.dataset.topicIndex); 
        const subtopicIndex = Number(event.currentTarget.dataset.subtopicIndex); 

        toggleDoubt(topicIndex, subtopicIndex); 
        render()
        //save
        saveData()
        })
    })

    document.querySelectorAll(".delete-subtopic-btn").forEach(button => {
        button.addEventListener("click", (event) => {
        const topicIndex = Number(event.currentTarget.dataset.topicIndex); 
        const subtopicIndex = Number(event.currentTarget.dataset.subtopicIndex); 
        const subtopicText = getState()[getCurrentWeek()][topicIndex].subtopics[subtopicIndex].text || "this subtopic";

        if (confirm(`Are you sure you want to delete "${subtopicText}"?`)) {
            deleteSubTopic(topicIndex, subtopicIndex); 
            render();
            //save
            saveData();
        }
        
        })
    }); 

    document.querySelectorAll(".add-sub-btn").forEach(button => {
        button.addEventListener("click", (event) => {
        const topicIndex = Number(event.currentTarget.dataset.topicIndex);

        addSubtopic(topicIndex);
        render();
        //save
        saveData();
        })
    });

    document.querySelectorAll(".delete-topic-btn").forEach(button => {
        button.addEventListener("click", (event) => {
        const topicIndex = Number(event.currentTarget.dataset.topicIndex); 
        
        const topicName = getState()[getCurrentWeek()][topicIndex].title || "this topic";

        if(confirm(`Are you sure you want to delete "${topicName}" and all the subtopics?`)) {
            deleteTopic(topicIndex); 
            render()
            // save
            saveData()
        }
        })
    });
}

export { setupEvents };