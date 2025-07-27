'use server';

import fs from 'fs-extra';
import path from 'path';
import { Swarm, SubAgent } from '@/lib/types';
import { query } from '@anthropic-ai/claude-code';

const AGENTS_DIR = path.join(process.cwd(), 'temp-agents');
const SAVED_AGENTS_FILE = path.join(process.cwd(), '.saved-agents.json');
const SAVED_SWARMS_FILE = path.join(process.cwd(), '.saved-swarms.json');
const PROMPTS_LOG_FILE = path.join(process.cwd(), 'prompts.md');
const MCP_CONFIG_FILE = path.join(process.cwd(), '.mcp.json');

fs.ensureDirSync(AGENTS_DIR);

// Logging function for prompts and completions
async function logPromptCompletion(
  functionName: string,
  context: any,
  prompt: string,
  completion: string
) {
  const timestamp = new Date().toISOString();
  const entry = `

### ${timestamp}

**Function**: \`${functionName}\`

**Context**: 
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

**Prompt**:
\`\`\`
${prompt}
\`\`\`

**Completion**:
\`\`\`
${completion}
\`\`\`

---
`;

  try {
    await fs.appendFile(PROMPTS_LOG_FILE, entry);
  } catch (error) {
    console.error('Error logging prompt/completion:', error);
  }
}

export async function createSwarm(swarm: Swarm) {
  const swarmDir = path.join(AGENTS_DIR, swarm.name);
  fs.ensureDirSync(swarmDir);

  swarm.agents.forEach((agent: SubAgent) => {
    const toolsStr = agent.tools ? agent.tools.join(', ') : '';
    const yaml = `---
name: ${agent.name}
description: ${agent.description}
${toolsStr ? `tools: ${toolsStr}` : ''}
---\n\n${agent.systemPrompt}`;
    fs.writeFileSync(path.join(swarmDir, `${agent.name}.md`), yaml);
  });

  return { message: `Swarm created at ${swarmDir}. Place files in .claude/agents/ for use.` };
}

export async function launchSession(mainPrompt: string) {
  const fullPrompt = mainPrompt;
  const systemPrompt = 'Supervise sub-agents and log interactions.';
  
  const gen = query({
    prompt: fullPrompt,
    options: {
      maxTurns: 10,
      appendSystemPrompt: systemPrompt,
    },
  });

  let sessionId = '';
  let content = '';

  for await (const msg of gen) {
    if (msg.type === 'system' && msg.subtype === 'init') {
      sessionId = msg.session_id;
    } else if (msg.type === 'assistant') {
      // Content is an array of blocks; join text parts
      if (Array.isArray(msg.message.content)) {
        content += msg.message.content.map((block: { type: string; text?: string }) => block.text || '').join('\n');
      }
    } else if (msg.type === 'result' && msg.subtype === 'success') {
      content += msg.result || '';
    }
    // Handle other types as needed, e.g., errors
  }

  // Log the prompt and completion
  await logPromptCompletion(
    'launchSession',
    { systemPrompt },
    fullPrompt,
    content.trim()
  );

  return { sessionId: sessionId || 'new-session', response: content.trim() };
}

export async function resumeSession(sessionId: string, followUpPrompt: string) {
  const gen = query({
    prompt: followUpPrompt,
    options: { resume: sessionId },
  });

  let content = '';

  for await (const msg of gen) {
    if (msg.type === 'assistant') {
      if (Array.isArray(msg.message.content)) {
        content += msg.message.content.map((block: { type: string; text?: string }) => block.text || '').join('\n');
      }
    } else if (msg.type === 'result' && msg.subtype === 'success') {
      content += msg.result || '';
    }
  }

  // Log the prompt and completion
  await logPromptCompletion(
    'resumeSession',
    { sessionId },
    followUpPrompt,
    content.trim()
  );

  return { response: content.trim() };
}

// Agent management functions
export async function saveAgent(agent: SubAgent) {
  let agents: SubAgent[] = [];
  
  if (await fs.pathExists(SAVED_AGENTS_FILE)) {
    agents = await fs.readJson(SAVED_AGENTS_FILE);
  }
  
  agents.push(agent);
  await fs.writeJson(SAVED_AGENTS_FILE, agents, { spaces: 2 });
  
  return { message: 'Agent saved successfully' };
}

export async function getAgents() {
  if (await fs.pathExists(SAVED_AGENTS_FILE)) {
    return await fs.readJson(SAVED_AGENTS_FILE);
  }
  return [];
}

export async function updateAgent(index: number, agent: SubAgent) {
  let agents: SubAgent[] = [];
  
  if (await fs.pathExists(SAVED_AGENTS_FILE)) {
    agents = await fs.readJson(SAVED_AGENTS_FILE);
  }
  
  if (index >= 0 && index < agents.length) {
    agents[index] = agent;
    await fs.writeJson(SAVED_AGENTS_FILE, agents, { spaces: 2 });
    return { message: 'Agent updated successfully' };
  }
  
  throw new Error('Agent not found');
}

export async function deleteAgent(index: number) {
  let agents: SubAgent[] = [];
  
  if (await fs.pathExists(SAVED_AGENTS_FILE)) {
    agents = await fs.readJson(SAVED_AGENTS_FILE);
  }
  
  if (index >= 0 && index < agents.length) {
    agents.splice(index, 1);
    await fs.writeJson(SAVED_AGENTS_FILE, agents, { spaces: 2 });
    return { message: 'Agent deleted successfully' };
  }
  
  throw new Error('Agent not found');
}

// Swarm management functions
export async function saveSwarm(swarm: Swarm) {
  let swarms: Swarm[] = [];
  
  if (await fs.pathExists(SAVED_SWARMS_FILE)) {
    swarms = await fs.readJson(SAVED_SWARMS_FILE);
  }
  
  swarms.push(swarm);
  await fs.writeJson(SAVED_SWARMS_FILE, swarms, { spaces: 2 });
  
  return { message: 'Swarm saved successfully' };
}

export async function getSwarms() {
  if (await fs.pathExists(SAVED_SWARMS_FILE)) {
    return await fs.readJson(SAVED_SWARMS_FILE);
  }
  return [];
}

export async function updateSwarm(index: number, swarm: Swarm) {
  let swarms: Swarm[] = [];
  
  if (await fs.pathExists(SAVED_SWARMS_FILE)) {
    swarms = await fs.readJson(SAVED_SWARMS_FILE);
  }
  
  if (index >= 0 && index < swarms.length) {
    swarms[index] = swarm;
    await fs.writeJson(SAVED_SWARMS_FILE, swarms, { spaces: 2 });
    return { message: 'Swarm updated successfully' };
  }
  
  throw new Error('Swarm not found');
}

export async function deleteSwarm(index: number) {
  let swarms: Swarm[] = [];
  
  if (await fs.pathExists(SAVED_SWARMS_FILE)) {
    swarms = await fs.readJson(SAVED_SWARMS_FILE);
  }
  
  if (index >= 0 && index < swarms.length) {
    swarms.splice(index, 1);
    await fs.writeJson(SAVED_SWARMS_FILE, swarms, { spaces: 2 });
    return { message: 'Swarm deleted successfully' };
  }
  
  throw new Error('Swarm not found');
}

// Prompt enhancement functions
export async function enhanceAgentPrompt(basicPrompt: string, agentName: string, tools: string[]) {
  const enhancementPrompt = `You are a prompt engineering expert. A user wants to create an AI agent with the following basic description:

Agent Name: ${agentName}
Available Tools: ${tools.join(', ')}
User's Basic Prompt: "${basicPrompt}"

Please enhance this into a professional, clear, and effective system prompt for the agent. The enhanced prompt should:
1. Clearly define the agent's role and expertise
2. Specify how and when to use the available tools
3. Include any relevant best practices or guidelines
4. Be specific about the agent's capabilities and limitations
5. Use clear, actionable language

Return ONLY the enhanced prompt text, nothing else.`;

  try {
    const gen = query({
      prompt: enhancementPrompt,
      options: {
        maxTokens: 500,
      },
    });

    let enhancedPrompt = '';
    for await (const msg of gen) {
      if (msg.type === 'assistant' && Array.isArray(msg.message.content)) {
        enhancedPrompt += msg.message.content.map((block: { type: string; text?: string }) => block.text || '').join('');
      }
    }

    // Log the prompt and completion
    await logPromptCompletion(
      'enhanceAgentPrompt',
      { agentName, tools },
      enhancementPrompt,
      enhancedPrompt.trim()
    );

    return { enhancedPrompt: enhancedPrompt.trim() };
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return { enhancedPrompt: basicPrompt }; // Fallback to original
  }
}

export async function enhanceSwarmPrompt(basicPrompt: string, swarmName: string, agentNames: string[]) {
  const enhancementPrompt = `You are a prompt engineering expert. A user wants to create a supervisor prompt for an AI swarm with the following details:

Swarm Name: ${swarmName}
Available Sub-Agents: ${agentNames.join(', ')}
User's Basic Prompt: "${basicPrompt}"

Please enhance this into a professional, clear, and effective supervisor prompt. The enhanced prompt should:
1. Clearly define the overall task or goal
2. Explain how to delegate tasks to the available sub-agents
3. Include coordination strategies between agents
4. Specify expected outcomes and success criteria
5. Be clear about task decomposition and agent collaboration

Return ONLY the enhanced prompt text, nothing else.`;

  try {
    const gen = query({
      prompt: enhancementPrompt,
      options: {
        maxTokens: 500,
      },
    });

    let enhancedPrompt = '';
    for await (const msg of gen) {
      if (msg.type === 'assistant' && Array.isArray(msg.message.content)) {
        enhancedPrompt += msg.message.content.map((block: { type: string; text?: string }) => block.text || '').join('');
      }
    }

    // Log the prompt and completion
    await logPromptCompletion(
      'enhanceSwarmPrompt',
      { swarmName, agentNames },
      enhancementPrompt,
      enhancedPrompt.trim()
    );

    return { enhancedPrompt: enhancedPrompt.trim() };
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return { enhancedPrompt: basicPrompt }; // Fallback to original
  }
}

// MCP Tool Detection and Search
export async function getInstalledMCPTools() {
  try {
    if (await fs.pathExists(MCP_CONFIG_FILE)) {
      const config = await fs.readJson(MCP_CONFIG_FILE);
      return Object.keys(config.mcpServers || {});
    }
    return [];
  } catch (error) {
    console.error('Error reading MCP config:', error);
    return [];
  }
}

export async function searchMCPTools(toolNames: string[]) {
  const searchPrompt = `You are the Tool Discovery Agent. Search for MCP (Model Context Protocol) tools/servers that match these capabilities: ${toolNames.join(', ')}. 

Use web search to find:
1. NPM packages that are MCP servers (search "mcp-server npm ${toolNames.join(' OR ')}")
2. GitHub repositories implementing MCP servers
3. The official MCP server registry at github.com/modelcontextprotocol/servers

For each relevant tool found, provide in this exact JSON format:
{
  "tools": [
    {
      "name": "Human-readable tool name",
      "packageName": "npm-package-name",
      "description": "What this MCP server does",
      "installCommand": "npx -y package-name",
      "isOfficial": true/false,
      "category": "database|api|files|web|dev|other"
    }
  ],
  "summary": "Brief summary of search results"
}`;

  try {
    const gen = query({
      prompt: searchPrompt,
      options: {
        maxTokens: 1500,
        appendSystemPrompt: "You must search the web for MCP tools and return results in the specified JSON format.",
      },
    });

    let searchResults = '';
    for await (const msg of gen) {
      if (msg.type === 'assistant' && Array.isArray(msg.message.content)) {
        searchResults += msg.message.content.map((block: { type: string; text?: string }) => block.text || '').join('');
      }
    }

    // Log the search
    await logPromptCompletion(
      'searchMCPTools',
      { toolNames },
      searchPrompt,
      searchResults.trim()
    );

    // Parse JSON results
    try {
      const jsonMatch = searchResults.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          foundTools: parsed.tools || [],
          searchSummary: parsed.summary || searchResults.substring(0, 500)
        };
      }
    } catch (parseError) {
      console.error('Error parsing tool search results:', parseError);
    }

    // Fallback: return summary only
    return {
      foundTools: [],
      searchSummary: searchResults.substring(0, 500)
    };
  } catch (error) {
    console.error('Error searching MCP tools:', error);
    return {
      foundTools: [],
      searchSummary: 'Unable to search for MCP tools at this time.'
    };
  }
}

export async function suggestMCPToolsForAgent(agent: SubAgent) {
  const installedTools = await getInstalledMCPTools();
  
  // Analyze agent's needs based on its system prompt and tools
  const analysisPrompt = `Based on this agent configuration:
Name: ${agent.name}
Description: ${agent.description}
Current Tools: ${agent.tools.join(', ')}
System Prompt: ${agent.systemPrompt.substring(0, 300)}...

Suggest MCP tools that would enhance this agent's capabilities. Consider:
1. Database access (Supabase, PostgreSQL, MySQL)
2. API integrations (GitHub, Slack, Discord)
3. File system enhancements
4. Web scraping tools
5. Data processing tools

Currently installed MCP tools: ${installedTools.join(', ')}

Provide specific MCP server suggestions with rationale.`;

  try {
    const gen = query({
      prompt: analysisPrompt,
      options: {
        maxTokens: 600,
      },
    });

    let suggestions = '';
    for await (const msg of gen) {
      if (msg.type === 'assistant' && Array.isArray(msg.message.content)) {
        suggestions += msg.message.content.map((block: { type: string; text?: string }) => block.text || '').join('');
      }
    }

    // Log the analysis
    await logPromptCompletion(
      'suggestMCPToolsForAgent',
      { agentName: agent.name, installedTools },
      analysisPrompt,
      suggestions.trim()
    );

    return {
      suggestions: suggestions.trim(),
      installedTools
    };
  } catch (error) {
    console.error('Error suggesting MCP tools:', error);
    return {
      suggestions: 'Unable to analyze MCP tool needs.',
      installedTools
    };
  }
}

export async function checkSwarmCompatibility(swarmPrompt: string, agents: SubAgent[]) {
  if (!swarmPrompt || agents.length === 0) {
    return {
      isCompatible: false,
      overallScore: 0,
      analysis: "Please provide both a swarm prompt and select at least one agent.",
      suggestions: []
    };
  }

  const agentDescriptions = agents.map(agent => ({
    name: agent.name,
    description: agent.description,
    tools: Array.isArray(agent.tools) ? agent.tools : agent.tools?.split(',').map(t => t.trim()) || [],
    systemPrompt: agent.systemPrompt
  }));

  const compatibilityPrompt = `You are an AI swarm analysis expert. Analyze the compatibility between a swarm's intended purpose and its available agents.

Swarm Purpose/Prompt: "${swarmPrompt}"

Available Agents:
${agentDescriptions.map(a => `
- ${a.name}: ${a.description}
  Tools: ${a.tools.join(', ')}
  System Prompt: ${a.systemPrompt.substring(0, 200)}...
`).join('')}

Please analyze:
1. Overall compatibility score (0-100)
2. Whether the selected agents can fulfill the swarm's purpose
3. Any gaps in capabilities
4. Suggestions for improvement

Return a JSON object with this structure:
{
  "isCompatible": boolean,
  "overallScore": number (0-100),
  "analysis": "Brief analysis of compatibility",
  "agentScores": {
    "agentName": { "score": number, "reason": "why this score" }
  },
  "gaps": ["capability gap 1", "capability gap 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

  try {
    const gen = query({
      prompt: compatibilityPrompt,
      options: {
        maxTokens: 800,
      },
    });

    let response = '';
    for await (const msg of gen) {
      if (msg.type === 'assistant' && Array.isArray(msg.message.content)) {
        response += msg.message.content.map((block: { type: string; text?: string }) => block.text || '').join('');
      }
    }

    // Log the prompt and completion
    await logPromptCompletion(
      'checkSwarmCompatibility',
      { swarmPrompt: swarmPrompt.substring(0, 100) + '...', agentCount: agents.length },
      compatibilityPrompt,
      response.trim()
    );

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        isCompatible: result.isCompatible ?? true,
        overallScore: result.overallScore ?? 75,
        analysis: result.analysis ?? "Analysis completed",
        agentScores: result.agentScores ?? {},
        gaps: result.gaps ?? [],
        suggestions: result.suggestions ?? []
      };
    }

    // Fallback response
    return {
      isCompatible: true,
      overallScore: 75,
      analysis: "Unable to perform detailed analysis, but the configuration appears reasonable.",
      agentScores: {},
      gaps: [],
      suggestions: []
    };
  } catch (error) {
    console.error('Error checking compatibility:', error);
    return {
      isCompatible: true,
      overallScore: 50,
      analysis: "Unable to analyze compatibility at this time.",
      agentScores: {},
      gaps: [],
      suggestions: []
    };
  }
}