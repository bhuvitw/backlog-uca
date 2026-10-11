self.onmessage = function(event) {
    const state = event.data;
    
    let totalTopics = 0;
    let totalSubtopics = 0;
    let totalDoubts = 0;
    let maxDoubts = 0;
    let hotTopic = "None";

    // Filter out metadata like _activeUsers
    const weeks = Object.keys(state).filter(k => k !== '_activeUsers');

    weeks.forEach(week => {
        state[week].forEach(topic => {
            totalTopics++;
            let currentTopicDoubts = 0;

            topic.subtopics.forEach(sub => {
                totalSubtopics++;
                if (sub.doubts && sub.doubts.length > 0) {
                    const doubtCount = sub.doubts.length;
                    totalDoubts += doubtCount;
                    currentTopicDoubts += doubtCount;
                }
            });

            // Check if this topic has the highest doubts
            if (currentTopicDoubts > maxDoubts) {
                maxDoubts = currentTopicDoubts;
                hotTopic = topic.title;
            }
        });
    });

    // Send the processed analytics back to the main thread
    self.postMessage({
        totalTopics,
        totalSubtopics,
        totalDoubts,
        hotTopic
    });
};