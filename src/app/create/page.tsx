'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Swarm, SwarmSchema } from '@/lib/types';
import { createSwarm } from '@/app/actions';

export default function CreateSwarm() {
  const [success, setSuccess] = useState<string | null>(null);
  const { register, control, handleSubmit, formState: { errors } } = useForm<Swarm>({
    resolver: zodResolver(SwarmSchema),
    defaultValues: { agents: [{ name: '', description: '', systemPrompt: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'agents' });

  const onSubmit = async (data: Swarm) => {
    const result = await createSwarm(data);
    setSuccess(result.message);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create Swarm</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Swarm Name</label>
        <input {...register('name')} className="border p-2 mb-2 block" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}

        <label>Main Prompt (for Supervisor Session)</label>
        <textarea {...register('mainPrompt')} className="border p-2 mb-4 block w-full" />
        {errors.mainPrompt && <p className="text-red-500">{errors.mainPrompt.message}</p>}

        <h2 className="text-xl mt-4">Sub-Agents</h2>
        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 mb-4">
            <label>Agent Name</label>
            <input {...register(`agents.${index}.name`)} className="border p-2 mb-2 block" />
            {errors.agents?.[index]?.name && <p className="text-red-500">{errors.agents[index]?.name?.message}</p>}

            <label>Description</label>
            <textarea {...register(`agents.${index}.description`)} className="border p-2 mb-2 block w-full" />
            {errors.agents?.[index]?.description && <p className="text-red-500">{errors.agents[index]?.description?.message}</p>}

            <label>Tools (comma-separated, optional)</label>
            <input {...register(`agents.${index}.tools`)} className="border p-2 mb-2 block" placeholder="Bash,Edit" />
            
            <label>System Prompt</label>
            <textarea {...register(`agents.${index}.systemPrompt`)} className="border p-2 mb-2 block w-full" />
            {errors.agents?.[index]?.systemPrompt && <p className="text-red-500">{errors.agents[index]?.systemPrompt?.message}</p>}

            <button type="button" onClick={() => remove(index)} className="bg-red-500 text-white p-2">Remove Agent</button>
          </div>
        ))}
        <button type="button" onClick={() => append({ name: '', description: '', systemPrompt: '' })} className="bg-blue-500 text-white p-2 mb-4">Add Agent</button>

        <button type="submit" className="bg-green-500 text-white p-2">Create Swarm</button>
      </form>
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
}