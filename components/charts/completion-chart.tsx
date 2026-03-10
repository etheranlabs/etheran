'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface CompletionChartProps {
  data: { date: string; rate: number }[]
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
      <p style={{ color: textColor }}>
        Completion: {Number(payload[0]?.value).toFixed(1)}%
      </p>
    </div>
  )
}

export function CompletionChart({ data, dark }: CompletionChartProps) {
  const strokeColor = dark ? '#4a7a5e' : '#132b1f'
  const axisColor = dark ? '#333330' : '#ddddd8'
  const tickColor = dark ? '#555552' : '#888884'

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
          domain={[0, 100]}
        />
        <Tooltip
          content={<CustomTooltip dark={dark} />}
          cursor={{ stroke: axisColor }}
        />
        <Line
          dataKey="rate"
          stroke={strokeColor}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: strokeColor }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
