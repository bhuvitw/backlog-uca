import { getCurrentUser } from "../state/appState.js";
import { getCurrentWeek } from "../state/appState.js";
import { setState } from "../state/appState.js";
import { getState } from "../state/appState.js";

function getActiveUsers() {
    if(!getState()._activeUsers) return []; 

    const now = Date.now(); 

    return Object.entries(getState()._activeUsers)
        .filter(([_,data ]) => {
            const lastSeen = typeof data === "number"
                ? data
                : data.lastSeen

            return now - lastSeen < 30000;
        })
        .map(([name, data]) =>({
            name, 
            week: typeof data === "object" && data.week
                ? data.week
                : "Week 1"
        }));
};

function updateActivePresence() {
    const  state = getState();

    if (!state._activeUsers) state._activeUsers = {};

    state._activeUsers[getCurrentUser()] = {
        lastSeen: Date.now(),
        week: getCurrentWeek()
    };

    setState(state)
}

export { getActiveUsers,updateActivePresence };