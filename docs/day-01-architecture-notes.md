# UCA Backlog — Day 1 Architecture & Git Foundations

**Date:** September 28, 2026  
**Phase:** V1 → V2 Refactor  
**Day:** 1 — Architecture Audit

---

## 1. Today's Goal

Understand the existing UCA Backlog architecture before refactoring it.

The V2 objective is not to rewrite the application from scratch. It is to preserve the existing behavior while separating responsibilities so the application becomes easier to understand, debug, and extend.

### Daily workflow

1. **STUDY FIRST** — understand today's concepts.
2. **BUILD** — implement today's change yourself.
3. **CHECKPOINT** — test it and explain it.
4. **WRITE DOWN WHAT YOU LEARNED** — record concepts, mistakes, and decisions.

---

# 2. Core Mental Model

The target application flow is:

```text
USER
  ↓
DOM EVENT
  ↓
EVENT HANDLER
  ↓
DOMAIN LOGIC
  ↓
APPLICATION STATE
  ↓
 ┌───────────────┐
 ↓               ↓
RENDER         PERSIST
 ↓               ↓
DOM           SERVICE
                 ↓
             REMOTE API
```

For personal notes:

```text
USER
  ↓
NOTES UI
  ↓
NOTES LOGIC
  ↓
NOTES SERVICE
  ↓
INDEXEDDB
```

The purpose of the V2 architecture is to keep these responsibilities separated.

---

# 3. What Is Application State?

Application state is the in-memory representation of the application's current data.

In UCA Backlog, this includes things such as:

- weeks
- topics
- subtopics
- doubts
- current user
- active users
- discussions
- synchronization information

State represents what the application currently knows.

Conceptually:

```js
const state = {
    weeks: [],
    user: null,
    currentWeek: null
};
```

The exact structure will be adapted to the existing application's data model.

---

# 4. State vs UI Selection

An important distinction is between application data and UI selection.

### Application data

```text
weeks
topics
subtopics
doubts
users
discussions
```

### UI selection

```text
currentWeek
```

`currentWeek` tells the application which week the user is currently viewing. It is not the entire syllabus or application data.

---

# 5. What Is Rendering?

Rendering means taking the current application state and updating the DOM so the user sees that state.

```text
STATE
  ↓
RENDER
  ↓
DOM
```

For example:

```text
State contains:

Week 1
  ├── HTML
  ├── CSS
  └── JavaScript

        ↓

render()

        ↓

Browser displays:

Week 1
HTML
CSS
JavaScript
```

Rendering should not be responsible for changing the underlying business data.

---

# 6. What Is Domain Logic?

Domain logic is the logic describing what the application does with its data.

Examples in UCA Backlog:

```text
addWeek()
deleteWeek()

addTopic()
updateTopic()
deleteTopic()

addSubtopic()
updateSubtopic()
deleteSubtopic()

toggleDoubt()
```

A domain function should:

- receive data/state
- validate business rules
- modify application state
- return useful results

A domain function should not:

- manipulate the DOM
- call `fetch()`
- know about HTML elements
- render the UI

Conceptually:

```text
Input
  ↓
Validation
  ↓
Business Logic
  ↓
State Mutation
  ↓
Result
```

---

# 7. What Is a Service?

A service handles communication with something outside the application's core logic.

```text
APPLICATION
     ↓
SERVICE
     ↓
EXTERNAL SYSTEM
```

A service can handle:

- network requests
- API responses
- network errors
- IndexedDB operations
- presence communication

The rest of the application should not need to know all the implementation details of the external system.

---

# 8. Current UCA Architecture

The current application is largely organized inside `app.js`.

Conceptually:

```text
app.js
│
├── Configuration
├── Global State
├── DOM References
├── Default Syllabus
├── Presence
├── Fetch
├── Save
├── User Identity
├── Week CRUD
├── Topic CRUD
├── Subtopic CRUD
├── Doubts
├── Rendering
├── Event Handlers
├── Polling
└── Initialization
```

The application works, but many responsibilities are mixed together in one file.

The main reason for the V2 refactor is to separate those responsibilities.

---

# 9. Current Function → Future Location

| Current Responsibility | Future Location |
|---|---|
| Application state | `state/appState.js` |
| DOM references | UI / event layer |
| `DEFAULT_SYLLABUS` | state defaults / domain |
| `updateActivePresence()` | `services/presenceService.js` |
| `getActiveUsers()` | `services/presenceService.js` |
| `renderActiveUsersHeader()` | `ui/` |
| `fetchCloudData()` | service + synchronization |
| `queueSaveCloudData()` | service + synchronization |
| User identity handler | event handling + state |
| Add week | `domain/weeks.js` |
| Delete week | `domain/weeks.js` |
| `renderTabs()` | `ui/weeksView.js` |
| `renderTopics()` | `ui/topicsView.js` |
| Summary dashboard | `ui/summaryView.js` |
| Topic mutations | `domain/topics.js` |
| Subtopic mutations | `domain/subtopics.js` |
| Doubt mutations | `domain/doubts.js` |
| `render()` | `ui/render.js` |
| Polling | synchronization layer |
| Initial load | `main.js` |

This is the target map for the refactor.

---

# 10. Target V2 Architecture

```text
uca-backlog/
│
├── index.html
├── notes.html
├── README.md
├── LICENSE
├── .gitignore
│
├── css/
│   ├── style.css
│   └── responsive.css
│
├── assets/
│
└── js/
    │
    ├── main.js
    │
    ├── state/
    │   └── appState.js
    │
    ├── domain/
    │   ├── weeks.js
    │   ├── topics.js
    │   ├── subtopics.js
    │   ├── doubts.js
    │   └── discussions.js
    │
    ├── ui/
    │   ├── render.js
    │   ├── weeksView.js
    │   ├── topicsView.js
    │   ├── summaryView.js
    │   ├── notesView.js
    │   └── discussionView.js
    │
    ├── services/
    │   ├── sharedDataService.js
    │   ├── presenceService.js
    │   └── notesService.js
    │
    └── utils/
        ├── validation.js
        └── helpers.js
```

---

# 11. Layer Responsibilities

## `main.js`

The application entry point and orchestrator.

Responsibilities:

- initialize the application
- load initial data
- bind events
- coordinate rendering
- start synchronization

It should coordinate the application rather than contain all business logic.

---

## `state/`

Owns application state.

```text
state
  ↓
current application data
```

---

## `domain/`

Owns business/application logic.

```text
domain
  ↓
what the application does
```

Domain code should not manipulate the DOM or communicate directly with the remote API.

---

## `ui/`

Owns rendering.

```text
state
  ↓
UI
  ↓
DOM
```

UI code should not own business rules or direct API communication.

---

## `services/`

Owns external communication.

```text
services
   ├── Remote API
   ├── Presence
   └── IndexedDB
```

---

## `utils/`

Contains small reusable helpers such as:

- validation
- formatting
- generic helper functions

Utilities should not become a dumping ground for application-specific business logic.

---

# 12. Why `fetchCloudData()` Needs Refactoring

The current fetch flow combines several responsibilities:

```text
fetchCloudData()
      ↓
make network request
      ↓
receive response
      ↓
parse JSON
      ↓
update state
      ↓
render UI
```

These represent multiple concerns:

```text
NETWORK
STATE
UI
```

The V2 direction is:

```text
SharedDataService
      ↓
fetch data
      ↓
state
      ↓
render
```

The service should not decide how the UI looks.

---

# 13. Why `queueSaveCloudData()` Needs Refactoring

Saving currently combines responsibilities such as:

- debouncing
- synchronization
- state preparation
- network communication
- status handling

The V2 direction is:

```text
USER CHANGE
    ↓
STATE UPDATED
    ↓
SAVE REQUEST
    ↓
SHARED DATA SERVICE
    ↓
REMOTE API
```

Changing application state and communicating with the server are separate responsibilities.

---

# 14. The Add Topic Flow

The target V2 flow for adding a topic is:

```text
USER CLICKS "ADD TOPIC"
          ↓
DOM EVENT
          ↓
handleAddTopic()
          ↓
Read input
          ↓
Validate
          ↓
addTopic()
          ↓
APPLICATION STATE
          ↓
render()
          ↓
DOM UPDATED

and

APPLICATION STATE
          ↓
saveSharedData()
          ↓
REMOTE API
```

Each layer has a specific responsibility.

### Event handler

Knows:

> What did the user do and what input did they provide?

### Domain

Knows:

> How does adding a topic change the application?

### UI

Knows:

> How should the new state appear?

### Service

Knows:

> How do we communicate with the external system?

---

# 15. Shared Data vs Personal Data

The project has two categories of persistence.

## Shared data

All users should see the same shared information:

- weeks
- topics
- subtopics
- doubts
- discussions
- messages
- active users

This uses the remote shared-data service.

## Personal data

Personal notes belong to an individual user:

- My Notes

These will use IndexedDB.

Therefore:

```text
             UCA BACKLOG
                  │
          ┌───────┴───────┐
          │               │
       SHARED           PERSONAL
          │               │
      Remote API       IndexedDB
```

---

# 16. Git Strategy

`main` represents the stable/deployed application.

The current V1 application is preserved with:

```bash
git tag v1.0-working
```

The current refactor branch is:

```text
refactor/architecture-audit
```

The workflow is:

```text
main
 ↓
feature/refactor branch
 ↓
work
 ↓
commit
 ↓
push
 ↓
Pull Request
 ↓
review
 ↓
merge
 ↓
main
```

The purpose is to keep the deployed application safe while learning and refactoring.

---

# 17. Day 1 Git Work

Completed:

- [x] `git checkout main`
- [x] `git pull`
- [x] created `v1.0-working` tag
- [x] pushed `v1.0-working`
- [x] created `refactor/architecture-audit`

Commands:

```bash
git checkout main
git pull
git tag v1.0-working
git push origin v1.0-working
git checkout -b refactor/architecture-audit
```

---

# 18. Security Observation

The previous implementation contains an API credential directly in browser-side JavaScript.

A private/master API credential should not be exposed to browser users.

Therefore:

> Do not copy the existing exposed master credential into the new architecture.

The service-layer refactor should move toward a safer deployment architecture where private credentials are not exposed to the client.

---

# 19. Architecture Rules

## Rule 1 — Domain ≠ DOM

Domain code should not manipulate HTML.

```text
domain ❌ document.querySelector()
domain ❌ element.innerHTML
```

## Rule 2 — UI ≠ API

UI code should not directly own network communication.

```text
ui ❌ fetch()
```

## Rule 3 — Service ≠ UI

Services should not render HTML.

```text
service ❌ render()
service ❌ element.innerHTML
```

## Rule 4 — State has a clear owner

Avoid scattered application state.

## Rule 5 — `main.js` coordinates

`main.js` should connect the layers rather than becoming another giant file.

## Rule 6 — Refactoring preserves behavior

The first objective is to change the structure without breaking what the application already does.

---

# 20. Day 1 Checkpoint

Before moving to Day 2, I should be able to explain without looking at the code:

- [ ] What application state is
- [ ] What `currentWeek` represents
- [ ] What `render()` does
- [ ] What `fetchCloudData()` does
- [ ] Why `fetchCloudData()` has multiple responsibilities
- [ ] What domain logic means
- [ ] Why domain logic should not touch the DOM
- [ ] What a service is
- [ ] Difference between UI, domain, state, and service
- [ ] What happens when I click "Add Topic"
- [ ] Why shared data and personal notes are stored differently
- [ ] Why V2 is being built incrementally instead of rewritten all at once

---

# 21. What I Learned Today

### Architecture

Software architecture is about deciding which responsibility belongs where.

### State

State represents the application's current data. It is different from the DOM.

### Rendering

Rendering takes state and turns it into something the user can see.

```text
State → Render → DOM
```

### Domain Logic

Domain logic represents what the application does with its data.

It should not depend on the browser DOM or network.

### Services

Services handle communication with external systems such as remote APIs and IndexedDB.

### Separation of Responsibilities

A function can work correctly while still having too many responsibilities.

The V2 refactor is about separating those responsibilities.

---

# 22. Questions I Should Be Able to Answer

- [ ] What is application state?
- [ ] What is `currentWeek`?
- [ ] What does `render()` do?
- [ ] What does `fetchCloudData()` do?
- [ ] Why does `fetchCloudData()` need refactoring?
- [ ] What is domain logic?
- [ ] Why should domain logic not touch the DOM?
- [ ] What is a service?
- [ ] What is the difference between UI and domain logic?
- [ ] What happens when I click "Add Topic"?
- [ ] Why are shared data and personal notes stored differently?
- [ ] Why am I refactoring incrementally?

---

# 23. Day 1 Definition of Done

- [ ] I studied the architecture concepts.
- [ ] I understand the current UCA architecture.
- [ ] I understand the target V2 architecture.
- [ ] I can explain state vs UI.
- [ ] I can explain domain vs service.
- [ ] I can trace the Add Topic flow.
- [ ] I created the `v1.0-working` safety tag.
- [ ] I created the architecture-audit branch.
- [ ] I reviewed these notes.
- [ ] I can explain the architecture without reading the notes.
- [ ] I committed today's work.

---

# 24. Tomorrow — Day 2

## State + ES Modules

Study:

```text
ES Modules
    ↓
import / export
    ↓
module scope
    ↓
state ownership
    ↓
application state
```

Then extract:

```text
js/state/appState.js
```

The application should continue behaving the same after the change.

---

# Final Principle

The goal is not to create the most sophisticated architecture.

The goal is to build an application that I can:

1. understand
2. explain
3. modify
4. debug
5. extend

The project should not only be a working UCA Backlog.

It should demonstrate that I understand why the code is structured the way it is.
