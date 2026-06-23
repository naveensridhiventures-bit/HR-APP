import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api, isApiConfigured } from '../lib/api'
import { localStore } from '../lib/localStore'
import { DEFAULT_DEPARTMENTS, DEFAULT_ROLES, DEFAULT_HR_LIST } from '../lib/constants'

const AppCtx = createContext(null)
const backend = isApiConfigured() ? api : localStore
export const usingLocalFallback = !isApiConfigured()

const COMPANY_KEY = 'sridhi-hr:company-name'
const CACHE_KEY   = 'sridhi-hr:cache-v2'
const CACHE_TTL   = 5 * 60 * 1000 // 5 minutes

const readCompanyName = () => {
  try { return localStorage.getItem(COMPANY_KEY) || 'Sridhi HR' } catch { return 'Sridhi HR' }
}

// ── Local cache helpers ──────────────────────────────────────────────────
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null  // expired
    return data
  } catch { return null }
}

function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })) } catch {}
}

function invalidateCache() {
  try { localStorage.removeItem(CACHE_KEY) } catch {}
}

let toastId = 0

export function AppProvider({ children }) {
  const [candidates,  setCandidates]  = useState([])
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS)
  const [roles,       setRoles]       = useState(DEFAULT_ROLES)
  const [hrList,      setHrList]      = useState(DEFAULT_HR_LIST)
  const [followups,   setFollowups]   = useState([])
  const [callLogs,    setCallLogs]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [toasts,      setToasts]      = useState([])
  const [companyName, setCompanyNameState] = useState(readCompanyName)
  const refreshTimer = useRef(null)

  const pushToast = useCallback((message, tone = 'default') => {
    const id = ++toastId
    setToasts(t => [...t, { id, message, tone }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])

  const sanitizeCandidate = (c) => ({
    ...c,
    name:         String(c.name        || ''),
    phone:        String(c.phone       || ''),
    department:   String(c.department  || ''),
    role:         String(c.role        || ''),
    stage:        String(c.stage       || 'applied'),
    source:       String(c.source      || ''),
    assignedTo:   String(c.assignedTo  || ''),
    notes:        String(c.notes       || ''),
    nextFollowUp: c.nextFollowUp instanceof Date ? c.nextFollowUp.toISOString().slice(0,10) : (c.nextFollowUp ? String(c.nextFollowUp) : null),
    createdAt:    String(c.createdAt   || ''),
    updatedAt:    String(c.updatedAt   || ''),
  })

  const applyData = useCallback((data) => {
    setCandidates((data.candidates || []).map(sanitizeCandidate))
    setDepartments(data.departments?.length ? data.departments : DEFAULT_DEPARTMENTS)
    setRoles(data.roles?.length     ? data.roles              : DEFAULT_ROLES)
    setHrList(data.hrList?.length   ? data.hrList             : DEFAULT_HR_LIST)
    setFollowups(data.followups     || [])
    setCallLogs(data.callLogs       || [])
    if (data.companyName) {
      setCompanyNameState(data.companyName)
      try { localStorage.setItem(COMPANY_KEY, data.companyName) } catch {}
    }
  }, [])

  // Full load — tries cache first for instant display, then background-refreshes
  const load = useCallback(async (force = false) => {
    setError(null)

    // 1. Show cached data immediately (no spinner) if cache is fresh
    if (!force) {
      const cached = readCache()
      if (cached) {
        applyData(cached)
        setLoading(false)
        // Background refresh without showing loading state
        backend.fetchAll()
          .then(data => { applyData(data); writeCache(data) })
          .catch(() => {}) // silent fail — user already has cached data
        return
      }
    }

    // 2. No cache or forced — show spinner and fetch
    setLoading(true)
    try {
      const data = await backend.fetchAll()
      applyData(data)
      writeCache(data)
    } catch (e) { setError(e.message || 'Could not load data') }
    finally { setLoading(false) }
  }, [applyData])

  useEffect(() => {
    load()
    // Auto-refresh every 5 minutes in the background
    refreshTimer.current = setInterval(() => {
      backend.fetchAll()
        .then(data => { applyData(data); writeCache(data) })
        .catch(() => {})
    }, CACHE_TTL)
    return () => clearInterval(refreshTimer.current)
  }, [load, applyData])

  const addCandidate = useCallback(async (candidate) => {
    const res = await backend.addCandidate(candidate)
    const created = sanitizeCandidate(res.candidate || { ...candidate, id: res.id })
    setCandidates(cs => [created, ...cs])
    invalidateCache()
    pushToast(`${candidate.name} added to the pipeline`, 'success')
    return created
  }, [pushToast])

  const updateCandidate = useCallback(async (id, fields) => {
    // Optimistic update — immediately reflect in UI
    setCandidates(cs => cs.map(c => String(c.id) === String(id) ? { ...c, ...fields } : c))
    try {
      await backend.updateCandidate(id, fields)
      invalidateCache()
    }
    catch (e) {
      // Rollback on failure
      pushToast(e.message || 'Could not save change', 'error')
      load(true)
    }
  }, [pushToast, load])

  // FIXED: moveStage — only moves the EXACT candidate by id, no mass-update
  const moveStage = useCallback(async (id, stage) => {
    const todayStr = new Date().toISOString().slice(0, 10)
    // Optimistic: update ONLY the candidate with matching id
    setCandidates(cs =>
      cs.map(c => String(c.id) === String(id) ? { ...c, stage, updatedAt: todayStr } : c)
    )
    try {
      await backend.updateCandidate(id, { stage })
      invalidateCache()
    }
    catch (e) {
      // Rollback: reload fresh data from server
      pushToast(e.message || 'Could not move candidate', 'error')
      load(true)
    }
  }, [pushToast, load])

  const deleteCandidate = useCallback(async (id) => {
    setCandidates(cs => cs.filter(c => c.id !== id))
    setCallLogs(ls => ls.filter(l => l.candidateId !== id))
    setFollowups(fs => fs.filter(f => f.candidateId !== id))
    try { await backend.deleteCandidate(id); invalidateCache(); pushToast('Candidate removed') }
    catch (e) { pushToast(e.message || 'Could not remove', 'error') }
  }, [pushToast])

  const addFollowUp = useCallback(async (candidateId, entry) => {
    try {
      const res = await backend.addFollowUp(candidateId, entry)
      const row = res.entry || { id: Date.now(), candidateId, date: new Date().toISOString().slice(0,10), ...entry }
      setFollowups(f => [row, ...f])
      setCandidates(cs => cs.map(c => c.id === candidateId
        ? { ...c, notes: entry.note || c.notes, nextFollowUp: entry.nextFollowUp ?? c.nextFollowUp }
        : c))
      invalidateCache()
      pushToast('Follow-up logged', 'success')
    } catch (e) { pushToast(e.message || 'Could not log follow-up', 'error') }
  }, [pushToast])

  const addCallLog = useCallback(async (candidateId, entry) => {
    try {
      const res = await backend.addCallLog(candidateId, entry)
      const row = res.callLog || { id: Date.now(), candidateId, date: new Date().toISOString().slice(0,10), ...entry }
      setCallLogs(ls => [row, ...ls])
      invalidateCache()
      pushToast('Call logged', 'success')
      return row
    } catch (e) { pushToast(e.message || 'Could not log call', 'error') }
  }, [pushToast])

  const addDepartment = useCallback(async (label) => {
    const key = label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    setDepartments(d => [...d, { key, label: label.trim() }])
    try { await backend.addDepartment(label); invalidateCache(); pushToast(`${label} pipeline created`, 'success') }
    catch (e) { pushToast(e.message || 'Could not create pipeline', 'error') }
  }, [pushToast])

  const deleteDepartment = useCallback(async (key) => {
    setDepartments(d => d.filter(x => x.key !== key))
    setRoles(r => r.filter(x => x.department !== key))
    try { await backend.deleteDepartment(key); invalidateCache() }
    catch (e) { pushToast(e.message || 'Could not remove pipeline', 'error') }
  }, [pushToast])

  const addRole = useCallback(async (department, label) => {
    const tempId = `role_temp_${Date.now()}`
    setRoles(r => [...r, { id: tempId, department, label: label.trim() }])
    try {
      const res = await backend.addRole(department, label)
      if (res.role) setRoles(r => r.map(x => x.id === tempId ? res.role : x))
      invalidateCache()
      pushToast(`${label.trim()} added`, 'success')
    } catch (e) {
      setRoles(r => r.filter(x => x.id !== tempId))
      pushToast(e.message || 'Could not add role', 'error')
    }
  }, [pushToast])

  const deleteRole = useCallback(async (id) => {
    setRoles(r => r.filter(x => x.id !== id))
    try { await backend.deleteRole(id); invalidateCache() }
    catch (e) { pushToast(e.message || 'Could not remove role', 'error') }
  }, [pushToast])

  const addHR = useCallback(async (name) => {
    if (hrList.includes(name.trim())) { pushToast('HR already in team', 'error'); return }
    setHrList(h => [...h, name.trim()])
    try { await backend.addHR(name.trim()); invalidateCache(); pushToast(`${name.trim()} added to HR team`, 'success') }
    catch (e) { pushToast(e.message || 'Could not add HR', 'error') }
  }, [hrList, pushToast])

  const removeHR = useCallback(async (name) => {
    setHrList(h => h.filter(x => x !== name))
    try { await backend.removeHR(name); invalidateCache() }
    catch (e) { pushToast(e.message || 'Could not remove HR', 'error') }
  }, [pushToast])

  const setCompanyName = useCallback((name) => {
    const trimmed = (name || '').trim() || 'Sridhi HR'
    setCompanyNameState(trimmed)
    try { localStorage.setItem(COMPANY_KEY, trimmed) } catch {}
    backend.updateCompanyName?.(trimmed)
  }, [])

  const value = {
    candidates, departments, roles, hrList, followups, callLogs,
    loading, error, usingLocalFallback,
    toasts, pushToast, reload: () => load(true),
    companyName, setCompanyName,
    addCandidate, updateCandidate, moveStage, deleteCandidate,
    addFollowUp, addCallLog,
    addDepartment, deleteDepartment, addRole, deleteRole,
    addHR, removeHR,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
