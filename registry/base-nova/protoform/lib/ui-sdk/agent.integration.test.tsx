import { afterEach, expect, test } from '@rstest/core';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button/index';
import { Input } from '@/components/ui/input/index';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select/index';
import { Switch } from '@/components/ui/switch/index';
import { createAgent } from './agent';

const agent = createAgent();
afterEach(cleanup);
function Settings() {
  const [name, setName] = useState('Apollo');
  const [visibility, setVisibility] = useState<string | null>('private');
  const [digest, setDigest] = useState(false);
  const [saved, setSaved] = useState('');
  return (
    <>
      <Input aria-label="Project name" onValueChange={setName} value={name} />
      <Select items={['private', 'internal']} onValueChange={setVisibility} value={visibility}>
        <SelectTrigger aria-label="Visibility">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="private">Private</SelectItem>
          <SelectItem value="internal">Internal</SelectItem>
        </SelectContent>
      </Select>
      <Switch aria-label="Weekly digest" checked={digest} onCheckedChange={setDigest} />
      <Button onClick={() => setSaved(`${name}:${visibility}:${digest}`)}>Save settings</Button>
      <output aria-label="Saved settings">{saved}</output>
    </>
  );
}
test('opt-in agent bridge operates themed controls and commits their controlled state', async () => {
  render(<Settings />);
  await waitFor(() => expect(agent.snapshot().map((entry) => entry.label)).toContain('Project name'));
  for (const label of ['Project name', 'Visibility', 'Weekly digest', 'Save settings']) {
    expect(agent.snapshot().map((entry) => entry.label)).toContain(label);
  }
  await Promise.resolve(
    act(async () => {
      const result = await agent.act({
        steps: [
          { ref: 'Project name', action: 'setValue', args: ['Atlas'] },
          { ref: 'Visibility', action: 'setValue', args: ['internal'] },
          { ref: 'Weekly digest', action: 'setChecked', args: [true] },
        ],
      });
      expect(result.ok, result.error?.message).toBe(true);
    })
  );
  await Promise.resolve(
    act(async () => {
      const result = await agent.act({ steps: [{ ref: 'Save settings', action: 'press', args: [] }] });
      expect(result.ok, result.error?.message).toBe(true);
    })
  );
  expect(screen.getByRole('status', { name: 'Saved settings' })).toHaveTextContent('Atlas:internal:true');
});
