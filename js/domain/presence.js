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

export { getActiveUsers };