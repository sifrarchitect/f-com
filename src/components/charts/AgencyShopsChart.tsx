'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

interface ShopStatusData {
  name: string
  value: number
  color: string
}

interface ShopsChartProps {
  data: ShopStatusData[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
        <p className="text-white font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export function AgencyShopsChart({ data }: ShopsChartProps) {
  if (!data || data.reduce((a, b) => a + b.value, 0) === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center border border-zinc-800 rounded-xl bg-zinc-950/50">
        <p className="text-zinc-500 text-sm">No shop data available.</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full pt-4" style={{ minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
