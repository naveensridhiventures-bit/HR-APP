import { createContext, useCallback, useContext, useState } from 'react'

const UiCtx = createContext(null)

export function UiProvider({ children }) {
  const [openCandidateId, setOpenCandidateId] = useState(null)
  const [addModalOpen, setAddModalOpen]       = useState(false)
  const [addModalDept, setAddModalDept]       = useState(null)

  const openCandidate  = useCallback((id)         => setOpenCandidateId(id),   [])
  const closeCandidate = useCallback(()           => setOpenCandidateId(null), [])
  const openAddModal   = useCallback((dept = null) => { setAddModalDept(dept); setAddModalOpen(true) }, [])
  const closeAddModal  = useCallback(()           => setAddModalOpen(false),   [])

  return (
    <UiCtx.Provider value={{ openCandidateId, openCandidate, closeCandidate, addModalOpen, addModalDept, openAddModal, closeAddModal }}>
      {children}
    </UiCtx.Provider>
  )
}

export const useUi = () => {
  const ctx = useContext(UiCtx)
  if (!ctx) throw new Error('useUi must be used within UiProvider')
  return ctx
}