import { getState } from "../state/appState.js";

// CONFIGURATION: JsonBin credentials
const JSONBIN_BIN_ID = "6ac82a38ac6210605a210c06";
const JSONBIN_API_KEY = "$2a$10$MtvaDn4Utk.fuBQ08te0y.o4CAvIZpaFb5amKJFIB3hLC6uxJytHq";

const API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

let saveDebounceTimer = null;
let isCloudDataLoaded = false;

async function fetchCloudData(){
    const response = await fetch(`${API_URL}/latest`, {
        headers: {
            "X-Master-Key": JSONBIN_API_KEY
        }
    });

    if(!response.ok){
        throw new Error(`Fetch failed: ${response.status}`);
    }

    const data = await response.json(); 
    isCloudDataLoaded = true; 
    return data.record;

}

async function queueSaveData() {
    if (!isCloudDataLoaded) {
        console.warn("Save blocked: Cloud data hasn't loaded yet.");
        return;
    }
    
    clearTimeout(saveDebounceTimer);

    saveDebounceTimer = setTimeout(async() => {
        try { 
            const response = await fetch(API_URL, {
                method: "PUT", 
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": JSONBIN_API_KEY
                },
                body: JSON.stringify(getState())
            });

            if(!response.ok) {
                throw new Error(`Save failed: ${response.status}`)
            }

            console.log("Data saved successfully");
        } catch (error) {
            console.error("cloud save failed", error); 
        }
    },400)
    
}

export { fetchCloudData, queueSaveData };