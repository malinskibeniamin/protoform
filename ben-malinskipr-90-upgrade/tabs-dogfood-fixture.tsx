import React from 'react';
import { createRoot } from 'react-dom/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/registry/base-nova/protoform/components/tabs';
import { Button } from '@/components/ui/button';

function App() {
  const [columns, setColumns] = React.useState(2);
  return <main className="mx-auto max-w-xl space-y-6 p-6">
    <h1 className="font-bold text-xl">Equal-width tabs</h1>
    <div className="flex flex-wrap gap-2"><Button onClick={() => setColumns(3)}>Three columns</Button><Button onClick={() => setColumns(4)}>Custom layout</Button><Button onClick={() => setColumns(2)}>Reset</Button></div>
    <Tabs defaultValue="first">
      <TabsList aria-label="Sections" className="w-full" columns={columns} layout="equal" style={columns === 4 ? { gridTemplateColumns: '80px 1fr' } : undefined}>
        <TabsTrigger value="first">First</TabsTrigger><TabsTrigger value="second">Second</TabsTrigger><TabsTrigger value="third">Third</TabsTrigger>
      </TabsList>
      <TabsContent value="first">First panel</TabsContent><TabsContent value="second">Second panel</TabsContent><TabsContent value="third">Third panel</TabsContent>
    </Tabs>
  </main>;
}
createRoot(document.getElementById('app')!).render(<App />);
