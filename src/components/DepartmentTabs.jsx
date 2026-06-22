import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../store/AppContext'

export default function DepartmentTabs({ active, onChange }) {
  const { departments, candidates, addDepartment } = useApp()
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')

  const countFor = (key) => candidates.filter((c) => c.department === key && !['hired', 'rejected'].includes(c.stage)).length

  const submit = async (e) => {
    e.preventDefault()
    if (!label.trim()) return
    await addDepartment(label.trim())
    setLabel('')
    setAdding(false)
  }

  return (
    <div className="flex items-end gap-1 overflow-x-auto border-b border-ink-100 px-1 pt-2 sm:px-0">
      {departments.map((d) => {
        const isActive = d.key === active
        return (
          <button
            key={d.key}
            onClick={() => onChange(d.key)}
            className={`folder-tab flex shrink-0 items-center gap-2 whitespace-nowrap border border-b-0 px-4 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-ink-100 bg-paper-card text-ink-800'
                : 'border-transparent bg-transparent text-slate hover:text-ink-700'
            }`}
          >
            {d.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-saffron-50 text-saffron-700' : 'bg-ink-50 text-slate'}`}>
              {countFor(d.key)}
            </span>
          </button>
        )
      })}

      {adding ? (
        <form onSubmit={submit} className="flex shrink-0 items-center gap-1.5 px-2 pb-2">
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => !label && setAdding(false)}
            placeholder="New pipeline name"
            className="w-36 rounded-lg border border-ink-100 bg-paper-card px-2.5 py-1.5 text-sm outline-none focus:border-saffron"
          />
          <button type="submit" className="rounded-lg bg-ink-800 px-2.5 py-1.5 text-xs font-semibold text-paper">Add</button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="folder-tab flex shrink-0 items-center gap-1 border border-dashed border-ink-100 px-3 py-2.5 text-sm font-medium text-slate hover:text-ink-700"
        >
          <Plus size={14} /> Pipeline
        </button>
      )}
    </div>
  )
}
