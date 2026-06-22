export function exportCandidatesCsv(candidates, departments = []) {
  const deptLabel = (key) => departments.find((d) => d.key === key)?.label || key
  const headers = ['Name', 'Phone', 'Pipeline', 'Role', 'Stage', 'Source', 'Assigned To', 'Next Follow-up', 'Notes', 'Added On']
  const rows = candidates.map((c) => [
    c.name, c.phone, deptLabel(c.department), c.role || '', c.stage, c.source || '', c.assignedTo || '', c.nextFollowUp || '', (c.notes || '').replace(/\n/g, ' '), c.createdAt || ''
  ])

  const escape = (val) => {
    const s = String(val ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sridhi-hr-candidates-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
