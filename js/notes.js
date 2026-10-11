
const STORAGE_KEY = "uca_personal_notes";

const form = document.getElementById("note-form");
const titleInput = document.getElementById("note-title");
const contentInput = document.getElementById("note-content");
const notesList = document.getElementById("notes-list");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");

let notes = loadNotes();
let editingId = null;

function loadNotes() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch {
    alert("Could not save notes. Browser storage may be unavailable.");
    return false;
  }
}

function renderNotes() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No notes yet. Create your first revision note!";
    notesList.appendChild(empty);
    return;
  }

  notes.forEach(note => {
    const card = document.createElement("article");
    card.className = "note-card";

    const title = document.createElement("h3");
    title.textContent = note.title;

    const content = document.createElement("p");
    content.className = "note-content";
    content.textContent = note.content;

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEditing(note.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteNote(note.id));

    actions.append(editBtn, deleteBtn);
    card.append(title, content, actions);
    notesList.appendChild(card);
  });
}

function resetForm() {
  form.reset();
  editingId = null;
  saveBtn.textContent = "Add Note";
  cancelBtn.hidden = true;
}

function startEditing(id) {
  const note = notes.find(item => item.id === id);
  if (!note) return;

  editingId = id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  saveBtn.textContent = "Update Note";
  cancelBtn.hidden = false;
  titleInput.focus();
}

function deleteNote(id) {
  if (!confirm("Delete this note?")) return;

  const previousNotes = notes;
  notes = notes.filter(note => note.id !== id);

  if (!saveNotes()) {
    notes = previousNotes;
    return;
  }

  if (editingId === id) resetForm();
  renderNotes();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) return;

  const previousNotes = notes;

  if (editingId !== null) {
    notes = notes.map(note =>
      note.id === editingId ? { ...note, title, content } : note
    );
  } else {
    notes = [
      ...notes,
      { id: crypto.randomUUID(), title, content }
    ];
  }

  if (!saveNotes()) {
    notes = previousNotes;
    return;
  }

  resetForm();
  renderNotes();
});

cancelBtn.addEventListener("click", resetForm);

renderNotes();
