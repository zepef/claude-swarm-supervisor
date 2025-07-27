# Tool Discovery Agent - MCP Integration Guide

## Overview

The Tool Discovery Agent is a specialized AI sub-agent that helps users discover and integrate Model Context Protocol (MCP) tools into their Claude Swarm Supervisor agents. This feature addresses the challenge of finding appropriate MCP servers to enhance agent capabilities beyond the standard Claude Code tools.

## Architecture

### Core Components

#### 1. Tool Discovery Agent (`src/lib/tool-discovery-agent.ts`)
A pre-configured sub-agent with expertise in:
- Searching npm registry for MCP servers
- Analyzing agent configurations
- Recommending appropriate tools
- Providing installation guidance

```typescript
export const ToolDiscoveryAgent: SubAgent = {
  name: "Tool Discovery Agent",
  description: "Specializes in discovering, analyzing, and recommending MCP tools",
  tools: ["WebSearch", "WebFetch", "Read", "Write", "Grep"],
  systemPrompt: "Expert in finding and recommending MCP tools..."
}
```

#### 2. Server Actions (`src/app/actions.ts`)

**`getInstalledMCPTools()`**
- Reads `.mcp.json` configuration file
- Returns list of currently installed MCP servers
- Handles errors gracefully with empty array fallback

**`searchMCPTools(toolNames: string[])`**
- Uses Claude with WebSearch to find relevant MCP servers
- Searches npm packages matching pattern `@*/mcp-server-*` or `*-mcp-server`
- Returns structured data with installation commands

**`suggestMCPToolsForAgent(agent: SubAgent)`**
- Analyzes agent's system prompt and selected tools
- Identifies capability gaps
- Suggests specific MCP servers with rationale
- Considers installed tools to avoid duplicates

#### 3. UI Component (`src/components/mcp-tool-suggestions.tsx`)

Interactive component that provides:
- Real-time MCP tool analysis
- Visual indicators for installed vs available tools
- One-click installation command copying
- Direct links to MCP server registry

```tsx
<MCPToolSuggestions
  agent={{
    name: "Code Reviewer",
    tools: ["Read", "Edit"],
    systemPrompt: "Review code for best practices..."
  }}
/>
```

## Features

### 1. Intelligent Tool Discovery

The system uses AI to understand agent requirements and search for matching MCP tools:

```typescript
const searchPrompt = `Search for MCP tools that match: ${toolNames.join(', ')}
Look for:
1. NPM packages (pattern: mcp-server-*)
2. GitHub repositories
3. Official Anthropic MCP tools
Return JSON with package info and installation commands`;
```

### 2. Compatibility Analysis

Before suggesting tools, the system analyzes:
- Agent's current tool selection
- System prompt to understand agent purpose
- Already installed MCP servers
- Potential capability enhancements

### 3. Visual Tool Status

The enhanced tool selector shows:
- Core Claude Code tools
- Available MCP tools with badges
- Installation status indicators
- Tool categories for easy navigation

### 4. Installation Guidance

Each suggested tool includes:
- Package name and description
- `npx` command for immediate use
- Configuration examples for `.mcp.json`
- Links to documentation

## User Workflow

### Creating an Agent with MCP Tools

1. **Define Agent Basics**
   - Enter agent name and description
   - Select core Claude Code tools

2. **Discover MCP Enhancements**
   - Click "Suggest MCP Tools" button
   - System analyzes agent configuration
   - Receive tailored recommendations

3. **Review Suggestions**
   - See which MCP servers could help
   - Understand why each is recommended
   - Check installation commands

4. **Install Selected Tools**
   - Copy installation commands
   - Add to `.mcp.json` configuration
   - Restart Claude Code to activate

### Example Integration

For a database-focused agent:
```json
{
  "suggestions": [
    {
      "name": "Supabase MCP Server",
      "packageName": "@supabase/mcp-server-supabase",
      "description": "Database operations, SQL queries, table management",
      "installCommand": "npx -y @supabase/mcp-server-supabase@latest",
      "rationale": "Your agent needs database access for data analysis tasks"
    }
  ]
}
```

## MCP Tool Categories

The system recognizes several MCP tool categories:

### Database Tools
- `@supabase/mcp-server-supabase` - Supabase database operations
- `postgres-mcp-server` - PostgreSQL direct access
- `sqlite-mcp-server` - Local SQLite databases

### API Integration Tools
- `github-mcp-server` - GitHub API access
- `slack-mcp-server` - Slack workspace integration
- `discord-mcp-server` - Discord bot capabilities

### Development Tools
- `shadcn-ui-mcp-server` - UI component information
- `redis-mcp-server` - Redis cache operations
- `docker-mcp-server` - Container management

### Project Management
- `vibe-kanban-mcp-server` - Kanban board operations
- `jira-mcp-server` - Jira ticket management
- `notion-mcp-server` - Notion workspace access

## Technical Implementation

### Search Strategy

The Tool Discovery Agent uses multiple search strategies:

1. **NPM Registry Search**
   - Query: `"mcp-server" npm package`
   - Filters for recent updates
   - Checks download statistics

2. **GitHub Search**
   - Query: `"model context protocol" server implementation`
   - Looks for official repositories
   - Identifies community contributions

3. **Official Registry**
   - Checks `github.com/modelcontextprotocol/servers`
   - Prioritizes verified tools
   - Ensures compatibility

### JSON Response Format

The system expects structured responses:

```json
{
  "tools": [
    {
      "name": "Human-readable name",
      "packageName": "npm-package-name",
      "description": "What this MCP server does",
      "installCommand": "npx -y package-name",
      "isOfficial": true,
      "category": "database|api|files|web|dev|other"
    }
  ],
  "summary": "Brief overview of findings"
}
```

### Error Handling

Robust error handling ensures graceful degradation:
- Network failures return cached suggestions
- Parsing errors fall back to text summaries
- Missing configurations use sensible defaults

## Best Practices

### For Users

1. **Start Simple**: Begin with core tools, add MCP tools as needed
2. **Test Incrementally**: Install one MCP server at a time
3. **Check Compatibility**: Ensure MCP tools work with your Claude Code version
4. **Review Security**: Understand what access each MCP tool requires

### For Developers

1. **Cache Results**: Store successful MCP tool searches
2. **Version Checking**: Ensure MCP tools match Claude Code SDK version
3. **Documentation**: Link to official docs for each suggested tool
4. **Feedback Loop**: Track which suggestions users actually install

## Future Enhancements

### Planned Features

1. **Auto-Installation**: One-click MCP tool installation
2. **Dependency Resolution**: Check for required dependencies
3. **Tool Ratings**: Community ratings for MCP servers
4. **Custom Registries**: Support for private MCP tool registries

### Integration Opportunities

1. **Swarm Analysis**: Suggest MCP tools for entire swarms
2. **Tool Conflicts**: Detect incompatible tool combinations
3. **Performance Metrics**: Show tool performance impact
4. **Usage Analytics**: Track most useful MCP tools

## Troubleshooting

### Common Issues

**MCP Tools Not Appearing**
- Ensure `.mcp.json` is properly formatted
- Restart Claude Code after configuration changes
- Check tool naming matches expected patterns

**Search Not Finding Tools**
- Verify internet connectivity
- Check if WebSearch tool is enabled
- Try more specific search terms

**Installation Failures**
- Confirm npm/npx is installed
- Check for corporate proxy settings
- Verify package names are correct

## Conclusion

The Tool Discovery Agent transforms how users find and integrate MCP tools, making it easy to extend agent capabilities. By combining AI-powered search with intelligent analysis, it helps users build more powerful and specialized agents for their specific needs.