# Pullazhiyil Legacy — Shared Memory Bridge

Before beginning any meaningful work on this project, read the canonical project memory in the shared Obsidian vault.

## Shared Memory Vault Location
- Vault Directory: `C:\AI-Memory\AI Shared Memory\`
- *Note:* Due to environment file-system tool restrictions, you may need to read these files using the terminal (`run_command` with PowerShell `Get-Content`) rather than standard `view_file` if permission errors occur.

## Canonical Memory Files to Read
Before starting tasks, check these files:
- **User/General Preferences & Context:** `C:\AI-Memory\AI Shared Memory\MEMORY.md`
- **Memory Protocols:** `C:\AI-Memory\AI Shared Memory\AGENT_MEMORY_RULES.md`
- **Project Specific Context:** `C:\AI-Memory\AI Shared Memory\PROJECTS\pulazhiyil-legacy.md`

## Shared Memory Protocol
1. **Explore Decisions & Daily Notes:**
   - Refer to the `DECISIONS/` directory for architectural, product, or design records.
   - Refer to the `DAILY/` directory for recent daily notes if helpful to pick up where other agents left off.
2. **Authoritativeness:**
   - Treat the current project source code, configurations, and repository state as more authoritative than outdated notes in the shared memory vault.
3. **Updating Shared Memory:**
   - When you discover durable information that would be useful to future sessions or other AI agents, update the appropriate shared-memory files (e.g., updating the project note in `PROJECTS/` or creating a decision record under `DECISIONS/`).
   - Keep shared memory updates concise, structured, and avoid duplicating trivial or temporary logs.
4. **Security & Boundaries:**
   - **Never** store passwords, API keys, access tokens, credentials, or other secrets in the shared memory vault.
   - Do **not** copy the shared memory files into this git repository. The Obsidian vault must remain the single canonical shared-memory location.
   - Do **not** move the project or the shared memory vault.
