
  document.querySelectorAll(".topic-input").forEach(input => {
      input.addEventListener("input", (event) => {
        const topicIndex = Number(event.currentTarget.dataset.topicIndex);
        const newTitle = event.currentTarget.value;

        updateTopicTitle(topicIndex, newTitle);
        queueSaveCloudData(); 
      })
    });

  document.querySelectorAll(".delete-topic-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      const topicIndex = Number(event.currentTarget.dataset.topicIndex); 
      
      const topicName = getState()[getCurrentWeek()][topicIndex].title || "this topic";

      if(confirm(`Are you sure you want to delete "${topicName}" and all the subtopics?`)) {
        deleteTopic(topicIndex); 
        renderTopics(); 
        queueSaveCloudData();
      }
    })
  });

  document.querySelectorAll(".add-sub-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      const topicIndex = Number(event.currentTarget.dataset.topicIndex);

      addSubtopic(topicIndex);
      renderTopics();
      queueSaveCloudData();
    })
  });

  document.querySelectorAll(".delete-subtopic-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      const topicIndex = Number(event.currentTarget.dataset.topicIndex); 
      const subtopicIndex = Number(event.currentTarget.dataset.subtopicIndex); 
      const subtopicText = getState()[getCurrentWeek()][topicIndex].subtopics[subtopicIndex].text || "this subtopic";

      if (confirm(`Are you sure you want to delete "${subtopicText}"?`)) {
        deleteSubTopic(topicIndex, subtopicIndex); 
        renderTopics();
        queueSaveCloudData();
      }
      
    })
  });

  document.querySelectorAll(".toggle-doubt-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      const topicIndex = Number(event.currentTarget.dataset.topicIndex); 
      const subtopicIndex = Number(event.currentTarget.dataset.subtopicIndex); 

      toggleDoubt(topicIndex, subtopicIndex); 
      renderTopics();
      queueSaveCloudData();

    })
  })

  document.querySelectorAll(".subtopic-input").forEach(input => {
    input.addEventListener("input", (event) => {
      const topicIndex = Number(event.currentTarget.dataset.topicIndex); 
      const subTopicIndex = Number(event.currentTarget.dataset.subtopicIndex); 
      const newSubTopicValue = event.currentTarget.value;

      updateSubTopic(topicIndex, subTopicIndex, newSubTopicValue);
      queueSaveCloudData(); 
    })
  });