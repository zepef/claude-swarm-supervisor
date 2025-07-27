import { z } from 'zod';

export const IOSpecificationSchema = z.object({
  inputType: z.enum(['text', 'file', 'json', 'none']).default('text'),
  outputType: z.enum(['text', 'file', 'json', 'display']).default('text'),
  inputDescription: z.string().optional(),
  outputDescription: z.string().optional(),
  acceptedFileTypes: z.array(z.string()).optional(), // e.g., ['.txt', '.csv', '.json']
  sampleInput: z.string().optional(),
});

export type IOSpecification = z.infer<typeof IOSpecificationSchema>;

export const SubAgentSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(50, "Agent name too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tools: z.array(z.string()).optional(), // e.g., ['Bash', 'Edit']
  systemPrompt: z.string().min(50, "System prompt must be at least 50 characters"),
  ioSpec: IOSpecificationSchema.optional(),
});

export type SubAgent = z.infer<typeof SubAgentSchema>;

export const SwarmSchema = z.object({
  name: z.string().min(1),
  agents: z.array(SubAgentSchema),
  mainPrompt: z.string().min(20), // Initial prompt for the swarm supervisor session
});

export type Swarm = z.infer<typeof SwarmSchema>;