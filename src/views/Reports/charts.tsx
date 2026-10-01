"use client"

import { useCallback, useState } from "react"
import { formatShortDate } from "@/lib/format"
import type { BurndownPoint, Slice, VelocityPoint } from "@/lib/reports"
import styles from "./Reports.module.sass"

const H = 260
const PAD = { top: 16, right: 16, bottom: 32, left: 40 }
const plotH = H - PAD.top - PAD.bottom

/**
 * The chart's drawing width follows its container, so text keeps its real
 * size on phones instead of shrinking with a scaled-down viewBox.
 */
const useChartWidth = () => {
  const [width, setWidth] = useState(640)
  const ref = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

/** Axis maximum with four round ticks: 1, 2 or 5 times a power of ten each */
const niceMax = (value: number) => {
  const raw = Math.max(1, value) / 4
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const tick = [1, 2, 5, 10].map(m => m * magnitude).find(t => t >= raw)!
  return Math.max(4, tick * 4)
}

const Grid = ({ max, W }: { max: number; W: number }) => (
  <g>
    {[0, 0.25, 0.5, 0.75, 1].map(f => {
      const y = PAD.top + plotH * (1 - f)
      return (
        <g key={f}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} className={styles.gridLine} />
          <text x={PAD.left - 8} y={y + 4} textAnchor="end" className={styles.axisText}>
            {Math.round(max * f)}
          </text>
        </g>
      )
    })}
  </g>
)

export const BurndownChart = ({ points, now }: { points: BurndownPoint[]; now: number }) => {
  const [hover, setHover] = useState<number | null>(null)
  const [ref, W] = useChartWidth()
  const plotW = W - PAD.left - PAD.right
  if (points.length < 2) return <p className={styles.empty}>This sprint has no dates.</p>

  const max = niceMax(Math.max(...points.map(p => Math.max(p.ideal, p.remaining ?? 0))))
  const x = (i: number) => PAD.left + (plotW * i) / (points.length - 1)
  const y = (v: number) => PAD.top + plotH * (1 - v / max)
  const actual = points.filter(p => p.remaining !== null)
  // Step line: remaining points hold until the next day
  const actualPath = actual
    .map((p, i) => (i === 0 ? `M${x(i)},${y(p.remaining!)}` : `H${x(i)}V${y(p.remaining!)}`))
    .join("")
  const todayIndex = points.findIndex(p => p.day > now) - 1
  const labelEvery = Math.ceil(points.length / Math.max(3, Math.floor(plotW / 70)))
  const hovered = hover !== null ? points[hover] : null

  return (
    <div ref={ref} className={styles.chartWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="Sprint burndown chart">
        <Grid max={max} W={W} />
        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text key={p.day} x={x(i)} y={H - 10} textAnchor="middle" className={styles.axisText}>
              {formatShortDate(p.day)}
            </text>
          ) : null
        )}
        {todayIndex >= 0 && todayIndex < points.length - 1 && (
          <g>
            <line x1={x(todayIndex)} x2={x(todayIndex)} y1={PAD.top} y2={PAD.top + plotH} className={styles.todayLine} />
            <text x={x(todayIndex) + 4} y={PAD.top + 10} className={styles.todayText}>
              Today
            </text>
          </g>
        )}
        <line x1={x(0)} y1={y(points[0].ideal)} x2={x(points.length - 1)} y2={y(0)} className={styles.idealLine} />
        <path d={actualPath} className={styles.actualLine} />
        {actual.map((p, i) => (
          <circle key={p.day} cx={x(i)} cy={y(p.remaining!)} r={hover === i ? 5 : 3} className={styles.dot} />
        ))}
        {points.map((p, i) => (
          <rect
            key={p.day}
            x={x(i) - plotW / (points.length - 1) / 2}
            y={PAD.top}
            width={plotW / (points.length - 1)}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {hovered && (
        <div className={styles.tooltip} style={{ left: `${(x(hover!) / W) * 100}%` }}>
          <strong>{formatShortDate(hovered.day)}</strong>
          <span>Remaining: {hovered.remaining ?? "–"} pts</span>
          <span>Guideline: {hovered.ideal} pts</span>
        </div>
      )}
      <div className={styles.legend}>
        <span className={styles.legendActual}>Remaining points</span>
        <span className={styles.legendIdeal}>Guideline</span>
      </div>
    </div>
  )
}

export const VelocityChart = ({ data }: { data: VelocityPoint[] }) => {
  const [ref, W] = useChartWidth()
  const plotW = W - PAD.left - PAD.right
  if (!data.length) return <p className={styles.empty}>Complete a sprint to see your velocity.</p>
  const max = niceMax(Math.max(...data.map(d => Math.max(d.committed, d.completed))))
  const group = plotW / data.length
  const bar = Math.min(28, group / 3)
  const y = (v: number) => PAD.top + plotH * (1 - v / max)

  return (
    <div ref={ref} className={styles.chartWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="Velocity chart">
        <Grid max={max} W={W} />
        {data.map((d, i) => {
          const cx = PAD.left + group * i + group / 2
          return (
            <g key={d.sprint.id}>
              <rect x={cx - bar - 2} y={y(d.committed)} width={bar} height={plotH + PAD.top - y(d.committed)} rx={3} className={styles.barCommitted}>
                <title>{`${d.sprint.name}: ${d.committed} committed`}</title>
              </rect>
              <rect x={cx + 2} y={y(d.completed)} width={bar} height={plotH + PAD.top - y(d.completed)} rx={3} className={styles.barCompleted}>
                <title>{`${d.sprint.name}: ${d.completed} completed`}</title>
              </rect>
              <text x={cx + 2 + bar / 2} y={y(d.completed) - 6} textAnchor="middle" className={styles.barValue}>
                {d.completed}
              </text>
              <text x={cx} y={H - 10} textAnchor="middle" className={styles.axisText}>
                {d.sprint.name.replace(/^.*?(Sprint \d+)$/, "$1")}
                {d.sprint.state === "active" && group > 110 ? " (active)" : ""}
              </text>
            </g>
          )
        })}
      </svg>
      <div className={styles.legend}>
        <span className={styles.legendCommitted}>Commitment</span>
        <span className={styles.legendCompleted}>Completed</span>
      </div>
    </div>
  )
}

export const DonutChart = ({ slices, colors }: { slices: Slice[]; colors: Record<string, string> }) => {
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  const r = 54
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className={styles.donut}>
      <svg viewBox="0 0 140 140" role="img" aria-label="Issues by status">
        <circle cx={70} cy={70} r={r} className={styles.donutTrack} />
        {total > 0 &&
          slices.map(s => {
            const length = (s.value / total) * c
            const el = (
              <circle
                key={s.key}
                cx={70}
                cy={70}
                r={r}
                fill="none"
                style={{ stroke: colors[s.key] }}
                strokeWidth={18}
                strokeDasharray={`${length} ${c - length}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 70 70)"
              >
                <title>{`${s.label}: ${s.value}`}</title>
              </circle>
            )
            offset += length
            return el
          })}
        <text x={70} y={68} textAnchor="middle" className={styles.donutTotal}>
          {total}
        </text>
        <text x={70} y={86} textAnchor="middle" className={styles.donutLabel}>
          issues
        </text>
      </svg>
      <ul className={styles.donutLegend}>
        {slices.map(s => (
          <li key={s.key}>
            <span className={styles.swatch} style={{ backgroundColor: colors[s.key] }} />
            <span>{s.label}</span>
            <strong>{s.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
