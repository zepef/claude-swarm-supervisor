'use server';

import fs from 'fs-extra';
import path from 'path';
import { Swarm, SubAgent } from '@/lib/types';
import { query } from '@anthropic-ai/claude-code';

const AGENTS_DIR = path.join(process.cwd(), 'temp-agents');

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