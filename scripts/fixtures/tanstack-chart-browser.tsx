import { barY, defineChart } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { TanStackChart } from '@/components/ui/chart-tanstack';

interface RequestRow {
  day: string;
  total: number;
}

function chart(rows: RequestRow[]) {
  return defineChart({
    marks: [barY(rows, { x: 'day', y: 'total', key: 'day' })],
    scales: {
      x: { scale: () => scaleBand().padding(0.2), axis: { label: 'Day' } },
      y: { scale: scaleLinear, zero: true, grid: true, axis: { label: 'Requests' } },
    },
    tooltip,
  });
}

const original = [
  { day: 'Mon', total: 12 },
  { day: 'Tue', total: 18 },
  { day: 'Wed', total: 9 },
];
const updated = [
  { day: 'Mon', total: 12 },
  { day: 'Tue', total: 24 },
  { day: 'Wed', total: 9 },
];
const empty: RequestRow[] = [];
const views = {
  original: { rows: original, definition: chart(original) },
  updated: { rows: updated, definition: chart(updated) },
  empty: { rows: empty, definition: chart(empty) },
};

function App() {
  const [view, setView] = useState<keyof typeof views>('original');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const selected = views[view].rows.find((row) => row.day === selectedDay);
  return (
    <main className="mx-auto w-full max-w-2xl min-w-0 space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Requests by day</h1>
      <p>TanStack Charts is the recommended backend. This install does not include Recharts.</p>
      <TanStackChart
        ariaDescription="Static sample request counts. Exact values are in the table below."
        ariaLabel="Daily sample requests"
        definition={views[view].definition}
        height={240}
        onSelect={(point) => setSelectedDay(point?.datum.day ?? null)}
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setView('updated')} type="button">
          Update data
        </Button>
        <Button
          onClick={() => {
            setView('empty');
            setSelectedDay(null);
          }}
          type="button"
        >
          Clear data
        </Button>
        <Button onClick={() => setView('original')} type="button">
          Restore data
        </Button>
      </div>
      <output aria-label="Selected request" className="block">
        {selected === undefined ? 'None' : `${selected.day}: ${selected.total}`}
      </output>
      {view === 'empty' ? (
        <p role="status">No sample requests.</p>
      ) : (
        <table className="w-full text-left">
          <caption>Exact request counts</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Requests</th>
            </tr>
          </thead>
          <tbody>
            {views[view].rows.map((row) => (
              <tr key={row.day}>
                <th scope="row">{row.day}</th>
                <td>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const root = document.querySelector('#root');
if (root === null) {
  throw new Error('Missing chart consumer root');
}
createRoot(root).render(<App />);
