// All data lives in a Google Sheet via a Google Apps Script Web App.
// Set VITE_API_URL in your .env or Netlify/Vercel env vars to the deployed
// Web App URL, e.g.:
//   VITE_API_URL=https://script.google.com/macros/s/AKfycb.../exec

const API_URL = import.meta.env.VITE_API_URL || ''

class ApiError extends Error {}

const ensureConfigured = () => {
  if (!API_URL) throw new ApiError('No spreadsheet connected. Set VITE_API_URL.')
}

async function get(action, params = {}) {
  ensureConfigured()
  const qs = new URLSearchParams({ action, ...params }).toString()
  const res = await fetch(`${API_URL}?${qs}`)
  if (!res.ok) throw new ApiError(`Request failed (${res.status})`)
  const json = await res.json()
  if (json.ok === false) throw new ApiError(json.error || 'Something went wrong')
  return json
}

async function post(action, payload = {}) {
  ensureConfigured()
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  })
  if (!res.ok) throw new ApiError(`Request failed (${res.status})`)
  const json = await res.json()
  if (json.ok === false) throw new ApiError(json.error || 'Something went wrong')
  return json
}

export const isApiConfigured = () => Boolean(API_URL)

export const api = {
  fetchAll:          ()                    => get('list'),
  addCandidate:      (candidate)           => post('addCandidate',    { candidate }),
  updateCandidate:   (id, fields)          => post('updateCandidate', { id, fields }),
  deleteCandidate:   (id)                  => post('deleteCandidate', { id }),
  addFollowUp:       (candidateId, entry)  => post('addFollowUp',     { candidateId, entry }),
  addCallLog:        (candidateId, entry)  => post('addCallLog',      { candidateId, entry }),
  addDepartment:     (label)               => post('addDepartment',   { label }),
  deleteDepartment:  (key)                 => post('deleteDepartment',{ key }),
  addRole:           (department, label)   => post('addRole',         { department, label }),
  deleteRole:        (id)                  => post('deleteRole',      { id }),
  addHR:             (name)                => post('addHR',           { name }),
  removeHR:          (name)                => post('removeHR',        { name }),
  updateCompanyName: (name)                => post('updateCompanyName',{ name }),
}

export { ApiError }
