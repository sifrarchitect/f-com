'use client'

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

interface ChartData {
  date: string
  revenue: number
}

interface RevenueChartProps {
  data: ChartData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
        <p className="text-zinc-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          {payload[0].value.toLocaleString()} BDT
        </p>
      </div>
    )
  }
  return null
}

export function AdminRevenueChart({ data }: RevenueChartProps) {
  // If no data, render empty state
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center border border-zinc-800 rounded-xl bg-zinc-950/50">
        <p className="text-zinc-500 text-sm">No revenue data available.</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 12 }}
            tickFormatter={(value) => `৳${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent', stroke: '#3f3f46', strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            activeDot={{ r: 4, strokeWidth: 0, fill: '#60a5fa' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
