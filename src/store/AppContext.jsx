import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api, isApiConfigured } from '../lib/api'
import { localStore } from '../lib/localStore'
import { DEFAULT_DEPARTMENTS, DEFAULT_ROLES, DEFAULT_HR_LIST } from '../lib/constants'

const AppCtx = createContext(null)
const backend = isApiConfigured() ? api : localStore
export const usingLocalFallback = !isApiConfigured()

const COMPANY_KEY = 'sridhi-hr:company-name'
const readCompanyName = () => {
  try { return localStorage.getItem(COMPANY_KEY) || 'Sridhi HR' } catch { return 'Sridhi HR' }
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

  const pushToast = useCallback((message, tone = 'default') => {
    const id = ++toastId
    setToasts(t => [...t, { id, message, tone }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await backend.fetchAll()
      setCandidates(data.candidates   || [])
      setDepartments(data.departments?.length ? data.departments : DEFAULT_DEPARTMENTS)
      setRoles(data.roles?.length     ? data.roles              : DEFAULT_ROLES)
      setHrList(data.hrList?.length   ? data.hrList             : DEFAULT_HR_LIST)
      setFollowups(data.followups     || [])
      setCallLogs(data.callLogs       || [])
      if (data.companyName) {
        setCompanyNameState(data.companyName)
        try { localStorage.setItem(COMPANY_KEY, data.companyName) } catch {}
      }
    } catch (e) { setError(e.message || 'Could not load data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const addCandidate = useCallback(async (candidate) => {
    const res = await backend.addCandidate(candidate)
    const created = res.candidate || { ...candidate, id: res.id }
    setCandidates(cs => [created, ...cs])
    pushToast(`${candidate.name} added to the pipeline`, 'success')
    return created
  }, [pushToast])

  const updateCandidate = useCallback(async (id, fields) => {
    setCandidates(cs => cs.map(c => c.id === id ? { ...c, ...fields } : c))
    try { await backend.updateCandidate(id, fields) }
    catch (e) { pushToast(e.message || 'Could not save change', 'error') }
  }, [pushToast])

  const moveStage = useCallback(async (id, stage) => {
    setCandidates(cs => cs.map(c => c.id === id ? { ...c, stage, updatedAt: new Date().toISOString().slice(0,10) } : c))
    try { await backend.updateCandidate(id, { stage }) }
    catch (e) { pushToast(e.message || 'Could not move candidate', 'error') }
  }, [pushToast])

  const deleteCandidate = useCallback(async (id) => {
    setCandidates(cs => cs.filter(c => c.id !== id))
    setCallLogs(ls => ls.filter(l => l.candidateId !== id))
    setFollowups(fs => fs.filter(f => f.candidateId !== id))
    try { await backend.deleteCandidate(id); pushToast('Candidate removed') }
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
      pushToast('Follow-up logged', 'success')
    } catch (e) { pushToast(e.message || 'Could not log follow-up', 'error') }
  }, [pushToast])

  const addCallLog = useCallback(async (candidateId, entry) => {
    try {
      const res = await backend.addCallLog(candidateId, entry)
      const row = res.callLog || { id: Date.now(), candidateId, date: new Date().toISOString().slice(0,10), ...entry }
      setCallLogs(ls => [row, ...ls])
      pushToast('Call logged', 'success')
      return row
    } catch (e) { pushToast(e.message || 'Could not log call', 'error') }
  }, [pushToast])

  const addDepartment = useCallback(async (label) => {
    const key = label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    setDepartments(d => [...d, { key, label: label.trim() }])
    try { await backend.addDepartment(label); pushToast(`${label} pipeline created`, 'success') }
    catch (e) { pushToast(e.message || 'Could not create pipeline', 'error') }
  }, [pushToast])

  const deleteDepartment = useCallback(async (key) => {
    setDepartments(d => d.filter(x => x.key !== key))
    setRoles(r => r.filter(x => x.department !== key))
    try { await backend.deleteDepartment(key) }
    catch (e) { pushToast(e.message || 'Could not remove pipeline', 'error') }
  }, [pushToast])

  const addRole = useCallback(async (department, label) => {
    const tempId = `role_temp_${Date.now()}`
    setRoles(r => [...r, { id: tempId, department, label: label.trim() }])
    try {
      const res = await backend.addRole(department, label)
      if (res.role) setRoles(r => r.map(x => x.id === tempId ? res.role : x))
      pushToast(`${label.trim()} added`, 'success')
    } catch (e) {
      setRoles(r => r.filter(x => x.id !== tempId))
      pushToast(e.message || 'Could not add role', 'error')
    }
  }, [pushToast])

  const deleteRole = useCallback(async (id) => {
    setRoles(r => r.filter(x => x.id !== id))
    try { await backend.deleteRole(id) }
    catch (e) { pushToast(e.message || 'Could not remove role', 'error') }
  }, [pushToast])

  const addHR = useCallback(async (name) => {
    if (hrList.includes(name.trim())) { pushToast('HR already in team', 'error'); return }
    setHrList(h => [...h, name.trim()])
    try { await backend.addHR(name.trim()); pushToast(`${name.trim()} added to HR team`, 'success') }
    catch (e) { pushToast(e.message || 'Could not add HR', 'error') }
  }, [hrList, pushToast])

  const removeHR = useCallback(async (name) => {
    setHrList(h => h.filter(x => x !== name))
    try { await backend.removeHR(name) }
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
    toasts, pushToast, reload: load,
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