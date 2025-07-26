# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Swarm Supervisor is a Next.js application that enables creation and management of AI agent swarms using the Anthropic Claude Code SDK. It provides a UI for defining sub-agents with specific roles and tools, then orchestrating them through a supervisor session.

## Architecture

### Key Components

- **Create Swarm Page** (`src/app/create/page.tsx`): Form-based interface for defining swarms with multiple sub-agents
- **Supervise Page** (`src/app/supervise/page.tsx`): Session management interface for launching and controlling swarm executions
- **Server Actions** (`src/app/actions.ts`): Server-side functions that handle swarm creation, session launching, and resumption using Claude Code SDK
- **Type Definitions** (`src/lib/types.ts`): Zod schemas defining Swarm and SubAgent structures

### Agent System Design

Swarms consist of:
- **Supervisor**: Main orchestrator that receives the initial prompt and delegates to sub-agents
- **Sub-Agents**: Specialized agents with specific tools and system prompts, saved as YAML-formatted markdown files

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Start production server
npm start
```

## Key Technical Details

- Uses Next.js 15.4.4 with App Router and Server Actions
- TypeScript with strict mode enabled
- Tailwind CSS v4 for styling
- React Hook Form with Zod validation for forms
- fs-extra for file system operations
- Webpack configured to disable fs and child_process for client-side builds

## Working with the Claude Code SDK

The `@anthropic-ai/claude-code` SDK is used for:
- Creating query generators with custom prompts and options
- Managing session state through session IDs
- Handling streaming responses from Claude
- Supporting session resumption for multi-turn conversations

Key patterns:
- Use `query()` to create async generators
- Handle different message types: 'system', 'assistant', 'result'
- Extract session IDs from init messages
- Aggregate content from assistant message blocks

## Agent File Format

Sub-agents are stored as markdown files with YAML frontmatter:
```yaml
---
name: agent-name
description: Agent description
tools: Bash, Edit
---

System prompt content here...
```

Agents are temporarily created in `temp-agents/` directory and should be manually moved to `.claude/agents/` for actual use.