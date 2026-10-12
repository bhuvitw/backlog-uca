import { getState } from "../state/appState.js";

const JSONBIN_BIN_ID = "6ac82a38ac6210605a210c06";
const JSONBIN_API_KEY = "\$2a\$10\$MtvaDn4Utk.fuBQ08te0y.o4CAvIZpaFb5amKJFIB3hLC6uxJytHq";
const API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

let saveDebounceTimer = null;
let isCloudDataLoaded = false;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SyllabusDB', 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('syllabus')) {
                db.createObjectStore('syllabus');
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveLocalFallback(data) {
    try {
        const db = await initDB();
        const tx = db.transaction('syllabus', 'readwrite');
        tx.objectStore('syllabus').put(data, 'shared_state');
    } catch (err) {
        console.warn("IndexedDB Save Error:", err);
    }
}

function getLocalFallback() {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await initDB();
            const tx = db.transaction('syllabus', 'readonly');
            const request = tx.objectStore('syllabus').get('shared_state');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (err) {
            reject(err);
        }
    });
}
async function fetchCloudData() {
    try {
        if (localStorage.getItem('pending_sync') === 'true') {
            console.log("Unsynced offline changes detected. Loading local data...");
            const localData = await getLocalFallback();
            if (localData) {
                isCloudDataLoaded = true;
                queueSaveData(); 
                return localData;
            }
        }

        const response = await fetch(`${API_URL}/latest`, {
            headers: { "X-Master-Key": JSONBIN_API_KEY }
        });

        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

        const data = await response.json(); 
        isCloudDataLoaded = true; 
        
        await saveLocalFallback(data.record);
        return data.record;

    } catch (error) {
        console.warn("Cloud fetch failed, attempting to load from IndexedDB...", error);
        
        const localData = await getLocalFallback();
        if (localData) {
            isCloudDataLoaded = true;
            return localData;
        }
        throw error;
    }
}

async function queueSaveData() {
    if (!isCloudDataLoaded) return;
    
    await saveLocalFallback(getState());
    localStorage.setItem('pending_sync', 'true');

    clearTimeout(saveDebounceTimer);

    saveDebounceTimer = setTimeout(async () => {
        try { 
            if (!navigator.onLine) {
                console.log("You are offline. Data saved locally to IndexedDB.");
                return;
            }

            const response = await fetch(API_URL, {
                method: "PUT", 
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": JSONBIN_API_KEY
                },
                body: JSON.stringify(getState())
            });

            if (!response.ok) throw new Error(`Save failed: ${response.status}`);
            
            localStorage.removeItem('pending_sync');
            console.log("Data synced to cloud successfully");
            
        } catch (error) {
            console.error("Cloud save failed, but data is safe in IndexedDB.", error); 
        }
    }, 500); 
}


async function saveLocalOnly() {
    if (!isCloudDataLoaded) return;
    
    await saveLocalFallback(getState());
    
    localStorage.setItem('pending_sync', 'true');
    
    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) {
        syncBtn.textContent = "🟡 Pending (Click to Sync)";
    }
    console.log("Minor change (Doubt) saved to IndexedDB only.");
}

export { fetchCloudData, queueSaveData, saveLocalOnly };

