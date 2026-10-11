import { getState, getCurrentWeek, getCurrentUser } from "../state/appState.js";

export function addMessage(text) {
    const state = getState();
    const week = getCurrentWeek();
    
    // Initialize the discussion object if it doesn't exist
    if (!state._discussions) state._discussions = {};
    if (!state._discussions[week]) state._discussions[week] = [];

    // Append the new message
    state._discussions[week].push({
        user: getCurrentUser(),
        text: text,
        timestamp: Date.now()
    });
}