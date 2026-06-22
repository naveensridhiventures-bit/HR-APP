import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Sheet } from './ui/Primitives'
import { useApp } from '../store/AppContext'
import { useUi } from '../store/UiContext'
import { SOURCES } from '../lib/constants'
import { todayISO } from '../lib/date'

const empty = (dept) => ({
  name: '', phone: '', department: dept || '', role: '', source: SOURCES[0],
  assignedTo: '', nextFollowUp: todayISO(), notes: '',
})

export default function CandidateFormModal() {
  const { addModalOpen, closeAddModal, addModalDept } = useUi()
  const { departments, roles, hrList, addCandidate, addRole, candidates } = useApp()
  const [form, setForm] = useState(empty(addModalDept))
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [addingRole, setAddingRole] = useState(false)
  const [newRoleLabel, setNewRoleLabel] = useState('')

  useEffect(() => {
    if (addModalOpen) { setForm(empty(addModalDept)); setErrors({}); setAddingRole(false); setNewRoleLabel('') }
  }, [addModalOpen, addModalDept])

  const duplicatePhone = useMemo(() => {
    const p = form.phone.replace(/\D/g, '')
    if (p.length < 10) return null
    return candidates.find(c => c.phone.replace(/\D/g, '') === p) || null
  }, [form.phone, candidates])

  if (!addModalOpen) return null

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const rolesForDept = roles.filter(r => r.department === form.department)

  const onClose = () => { setForm(empty(addModalDept)); setErrors({}); setAddingRole(false); setNewRoleLabel(''); closeAddModal() }

  const saveNewRole = async () => {
    if (!newRoleLabel.trim() || !form.department) return
    await addRole(form.department, newRoleLabel.trim())
    setForm(f => ({ ...f, role: newRoleLabel.trim() }))
    setNewRoleLabel(''); setAddingRole(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid 10-digit phone'
    if (!form.department) errs.department = 'Pick a pipeline'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try { await addCandidate({ ...form, stage: 'applied' }); onClose() }
    finally { setSaving(false) }
  }

  const inp = (hasErr) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none ${hasErr ? 'border-rust focus:border-rust-600' : 'border-ink-100 focus:border-saffron'} bg-paper-card`

  return (
    <Sheet open={addModalOpen} onClose={onClose} title="Add candidate">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate">Full name *</label>
            <input autoFocus value={form.name} onChange={set('name')} placeholder="e.g. Ravi Kumar" className={inp(errors.name)} />
            {errors.name && <p className="mt-1 text-xs text-rust">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate">Mobile *</label>
            <input value={form.phone} onChange={set('phone')} placeholder="10-digit number" maxLength={10} className={inp(errors.phone)} />
            {errors.phone && <p className="mt-1 text-xs text-rust">{errors.phone}</p>}
            {!errors.phone && duplicatePhone && (
              <p className="mt-1 flex items-center gap-1 text-xs text-saffron-700">
                <AlertTriangle size={11} /> Already in pipeline as <strong>{duplicatePhone.name}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate">Pipeline *</label>
            <select value={form.department}
              onChange={e => { setForm(f => ({ ...f, department: e.target.value, role: '' })); setAddingRole(false) }}
              className={inp(errors.department)}>
              <option value="">Select pipeline</option>
              {departments.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
            {errors.department && <p className="mt-1 text-xs text-rust">{errors.department}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate">Role</label>
            {addingRole ? (
              <div className="flex gap-1.5">
                <input autoFocus value={newRoleLabel} onChange={e => setNewRoleLabel(e.target.value)} placeholder="Role name"
                  className="flex-1 rounded-lg border border-ink-100 bg-paper-card px-3 py-2 text-sm outline-none focus:border-saffron" />
                <button type="button" onClick={saveNewRole} className="rounded-lg bg-ink-800 px-3 py-2 text-sm font-semibold text-paper">Add</button>
                <button type="button" onClick={() => setAddingRole(false)} className="rounded-lg border border-ink-100 px-3 py-2 text-sm text-slate">✕</button>
              </div>
            ) : (
              <select value={form.role}
                onChange={e => { if (e.target.value === '__new__') { setAddingRole(true); return } setForm(f => ({ ...f, role: e.target.value })) }}
                className={inp(false)} disabled={!form.department}>
                <option value="">Select role</option>
                {rolesForDept.map(r => <option key={r.id} value={r.label}>{r.label}</option>)}
                <option value="__new__">+ Add new role…</option>
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate">Source</label>
            <select value={form.source} onChange={set('source')} className={inp(false)}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate">Assigned HR</label>
            <select value={form.assignedTo} onChange={set('assignedTo')} className={inp(false)}>
              <option value="">Unassigned</option>
              {hrList.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate">Next follow-up</label>
          <input type="date" value={form.nextFollowUp} onChange={set('nextFollowUp')} className={inp(false)} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate">Notes</label>
          <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Remarks from initial contact…"
            className="w-full rounded-lg border border-ink-100 bg-paper-card px-3 py-2 text-sm outline-none focus:border-saffron" />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-lg border border-ink-100 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
          <button type="submit" disabled={saving}
            className="flex-1 rounded-lg bg-ink-800 py-2.5 text-sm font-semibold text-paper hover:bg-ink-700 disabled:opacity-60">
            {saving ? 'Adding…' : 'Add to pipeline'}
          </button>
        </div>
      </form>
    </Sheet>
  )
}