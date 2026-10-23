import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = { total: { label: 'Requests', color: 'var(--primary)' } };

export default function RechartsFallback({ data }: { data: { day: string; total: number }[] }) {
  return (
    <ChartContainer aria-label="Sample requests by day" className="min-h-48 w-full" config={chartConfig} role="img">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis axisLine={false} dataKey="day" tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <Bar dataKey="total" fill="var(--color-total)" isAnimationActive={false} radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
