export const todayISO = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export const toISO = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export const isOverdue = (isoDate) => {
  if (!isoDate) return false
  return isoDate < todayISO()
}

export const isToday = (isoDate) => isoDate === todayISO()

export const isUpcoming = (isoDate, days = 3) => {
  if (!isoDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(isoDate)
  const diff = (target - today) / 86400000
  return diff > 0 && diff <= days
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const formatDate = (isoDate) => {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export const formatDateFull = (isoDate) => {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export const relativeFollowUpLabel = (isoDate) => {
  if (!isoDate) return { label: 'No date set', tone: 'muted' }
  if (isOverdue(isoDate)) {
    const days = Math.round((new Date(todayISO()) - new Date(isoDate)) / 86400000)
    return { label: `Overdue ${days}d`, tone: 'overdue' }
  }
  if (isToday(isoDate)) return { label: 'Today', tone: 'today' }
  if (isUpcoming(isoDate, 1)) return { label: 'Tomorrow', tone: 'upcoming' }
  return { label: formatDate(isoDate), tone: 'future' }
}

export const timeAgo = (isoDateTime) => {
  if (!isoDateTime) return ''
  const diffMs = Date.now() - new Date(isoDateTime).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  return `${days}d ago`
}
