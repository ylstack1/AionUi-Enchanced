# ylagents-os — Development Plan v2 (Refreshed)

**Date:** 2026-06-25
**Status:** Final v2 (Refreshed)
**Based on:** Full audit of AionCore + AionUi source code and ylagents-os requirements
**Brand:** ylagents-os

---

## What This Plan Is

This is a comprehensive development plan for **ylagents-os**, a local-first mobile and desktop AI agent OS. It incorporates detailed architectural findings from the AionCore and AionUi codebases and adheres to the project's core principles of zero-backend, pure TypeScript execution, and platform parity.

---

## Core Platform Principles

### 1. Feature Parity (Mobile & Desktop)
Every feature works on **BOTH** mobile and desktop.
- **Adaptation over Omission:** If a feature is technically challenging on mobile, we find a compatible alternative or UI adaptation (e.g., bottom sheets instead of side panels, swipe actions instead of complex menus) rather than gating it.
- **Full Parity:** Conversations, assistants, skills, MCP servers, streaming, tool approval, settings, and the **Team System** are all present on both platforms.

### 2. Native TS Agent Runtime (Zero Backend)
We replace the AionCore Rust binary with a **native TypeScript orchestrator** running in-process.
- **Built-in Agent:** Users get a full autonomous agent experience immediately upon installation without setting up CLI tools.
- **TS Orchestrator:** Handles LLM calls, tool routing, skill injection, and streaming responses directly in the JS/TS environment.
- **No Rust/WASM at Runtime:** The production execution environment is 100% TypeScript (running via Bun, Capacitor, or Tauri).

### 3. BYOK & Provider Pluggability
The system follows a strict "Bring Your Own Key" model.
- **Provider Interface:** All external services (LLMs, sync, MCP) must implement the `Provider<TConfig, TClient>` interface.
- **Zero Hardcoding:** Switching a service provider requires only a configuration change, never core code changes.
- **Secure Storage:** API keys and secrets are stored in platform-native keychains (iOS Keychain / Android Keystore / OS Keyring). SQLite stores only non-sensitive metadata and reference keys.

---

## Key Findings From Codebase Audit

### Finding 1: Bridge Pattern Refinement
`localBridge.ts` replaces BOTH `ipcBridge` (Electron) and `httpBridge` (REST).
- It uses the same `{ name, data }` wire protocol and handler names as the original bridges.
- It provides a `ProviderLike` shape with direct function calls, allowing all 200+ AionUi components to work unchanged.
- Stream communication uses an in-process `EventEmitter` instead of WebSockets.

### Finding 2: Two-Tier Skill System (Runtime Installable)
We adopt a two-tier skill system optimized for mobile context limits:
- **Tier 1 (Index):** Name, description, and tags are always in memory/prompt to inform the agent of available capabilities.
- **Tier 2 (Full Content):** Loaded only when the agent outputs `[LOAD_SKILL: name]` or if `is_auto_inject` is true.
- **Removal of Pluginpack:** Skills are no longer packaged at build time. Users import `.md` files; the app parses YAML frontmatter and stores them in the SQLite `skills` table for immediate use.

### Finding 3: MCP & Transport
AionCore's MCP client is 100% Rust and is replaced with a pure TypeScript reimplementation.
- **Transports:** Uses native HTTP adapters (Capacitor/Tauri Http plugins) to bypass WebView CORS restrictions.
- **UI:** The MCP management UI is ported directly from AionUi.

### Finding 4: Team System Inclusion
The Team System is core to the MVP on both platforms.
- Native TS agents share the same runtime and SQLite instance, making multi-agent coordination (mailbox, task board) more efficient than the original multi-process model.
- Mobile adaptation uses compact cards and bottom sheets to maintain full team visibility.

### Finding 5: ACP as Optional Plugin
The Agent Communication Protocol (ACP) for connecting external CLI agents (Claude Code, etc.) is positioned as an **optional plugin**, not core architecture.
- The `preset_agent_type` field defaults to `native`.
- ACP-related UI is gated behind the plugin installation.

---

## Revised 10-Phase Plan

### Phase 1: Analysis & Architecture Blueprint
1. Map AionUi component architecture and `isMobile` detection logic.
2. Finalize `Provider<TConfig, TClient>` interfaces for LLMs, Sync, and MCP.
3. Design the TS Orchestrator loop based on the "Aionrs" direct-call pattern.
4. Document the `localBridge` handler mapping for all 100+ domain functions.

### Phase 2: Monorepo & Native Shell Scaffolding
1. Initialize Bun workspaces monorepo: `packages/sync`, `packages/providers/`, `packages/core`, `packages/bridge`, `packages/spa`, `apps/mobile-desktop`.
2. Setup Capacitor (mobile) and Tauri (desktop) shells wrapping the same SPA.
3. Port AionUi React 19 SPA (replace Electron deps with `localBridge`).
4. Verify build pipeline integrity across all platforms.

### Phase 3: Storage (AgentFS) & Security Layer
1. **SQLite:** Integrate Capacitor SQLite and `better-sqlite3` with WAL mode and FTS5.
2. **Schema:** Implement tables for `providers`, `conversations`, `messages`, `mcp_servers`, `assistants`, `skills`, `mailbox`, and `team_tasks`.
3. **Security:** Implement native `SecureStorage` (Keychain/Keystore/Keyring).
4. **Audit:** Implement the audit trail for state changes.

### Phase 5: localBridge.ts & Communication Layer
1. Implement `localProvider` for direct function call orchestration.
2. Implement `localEmitter` for in-process streaming events.
3. Port and route all bridge handlers: `conversations.*`, `assistants.*`, `fs.*`, `mcpService.*`, `system.*`.

### Phase 5: Native TS Agent Orchestrator
1. Implement `LLMClient` for OpenAI, Anthropic, and Ollama providers.
2. Build the **TS Orchestrator**: Prompt construction, Tier 1/2 skill injection, tool routing, and streaming.
3. Implement tool-calling logic and the approval/permission workflow.

### Phase 6: MCP Integration & Management UI
1. Implement the TS MCP client with transport abstraction.
2. Develop native HTTP adapters for mobile/desktop CORS bypass.
3. Port the MCP management UI: settings, server CRUD, and tool discovery.

### Phase 7: Skill System & Runtime Installation
1. Implement skill discovery and lazy-loading from the SQLite `skills` table.
2. Build the `.md` import flow: parse YAML frontmatter and update the FTS5 index.
3. Implement `[LOAD_SKILL: name]` detection and Turn management for skill injection.

### Phase 8: Sync Engine (BYOK)
1. Implement the pluggable Sync provider interface.
2. First implementation: Turso Cloud sync using user-provided credentials.
3. Implement smart merge logic (timestamp-based) and sync status UI.
4. Ensure full offline-first functionality.

### Phase 9: Mobile UX Adaptation
1. Implement touch-optimized component overrides: bottom sheets, compact cards, swipe actions.
2. Integrate native features: camera/image picker, share sheet, and haptics.
3. Verify `isMobile` logic drives functional behavior across the SPA.

### Phase 10: Testing, QA & Final Polish
1. Unit and integration tests for the orchestrator, bridge, and sync logic.
2. E2E verification on iOS, Android, and Desktop (Tauri).
3. Final performance audit and documentation for the "Post-MVP" roadmap (including the ACP Plugin).

---

## Effort Estimates

| Phase | Description | Effort |
|-------|-------------|--------|
| 1 | Analysis & Blueprint | 40h |
| 2 | Monorepo & Shells | 60h |
| 3 | Storage & Security | 80h |
| 4 | localBridge | 100h |
| 5 | Agent Orchestrator | 120h |
| 6 | MCP & Agent UI | 80h |
| 7 | Skill System | 60h |
| 8 | Sync Engine | 50h |
| 9 | Mobile UX | 60h |
| 10 | Testing & QA | 50h |
| **Total** | | **~700h** |
