import { useState } from 'react'
import { Bell, CheckCircle2, CloudOff, Plus, RotateCcw, Trash2, Users } from 'lucide-react'
import { TopBar } from '../components/Shell'
import { ConfirmDialog } from '../components/ui/Primitives'
import { InstallButton } from '../components/InstallPrompt'
import { useApp } from '../store/AppContext'
import { localStore } from '../lib/localStore'
import { isApiConfigured } from '../lib/api'

export default function Settings() {
  const {
    departments, deleteDepartment,
    roles, addRole, deleteRole,
    hrList, addHR, removeHR,
    companyName, setCompanyName,
    reload, usingLocalFallback, pushToast,
    addDepartment,
  } = useApp()

  const [removeKey, setRemoveKey]       = useState(null)
  const [removeRoleId, setRemoveRoleId] = useState(null)
  const [removeHrName, setRemoveHrName] = useState(null)
  const [roleDept, setRoleDept]         = useState(departments[0]?.key || '')
  const [newRoleLabel, setNewRoleLabel] = useState('')
  const [newDeptLabel, setNewDeptLabel] = useState('')
  const [newHrName, setNewHrName]       = useState('')
  const [nameInput, setNameInput]       = useState(companyName)

  const addRoleSubmit = async (e) => {
    e.preventDefault()
    if (!newRoleLabel.trim() || !roleDept) return
    await addRole(roleDept, newRoleLabel.trim())
    setNewRoleLabel('')
  }

  const addDeptSubmit = async (e) => {
    e.preventDefault()
    if (!newDeptLabel.trim()) return
    await addDepartment(newDeptLabel.trim())
    setNewDeptLabel('')
  }

  const addHrSubmit = async (e) => {
    e.preventDefault()
    if (!newHrName.trim()) return
    await addHR(newHrName.trim())
    setNewHrName('')
  }

  const inp = 'flex-1 rounded-lg border border-ink-100 bg-paper-card px-3 py-2 text-sm outline-none focus:border-saffron'

  return (
    <div className="pb-24 lg:pb-10">
      <TopBar title="Settings" />

      <div className="space-y-8 px-4 pt-5 sm:px-6">
        {/* Company name */}
        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-ink-800">Company name</h2>
          <div className="flex gap-2">
            <input value={nameInput} onChange={e => setNameInput(e.target.value)}
              placeholder="Your company name" className={inp} />
            <button onClick={() => { setCompanyName(nameInput); pushToast('Company name saved', 'success') }}
              className="rounded-lg bg-ink-800 px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-700">
              Save
            </button>
          </div>
        </section>

        {/* HR Team */}
        <section>
          <h2 className="mb-1 font-display text-base font-semibold text-ink-800">HR Team</h2>
          <p className="mb-3 text-sm text-slate">Manage recruiters who appear in the "Assigned HR" dropdown.</p>
          <form onSubmit={addHrSubmit} className="mb-4 flex gap-2">
            <input value={newHrName} onChange={e => setNewHrName(e.target.value)}
              placeholder="e.g. Sunita M" className={inp} />
            <button type="submit" disabled={!newHrName.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-ink-800 px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-700 disabled:opacity-50">
              <Plus size={14} /> Add HR
            </button>
          </form>
          <div className="space-y-2">
            {hrList.map(hr => (
              <div key={hr} className="flex items-center justify-between rounded-lg border border-ink-100 bg-paper-card px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-800">
                    {hr.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-ink-800">{hr}</span>
                </div>
                <button onClick={() => setRemoveHrName(hr)}
                  className="rounded-full p-1.5 text-slate hover:bg-rust-50 hover:text-rust">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {hrList.length === 0 && <p className="text-sm text-slate">No HR team members added yet.</p>}
          </div>
        </section>

        {/* Pipelines */}
        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-ink-800">Pipelines</h2>
          <form onSubmit={addDeptSubmit} className="mb-4 flex gap-2">
            <input value={newDeptLabel} onChange={e => setNewDeptLabel(e.target.value)}
              placeholder="e.g. Accountant" className={inp} />
            <button type="submit" disabled={!newDeptLabel.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-ink-800 px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-700 disabled:opacity-50">
              <Plus size={14} /> Add
            </button>
          </form>
          <div className="space-y-2">
            {departments.map(d => (
              <div key={d.key} className="flex items-center justify-between rounded-lg border border-ink-100 bg-paper-card px-3 py-2.5">
                <span className="text-sm font-medium text-ink-800">{d.label}</span>
                <button onClick={() => setRemoveKey(d.key)}
                  className="rounded-full p-1.5 text-slate hover:bg-rust-50 hover:text-rust">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-ink-800">Roles</h2>
          <form onSubmit={addRoleSubmit} className="mb-4 flex gap-2">
            <select value={roleDept} onChange={e => setRoleDept(e.target.value)}
              className="rounded-lg border border-ink-100 bg-paper-card px-3 py-2 text-sm outline-none focus:border-saffron">
              {departments.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
            <input value={newRoleLabel} onChange={e => setNewRoleLabel(e.target.value)}
              placeholder="Role name" className={inp} />
            <button type="submit" disabled={!newRoleLabel.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-ink-800 px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-700 disabled:opacity-50">
              <Plus size={14} /> Add
            </button>
          </form>
          <div className="space-y-2">
            {departments.map(d => {
              const dRoles = roles.filter(r => r.department === d.key)
              if (!dRoles.length) return null
              return (
                <div key={d.key}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate">{d.label}</p>
                  {dRoles.map(r => (
                    <div key={r.id} className="mb-1 flex items-center justify-between rounded-lg border border-ink-100 bg-paper-card px-3 py-2">
                      <span className="text-sm text-ink-700">{r.label}</span>
                      <button onClick={() => setRemoveRoleId(r.id)}
                        className="rounded-full p-1 text-slate hover:bg-rust-50 hover:text-rust">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </section>

        {/* Install / offline */}
        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-ink-800">App</h2>
          <div className="space-y-3">
            {usingLocalFallback && (
              <div className="flex items-start gap-2 rounded-xl2 border border-ink-100 bg-paper-card p-3 text-sm text-slate">
                <CloudOff size={16} className="mt-0.5 shrink-0" />
                Data is stored locally in this browser. No backend configured.
              </div>
            )}
            {!usingLocalFallback && (
              <div className="flex items-center gap-2 rounded-xl2 border border-stamp/30 bg-stamp-50 px-3 py-2.5 text-sm text-stamp-600">
                <CheckCircle2 size={16} /> Connected to server
              </div>
            )}
            <InstallButton className="w-full justify-center" />
          </div>
        </section>

        {/* Reset */}
        {usingLocalFallback && (
          <section>
            <h2 className="mb-3 font-display text-base font-semibold text-ink-800">Reset demo data</h2>
            <button onClick={() => { localStore.resetDemoData(); reload(); pushToast('Demo data reset') }}
              className="flex items-center gap-2 rounded-lg border border-rust/30 bg-rust-50 px-4 py-2.5 text-sm font-semibold text-rust-600 hover:bg-rust-100">
              <RotateCcw size={15} /> Reset to sample data
            </button>
          </section>
        )}
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog open={Boolean(removeKey)}
        title="Remove pipeline?"
        message="This will also remove all roles in this pipeline. Candidates already in it won't be deleted."
        onCancel={() => setRemoveKey(null)}
        onConfirm={() => { deleteDepartment(removeKey); setRemoveKey(null) }} />

      <ConfirmDialog open={Boolean(removeRoleId)}
        title="Remove role?"
        message="The role will be removed. Candidates already tagged with it won't be affected."
        onCancel={() => setRemoveRoleId(null)}
        onConfirm={() => { deleteRole(removeRoleId); setRemoveRoleId(null) }} />

      <ConfirmDialog open={Boolean(removeHrName)}
        title={`Remove ${removeHrName} from HR team?`}
        message="Candidates assigned to them will keep the assignment but the name will no longer appear in dropdowns."
        onCancel={() => setRemoveHrName(null)}
        onConfirm={() => { removeHR(removeHrName); setRemoveHrName(null) }} />
    </div>
  )
}
