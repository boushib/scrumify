const short = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" })
const full = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" })
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })

export const formatShortDate = (ts: number) => short.format(ts)
export const formatDateTime = (ts: number) => full.format(ts)

/** "5 minutes ago", "yesterday", "in 3 days" */
export const formatRelative = (ts: number, now = Date.now()) => {
  const diff = ts - now
  const abs = Math.abs(diff)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (abs < minute) return "just now"
  if (abs < hour) return rtf.format(Math.round(diff / minute), "minute")
  if (abs < day) return rtf.format(Math.round(diff / hour), "hour")
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), "day")
  return short.format(ts)
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
