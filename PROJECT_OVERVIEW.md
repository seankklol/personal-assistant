# Transparent AI Assistant – Formal Specification

Below is a concise, formal spec for a TypeScript-based monorepo that implements a transparent AI assistant. The app organizes user data into temporary, global, and project-specific memory and allows the user to view or modify how the AI leverages these memories.

## 1. Monorepo Overview

- **Language:** TypeScript (throughout both frontend and backend)
- **Package Manager & Scripts:** Bun
- **Use** `bun install` for dependencies
- **Use** `bunx <command>` instead of `npx <command>`

### Monorepo Structure

```
my-ai-assistant/
├─ tsconfig.json
├─ package.json
├─ bun.lockb
├─ backend/         <-- Express-based server with tRPC integration
│  ├─ src/
│  │  ├─ index.ts
│  │  ├─ trpc.ts    <-- tRPC setup to connect backend and frontend
│  │  └─ procedures.ts  <-- tRPC procedures (queries & mutations)
│  └─ package.json
└─ frontend/        <-- React + Vite application
   ├─ vite.config.ts
   └─ package.json
```

## 2. Tech Stack

| Layer          | Tool                                      | Purpose                                                                                          |
|----------------|-------------------------------------------|--------------------------------------------------------------------------------------------------|
| Backend        | Express.js (TypeScript) with tRPC        | tRPC provides strongly typed, seamless communication between the backend and the frontend        |
| Frontend       | Vite + React (TypeScript)                | Lightweight, modern SPA                                                                          |
| Routing        | React Router v7                           | Client-side navigation in the frontend                                                           |
| AI Embeddings  | Nebius AI                                | Generate vector embeddings for stored data                                                       |
| Vector Database| Cloud Firestore                          | Stores embeddings & memory items (vector search)                                                |
| Chat Messages   | Cloud Firestore                          | Stores individual chat messages as separate documents for improved reliability                   |

## 3. Core Functionalities

1. **Memory Management**
   - **Temporary Memory:** Session-based data stored in local state (purged when the session ends).
   - **Global Memory:** Long-term data applicable across all chats and projects.
   - **Project Memory:** Memory scoped to specific projects, enabling context-sensitive conversations.

2. **AI Interaction**
   - The backend calls Nebius AI to generate vector embeddings for each piece of data (memories and chat messages).
   - Firestore stores these embeddings, allowing vector-based retrieval of relevant data.
   - On user queries, the backend (via tRPC procedures) fetches the relevant data from Firestore and compiles context for the AI to generate a response.

3. **Chat System**
   - Users communicate with the AI in chat sessions.
   - **Past Conversations:** Instead of storing entire conversations as a single document, each chat message is now stored as an individual document in a dedicated collection (e.g., `chatMessages`), ensuring that document size limits are not exceeded.
   - The UI displays these messages along with an expandable “How I Got Here” section that shows what data the AI retrieved.

4. **Memory Visibility & Control**
   - **Memory Timeline UI (frontend):** Displays a chronological list of stored memories (temporary, global, or project).
   - Users can accept or reject newly proposed memories (auto-accepted unless rejected).
   - A toggle allows the user to include or exclude Global Memory when working in a specific project’s chat.

## 4. Low-Level Overview

1. **Backend (./backend)**
   - **tRPC Procedures:**
     Instead of traditional REST endpoints, tRPC is used to define strongly typed procedures that connect the backend and frontend.
   - **Example procedures include:**
     - `chat.sendMessage` – Sends a user message and retrieves context-enhanced AI responses.
     - `memories.get` – Retrieves stored memories filtered by project, global, or all.
     - `memories.add` – Stores a new memory (with embeddings generated via Nebius AI).
     - `memories.update` – Updates or rejects a memory.
   - **Data Flow:**
     1. User message is received and processed by a tRPC procedure.
     2. Relevant Firestore memories are extracted using vector search (implemented in backend code).
     3. User message and memory context are sent to Nebius AI for response generation.
     4. The AI response is returned to the frontend and logged in Firestore as an individual chat message.

2. **Frontend (./frontend)**
   - Developed with React + Vite for fast development.
   - Uses React Router v7 for page-based navigation:
     - `/` – Main dashboard / home.
     - `/chat/:projectId?` – Project-specific or general chat interface.
     - `/memories` – Memory Timeline UI for managing stored items.
   - **State Management:**
     - Current chat session data (temporary memory) is stored in local state.
     - Global and project-specific memories are fetched from Firestore.

3. **Data Storage in Firestore**
   - **Collections:**
     - `memories`
       - `type:` temporary, global, or project
       - `projectId:` string or null
       - `content:` string
       - `embedding:` vector (from Nebius AI)
       - `createdAt:` timestamp
     - `chatMessages`
       - Each chat message is stored as an individual document.
       - **Fields include:**
         - `projectId:` string or null
         - `text:` string
         - `sender:` identifier (user or AI)
         - `timestamp:` timestamp
         - `embedding:` vector (optional, for similarity search)
       - This approach avoids aggregating messages into one large document.

4. **Embedding & Vector Search**
   - When new content (memory or chat message) is created, the backend calls Nebius AI for an embedding.
   - The vector is saved to Firestore (likely as an array of floats).
   - For retrieval, a vector search is performed by computing similarity scores in the backend code.

## 5. Operational Considerations

1. **Testing:**
   - Implement unit and integration tests for both backend (tRPC procedures) and frontend components.
   - Use tools like Jest (or similar) to automate test runs.

2. **Logging:**
   - Integrate a robust logging mechanism on the backend (e.g., using Winston or another logging library) to track errors, API calls, and key system events.
   - Ensure logs are structured for easy analysis.

3. **Caching:**
   - Implement caching for frequently accessed data (e.g., common memory queries) to reduce Firestore load and improve response times.
   - Consider using in-memory caching solutions (e.g., Redis or even simple in-process caching) where appropriate.

4. **Handling Third-Party API Failures:**
   - Include error handling and retry mechanisms when calling Nebius AI to generate embeddings or process messages.
   - Ensure that API failures are logged and that fallback behaviors are in place (e.g., graceful degradation of features).

## 6. Summary

- **Architecture:**
  A TypeScript monorepo that now leverages tRPC (instead of traditional REST endpoints) for strongly typed, seamless communication between the Express backend and the React + Vite frontend.

- **Chat Storage:**
  Chat messages are stored individually in Firestore as separate documents in a dedicated collection (`chatMessages`), avoiding issues with document size limits.

- **Operational Aspects:**
  The specification now includes plans for testing, logging, caching, and robust handling of third-party API failures.

- **Key Concept:**
  A fully transparent AI assistant where users can see exactly how the AI leverages memory, now with an improved backend-frontend connection and better chat message storage.