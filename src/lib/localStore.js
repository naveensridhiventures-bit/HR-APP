import { DEFAULT_DEPARTMENTS, DEFAULT_ROLES, DEFAULT_HR_LIST } from './constants'
import { todayISO } from './date'

const KEY = 'sridhi-hr:v2'

const seed = () => ({
  departments: DEFAULT_DEPARTMENTS,
  roles: DEFAULT_ROLES,
  hrList: DEFAULT_HR_LIST,
  candidates: [],
  callLogs: [],
  followups: [],
})

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) { const data = seed(); localStorage.setItem(KEY, JSON.stringify(data)); return data }
    const data = JSON.parse(raw)
    if (!data.roles)    { data.roles    = DEFAULT_ROLES;    write(data) }
    if (!data.hrList)   { data.hrList   = DEFAULT_HR_LIST;  write(data) }
    if (!data.callLogs) { data.callLogs = [];               write(data) }
    return data
  } catch { return seed() }
}

function write(data) { localStorage.setItem(KEY, JSON.stringify(data)) }

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,6)}`

export const localStore = {
  fetchAll: async () => ({ ok: true, ...read() }),

  addCandidate: async (candidate) => {
    const data = read()
    const row = { ...candidate, id: uid(), createdAt: todayISO(), updatedAt: todayISO() }
    data.candidates = [row, ...data.candidates]; write(data)
    return { candidate: row }
  },

  updateCandidate: async (id, fields) => {
    const data = read()
    data.candidates = data.candidates.map(c => c.id === id ? { ...c, ...fields, updatedAt: todayISO() } : c)
    write(data); return { ok: true }
  },

  deleteCandidate: async (id) => {
    const data = read()
    data.candidates = data.candidates.filter(c => c.id !== id)
    data.callLogs   = (data.callLogs || []).filter(l => l.candidateId !== id)
    data.followups  = data.followups.filter(f => f.candidateId !== id)
    write(data); return { ok: true }
  },

  addFollowUp: async (candidateId, entry) => {
    const data = read()
    const row = { id: uid(), candidateId, date: todayISO(), ...entry }
    data.followups = [row, ...data.followups]
    data.candidates = data.candidates.map(c =>
      c.id === candidateId ? { ...c, notes: entry.note || c.notes, nextFollowUp: entry.nextFollowUp ?? c.nextFollowUp, updatedAt: todayISO() } : c
    ); write(data); return { entry: row }
  },

  addCallLog: async (candidateId, entry) => {
    const data = read()
    const row = { id: uid(), candidateId, date: todayISO(), ...entry }
    data.callLogs = [row, ...(data.callLogs || [])]; write(data); return { callLog: row }
  },

  addDepartment: async (label) => {
    const data = read()
    const key = label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    data.departments = [...data.departments, { key, label: label.trim() }]; write(data); return { ok: true, key }
  },

  deleteDepartment: async (key) => {
    const data = read()
    data.departments = data.departments.filter(d => d.key !== key)
    data.roles = data.roles.filter(r => r.department !== key); write(data); return { ok: true }
  },

  addRole: async (department, label) => {
    const data = read()
    const role = { id: uid(), department, label: label.trim() }
    data.roles = [...data.roles, role]; write(data); return { role }
  },

  deleteRole: async (id) => {
    const data = read(); data.roles = data.roles.filter(r => r.id !== id); write(data); return { ok: true }
  },

  addHR: async (name) => {
    const data = read()
    if (!data.hrList.includes(name)) data.hrList = [...data.hrList, name]; write(data); return { ok: true }
  },

  removeHR: async (name) => {
    const data = read(); data.hrList = data.hrList.filter(h => h !== name); write(data); return { ok: true }
  },

  updateCompanyName: async (name) => {
    const data = read(); data.companyName = name; write(data); return { ok: true }
  },

  resetDemoData: () => { write(seed()) }
}