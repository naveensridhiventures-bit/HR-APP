import { createContext, useContext, useMemo, useState } from 'react'

const UiCtx = createContext(null)

export function UiProvider({ children }) {
  const [openCandidateId, setOpenCandidateId] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalDept, setAddModalDept] = useState(null)

  const value = useMemo(() => ({
    openCandidateId,
    openCandidate: (id) => setOpenCandidateId(id),
    closeCandidate: () => setOpenCandidateId(null),
    addModalOpen,
    addModalDept,
    openAddModal: (dept = null) => { setAddModalDept(dept); setAddModalOpen(true) },
    closeAddModal: () => setAddModalOpen(false)
  }), [openCandidateId, addModalOpen, addModalDept])

  return <UiCtx.Provider value={value}>{children}</UiCtx.Provider>
}

export const useUi = () => {
  const ctx = useContext(UiCtx)
  if (!ctx) throw new Error('useUi must be used within UiProvider')
  return ctx
}
