'use server';

import fs from 'fs-extra';
import path from 'path';
import { Swarm, SubAgent } from '@/lib/types';
import { query } from '@anthropic-ai/claude-code';

const AGENTS_DIR = path.join(process.cwd(), 'temp-agents');
const SAVED_AGENTS_FILE = path.join(process.cwd(), '.saved-agents.json');
const SAVED_SWARMS_FILE = path.join(process.cwd(), '.saved-swarms.json');

fs.ensureDirSync(AGENTS_DIR);

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
  const gen = query({
    prompt: mainPrompt,
    options: {
      maxTurns: 10,
      appendSystemPrompt: 'Supervise sub-agents and log interactions.',
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