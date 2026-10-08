import { getState } from "../state/appState.js";

// CONFIGURATION: JsonBin credentials
const JSONBIN_BIN_ID = "6abe8ef4ffd5d160534359db";
const JSONBIN_API_KEY = "$2a$10$MtvaDn4Utk.fuBQ08te0y.o4CAvIZpaFb5amKJFIB3hLC6uxJytHq";

const API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

async function saveData() {
    try { 
        const response = await fethc(API_URL, {
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
}

export { saveData };