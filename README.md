## MCP ChatBot – FastAPI backend + Vite React frontend

### Overview
This project is a simple MCP-enabled chatbot:
- **Backend**: FastAPI service in `main.py` that integrates LangChain, LangGraph, MCP tools, and Ollama for local LLM inference with SQLite-based chat memory.
- **Frontend**: Vite + React + TypeScript app in `frontend/MCPChatBot`.

### Architecture
- `main.py` exposes REST endpoints to list MCP tools, run the agent, and retrieve chat threads/messages. Memory is stored in `agent_memory.db` (SQLite).
- MCP servers are configured in `server_config.json` (default entries for Weather and Math). The backend connects to MCP servers over `streamable_http`.
- Frontend calls the backend to drive chat flows (CORS is enabled).

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Ollama installed and running (`ollama` CLI in PATH)
  - Pull a model used by the backend (default: `qwen3:1.7b`):
  ```bash
  ollama pull qwen3:1.7b
  ```
- MCP servers available at the URLs configured in `server_config.json` (or add your own via the API). The defaults assume two servers running locally:
  - Weather: `http://127.0.0.1:8001/mcp`
  - Math: `http://127.0.0.1:8002/mcp`

### Backend (FastAPI)
Location: project root `main.py`

Install dependencies (PowerShell):
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install fastapi uvicorn[standard] pydantic langchain langgraph langchain-mcp-adapters aiosqlite ollama mcp
```

Run the server:
```powershell
uvicorn main:app --reload --port 3000
```

The server runs at `http://127.0.0.1:3000`.

#### Configuration
Edit `server_config.json` to add/remove MCP servers, or use the API:
```json
{
  "Weather": { "url": "http://127.0.0.1:8001/mcp", "transport": "streamable_http" },
  "Math":    { "url": "http://127.0.0.1:8002/mcp", "transport": "streamable_http" }
}
```

#### API Endpoints (summary)
- `GET /` – Health check
- `GET /tools` – Aggregate tools from all configured MCP servers
- `POST /add_mcp` – Add/update an MCP server
  - Body:
  ```json
  { "server_name": "MyServer", "url": "http://127.0.0.1:8003/mcp" }
  ```
- `POST /remove_mcp{server_name}` – Remove an MCP server by name
- `GET /server_names` – List configured MCP server names
- `GET /model_list` – List models available in Ollama
- `GET /tools/{server_name}` – List tools for a specific MCP server
- `POST /generate` – Run the agent with memory per chat thread
  - Body:
  ```json
  {
    "user_prompt": "Your question here",
    "model_name": "qwen3:1.7b",
    "chat_name": "my-chat-thread-id"
  }
  ```
- `GET /threadid` – List existing thread IDs
- `GET /messages/{thread_id}` – Retrieve messages for a thread

Notes:
- Memory is stored in `agent_memory.db` (SQLite). Threads are keyed by `chat_name`.
- CORS is open to all origins for development.

### Frontend (Vite + React + TS)
Location: `frontend/MCPChatBot`

Install and run (PowerShell):
```powershell
cd frontend\MCPChatBot
npm install
npm run dev
```

The dev server defaults to `http://127.0.0.1:5173` (Vite). Ensure the backend is running at `http://127.0.0.1:3000` or update frontend calls accordingly.

### Troubleshooting
- Ensure Ollama is running and the model `qwen3:1.7b` (or the model you set) is pulled.
- Make sure your MCP servers are reachable at the URLs in `server_config.json`.
- If ports are busy, change the backend port in the run command and update the frontend fetch base URL(s).
- Delete `agent_memory.db` if you want a clean slate for chat memory.

### License
MIT (or your preferred license)


