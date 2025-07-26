'use client';

import { useState } from 'react';
import { launchSession, resumeSession } from '@/app/actions';

export default function SuperviseSwarm() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');

  const startSession = async () => {
    const result = await launchSession(prompt); // prompt includes delegations, e.g., "Use agentA then agentB for task"
    setSessionId(result.sessionId);
    setLogs([result.response]);
  };

  const continueSession = async () => {
    if (!sessionId) return;
    const result = await resumeSession(sessionId, prompt);
    setLogs([...logs, result.response]);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supervise Swarm</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter main prompt (e.g., 'Use code-analyzer then optimizer to fix bugs')"
        className="border p-2 mb-4 block w-full h-32"
      />
      <button onClick={startSession} className="bg-blue-500 text-white p-2 mr-2">Launch Session</button>
      <button onClick={continueSession} disabled={!sessionId} className="bg-amber-600 text-white p-2">Resume</button>
      
      <h2 className="text-xl mt-4">Session Logs</h2>
      <div className="border p-4 bg-gray-100">
        {logs.map((log, i) => <p key={i}>{log}</p>)}
      </div>
    </div>
  );
}