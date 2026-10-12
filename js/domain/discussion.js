import { getState, getCurrentWeek, getCurrentUser } from "../state/appState.js";

export function addMessage(text) {
    const state = getState();
    const week = getCurrentWeek();
    
    if (!state._discussions) state._discussions = {};
    if (!state._discussions[week]) state._discussions[week] = [];

    state._discussions[week].push({
        user: getCurrentUser(),
        text: text,
        timestamp: Date.now()
    });
}