// Global App State

let currentUser = localStorage.getItem('study_user') || "anonymous";
let currentWeek = "Week 1";

let state = {
  currentWeek: "Week 1",
  weeks: []
};

function getState(){
  return state
}

function setState(data){
  state = data; 
}

function getCurrentUser(){
  return currentUser;
}

function setCurrentUser(data){
  currentUser = data; 
}

function getCurrentWeek(){
  return currentWeek;
}

function setCurrentWeek(data){
  currentWeek = data; 
}

export {getState, setState, getCurrentUser, setCurrentUser, getCurrentWeek, setCurrentWeek};
