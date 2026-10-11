# UCA Backlog

**A collaborative syllabus and backlog management tool for students.**

[**Live Demo**](https://backlog-uca.vercel.app/) · [Report a Bug](https://github.com/bhuvitw/backlog-uca/issues) · [Source Code](https://github.com/bhuvitw/backlog-uca)

## Overview

UCA Backlog is a web application designed to help students organize their academic syllabus, track topics and subtopics, record doubts, and maintain personal study notes in one place.

The project started as a practical solution to a common student problem: finding and organizing syllabus information while preparing for classes, assessments, and viva examinations. It provides a shared space for syllabus organization alongside a separate area for personal notes.

## Features

### 1. Syllabus Management
- Organize academic content week by week.
- Create, edit, and delete main topics.
- Break topics into subtopics.
- Maintain doubts associated with study topics.
- Access the shared syllabus data through cloud storage.

### 2. Personal Study Notes
- Create notes with a title and content.
- View saved notes.
- Edit existing notes.
- Delete notes when they are no longer needed.
- Store personal notes in the browser using `localStorage`.

### 3. User Interface
- Separate pages for syllabus management and personal notes.
- Responsive layout for desktop, tablet, and mobile screens.
- Shared styling across pages for a consistent interface.
- JavaScript modules organized by responsibility.

### 4. Data Management
- Uses browser storage for personal notes.
- Uses the JSONBin API for shared syllabus data.
- Includes a save service that groups rapid save requests using a debounce.
- Refreshes shared data periodically to help users see updates.

> **Storage note:** Personal notes are stored locally in the browser. Shared syllabus data uses a cloud API. These are separate storage mechanisms.

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and forms |
| CSS3 | Styling and responsive layouts |
| Vanilla JavaScript (ES Modules) | Application logic, events, and rendering |
| `localStorage` | Persistent personal notes |
| JSONBin API | Shared syllabus data storage |
| Vercel | Deployment |

The application is built without frontend frameworks or external JavaScript libraries.

## Project Structure

```text
backlog-uca/
├── index.html
├── notes.html
├── style.css
├── js/
│   ├── domain/
│   │   ├── doubt.js
│   │   ├── presence.js
│   │   ├── subTopics.js
│   │   └── topics.js
│   ├── events/
│   │   └── events.js
│   ├── services/
│   │   └── sharedDataService.js
│   ├── state/
│   │   └── appState.js
│   ├── ui/
│   │   ├── activeUserView.js
│   │   ├── render.js
│   │   ├── summaryView.js
│   │   ├── topicsView.js
│   │   └── weekView.js
│   ├── utils/
│   │   └── constant.js
│   └── main.js
├── docs/
│   └── day-01-architecture-notes.md
├── .gitignore
├── LICENSE
└── README.md
```

*The tree above describes the main application files; additional files may exist in the repository.*

## Architecture and Design

The JavaScript code is divided into modules to keep responsibilities separate:

- **Domain:** Operations involving topics, subtopics, doubts, and user presence.
- **Events:** Connects user interactions to application actions.
- **State:** Maintains the application's current data and selection state.
- **Services:** Handles communication with the cloud data API.
- **UI:** Renders topics, weekly views, summaries, and active-user information.
- **Utilities:** Holds shared constants.

This modular structure makes the code easier to understand, debug, and extend than keeping the entire application in a single JavaScript file.

## Getting Started

### Prerequisites

- A modern web browser.
- Git.
- A local static HTTP server, such as the VS Code Live Server extension or Python's built-in HTTP server.
- Valid cloud API configuration if you want to use shared syllabus synchronization.

### Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/bhuvitw/backlog-uca.git
   ```

2. Open the project directory:

   ```bash
   cd backlog-uca
   ```

3. Start a local HTTP server. For example, with Python:

   ```bash
   python3 -m http.server 8000
   ```

4. Open the application:

   - Syllabus: [http://localhost:8000/](http://localhost:8000/)
   - Personal Notes: [http://localhost:8000/notes.html](http://localhost:8000/notes.html)

Run the project through an HTTP server rather than opening the HTML files directly, because the application uses JavaScript ES modules.

## Data Storage

### Shared Syllabus

The shared syllabus is fetched from and saved to JSONBin through `js/services/sharedDataService.js`. The service handles API requests and debounces save operations to reduce unnecessary requests.

### Personal Notes

Personal notes are stored in the browser's `localStorage` under the key `uca_personal_notes`.

Because notes are browser-local, they are not automatically shared across users or synchronized between different browsers and devices. Clearing browser storage can remove locally saved notes.

## Security Considerations

- Do not commit API master keys, passwords, or other secrets to the repository.
- A privileged API key embedded in browser-side JavaScript is visible to anyone using the application.
- For production use, privileged API requests should be handled through a secure server-side component or replaced with an appropriately restricted client-safe configuration.

## Project Goals

- Make syllabus information easier to organize and access.
- Help students break large topics into manageable subtopics.
- Keep doubts and personal revision notes organized.
- Practice core web development concepts using HTML, CSS, and JavaScript.
- Apply modular code organization, browser storage, CRUD operations, API integration, and responsive design.

## Future Improvements

- Add search and filtering for topics and notes.
- Improve error and synchronization status feedback.
- Add export and backup options for personal notes.
- Introduce secure authentication and access controls if the application grows.
- Improve accessibility and add more comprehensive testing.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

**Built by [Bhuvnesh](https://github.com/bhuvitw)**