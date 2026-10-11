import { updateTopicTitle, deleteTopic } from "../domain/topics.js";
import { addSubtopic, deleteSubTopic, updateSubTopic } from "../domain/subTopics.js";
import { toggleDoubt } from "../domain/doubt.js";
import { queueSaveData, saveLocalOnly } from "../services/sharedDataService.js";
import { getCurrentWeek, getState, setCurrentWeek } from "../state/appState.js";
import { render } from "../ui/render.js";
import { updateActivePresence } from "../domain/presence.js";
import { broadcastPresence } from "../services/presenceDataService.js";

export function setupEvents() {
    const discussToggleBtn = document.getElementById("mobile-discuss-toggle");
    const discussPanel = document.getElementById("discussion-panel");
    const closeDiscussBtn = document.getElementById("close-discuss-btn");

    if (discussToggleBtn && discussPanel) {
        // Ensure we don't attach multiple listeners if setupEvents is called multiple times
        discussToggleBtn.replaceWith(discussToggleBtn.cloneNode(true));
        const newToggleBtn = document.getElementById("mobile-discuss-toggle");
        
        newToggleBtn.addEventListener("click", () => {
            const isOpen = discussPanel.classList.contains("open");
            if (isOpen) {
                discussPanel.classList.remove("open");
                newToggleBtn.innerHTML = "💬 Discussion";
            } else {
                discussPanel.classList.add("open");
                newToggleBtn.innerHTML = "✖ Close";
            }
        });
    }

    if (closeDiscussBtn && discussPanel) {
        closeDiscussBtn.replaceWith(closeDiscussBtn.cloneNode(true));
        const newCloseBtn = document.getElementById("close-discuss-btn");
        
        newCloseBtn.addEventListener("click", () => {
            discussPanel.classList.remove("open");
            const newToggleBtn = document.getElementById("mobile-discuss-toggle");
            if(newToggleBtn) newToggleBtn.innerHTML = "💬 Discussion";
        });
    }
    document.querySelectorAll(".topic-input").forEach(el => el.addEventListener("change", e => {
        updateTopicTitle(Number(e.target.dataset.topicIndex), e.target.value);
        queueSaveData();
    }));

    document.querySelectorAll(".week-tab").forEach(el => el.addEventListener("click", e => {
        setCurrentWeek(e.currentTarget.dataset.week);
        updateActivePresence();
        render();
        broadcastPresence();
    }));

    document.querySelectorAll(".subtopic-input").forEach(el => el.addEventListener("change", e => {
        updateSubTopic(Number(e.target.dataset.topicIndex), Number(e.target.dataset.subtopicIndex), e.target.value);
        queueSaveData();
    }));

    document.querySelectorAll(".toggle-doubt-btn").forEach(el => el.addEventListener("click", e => {
        toggleDoubt(Number(e.currentTarget.dataset.topicIndex), Number(e.currentTarget.dataset.subtopicIndex));
        render();
        saveLocalOnly();
    }));

    document.querySelectorAll(".delete-subtopic-btn").forEach(el => el.addEventListener("click", e => {
        if (confirm("Delete this subtopic?")) {
            deleteSubTopic(Number(e.currentTarget.dataset.topicIndex), Number(e.currentTarget.dataset.subtopicIndex));
            render();
            queueSaveData();
        }
    })); 

    document.querySelectorAll(".add-sub-btn").forEach(el => el.addEventListener("click", e => {
        addSubtopic(Number(e.currentTarget.dataset.topicIndex));
        render();
        queueSaveData();
    }));

    document.querySelectorAll(".delete-topic-btn").forEach(el => el.addEventListener("click", e => {
        if(confirm("Delete this entire topic?")) {
            deleteTopic(Number(e.currentTarget.dataset.topicIndex)); 
            render();
            queueSaveData();
        }
    }));
}