'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

interface AgencyData {
  name: string
  active: number
  suspended: number
}

interface AgenciesChartProps {
  data: AgencyData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
        <p className="text-zinc-400 text-xs mb-2">{label}</p>
        <div className="flex flex-col gap-1">
          <p className="text-white text-sm font-medium flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 opacity-80"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Active </span>
            <span>{payload[0]?.value || 0}</span>
          </p>
          <p className="text-white text-sm font-medium flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 opacity-80"><span className="w-1.5 h-1.5 rounded-full bg-red-500"/> Suspended </span>
            <span>{payload[1]?.value || 0}</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

export function AdminAgenciesChart({ data }: AgenciesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center border border-zinc-800 rounded-xl bg-zinc-950/50">
        <p className="text-zinc-500 text-sm">No agency data available.</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }} barSize={12}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} content={<CustomTooltip />} />
          <Bar dataKey="active" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
          <Bar dataKey="suspended" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
