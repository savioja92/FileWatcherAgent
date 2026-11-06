# AI Background Worker

A multimodal, event-driven background service built with Node.js and the Google Gemini API. Instead of a traditional chat interface, this agent operates headlessly by watching a local directory, processing dropped files (like text and PDFs), and outputting strictly formatted JSON summaries.

## Architecture & Features

* **Event-Driven File Watcher:** Uses `fs.watch` to actively monitor an `/input` directory for file rename/add events.
* **Multimodal Processing:** Natively handles PDFs by converting buffers to Base64 strings and passing them to Gemini 2.5 Flash via the `inlineData` payload.
* **Dynamic File Router:** Utilizes `path.extname` to branch logic based on file type while ignoring unsupported files (e.g., `.DS_Store`).
* **Strict JSON Enforcement:** Cleans LLM responses by stripping Markdown formatting to ensure outputs are strictly parsable JSON.
* **Cross-Filesystem Synchronization:** Implements a write-delay buffer to handle race conditions between macOS host file copying and Docker bind mount reads.

## Tech Stack

* **Environment:** Node.js, TypeScript, Docker (Dev Container / Debian 12 via OrbStack)
* **AI Provider:** Google Gemini 2.5 Flash API
* **Version Control:** Git (handling remote bridging and local history manipulation)

## Current State & Roadmap

* **Phase 1 (Current):** Fully functional in development mode (`npm run start`). Successfully watches inputs, routes files, queries Gemini, and outputs clean `.json` files.
* **Phase 2 (Planned):** Transition to a headless, production-ready background service orchestrated purely by `docker-compose.yml`.

## Local Setup

1. Clone the repository and open it in a VS Code Dev Container.
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the root directory and add your Gemini API key:
   `GEMINI_API_KEY=your_api_key_here`
4. Run `npm run start` to start the watcher.
5. Drop a `.txt` or `.pdf` file into the `input/` folder and check the `output/` folder for the generated JSON.
