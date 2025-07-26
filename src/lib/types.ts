import { z } from 'zod';

export const SubAgentSchema = z.object({
  name: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  description: z.string().min(10),
  tools: z.array(z.string()).optional(), // e.g., ['Bash', 'Edit']
  systemPrompt: z.string().min(50),
});

export type SubAgent = z.infer<typeof SubAgentSchema>;

export const SwarmSchema = z.object({
  name: z.string().min(1),
  agents: z.array(SubAgentSchema),
  mainPrompt: z.string().min(20), // Initial prompt for the swarm supervisor session
});

export type Swarm = z.infer<typeof SwarmSchema>;