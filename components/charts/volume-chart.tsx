'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface VolumeChartProps {
  data: { date: string; count: number; volume: number }[]
  dark?: boolean
}

const CustomTooltip = ({ active, payload, label, dark }: any) => {
  if (!active || !payload?.length) return null
  const bg = dark ? '#1a1a18' : '#f7f7f3'
  const border = dark ? '#2a2a28' : '#ddddd8'
  const textColor = dark ? '#f7f7f3' : '#111110'
  const mutedColor = dark ? '#555552' : '#888884'

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        padding: '10px 14px',
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: 11,
      }}
    >
      <p style={{ color: mutedColor, fontSize: 10, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: textColor }}>
          {p.name}: {p.dataKey === 'volume' ? `${Number(p.value).toFixed(4)} ETH` : p.value}
        </p>
      ))}
    </div>
  )
}

export function VolumeChart({ data, dark }: VolumeChartProps) {
  const fillColor = dark ? '#2a3a30' : '#ddddd8'
  const axisColor = dark ? '#333330' : '#ddddd8'
  const tickColor = dark ? '#555552' : '#888884'

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={6} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke={axisColor}
          strokeDasharray="none"
        />
        <XAxis
          dataKey="date"
          tick={{ fill: tickColor, fontFamily: 'var(--font-jetbrains)', fontSize: 9 }}
          axisLine={{ stroke: axisColor }}
          tickLine={false}
          tickFormatter={(v) => v.slice(5)} // MM-DD
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: tickColor, fontFamily: 'var(--font-jetbrains)', fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip dark={dark} />}
          cursor={{ fill: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
        />
        <Bar dataKey="volume" name="Volume (ETH)" fill={fillColor} radius={0} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function JobCountChart({ data, dark }: VolumeChartProps) {
  const fillColor = dark ? '#2a3a30' : '#ddddd8'
  const axisColor = dark ? '#333330' : '#ddddd8'
  const tickColor = dark ? '#555552' : '#888884'

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={6} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke={axisColor}
          strokeDasharray="none"
        />
        <XAxis
          dataKey="date"
          tick={{ fill: tickColor, fontFamily: 'var(--font-jetbrains)', fontSize: 9 }}
          axisLine={{ stroke: axisColor }}
          tickLine={false}
          tickFormatter={(v) => v.slice(5)}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: tickColor, fontFamily: 'var(--font-jetbrains)', fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip dark={dark} />}
          cursor={{ fill: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
        />
        <Bar dataKey="count" name="Jobs" fill={fillColor} radius={0} />
      </BarChart>
    </ResponsiveContainer>
  )
}
