import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import CandidateCard from './CandidateCard'
import { EmptyState } from './ui/Primitives'
import { STAGES } from '../lib/constants'
import { useApp } from '../store/AppContext'
import { useUi } from '../store/UiContext'
import { Users } from 'lucide-react'
import { useRef } from 'react'

export default function PipelineBoard({ department }) {
  const { candidates, departments, moveStage } = useApp()
  const { openAddModal } = useUi()
  // Track dragging state to prevent re-renders mid-drag collapsing columns
  const draggingRef = useRef(false)

  const inDept = candidates.filter((c) => c.department === department)

  if (inDept.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No candidates here yet"
        subtitle="Add your first applicant to this pipeline to start tracking follow-ups."
        action={
          <button
            onClick={() => openAddModal(department)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={15} /> Add candidate
          </button>
        }
      />
    )
  }

  const onDragStart = () => {
    draggingRef.current = true
  }

  const onDragEnd = (result) => {
    draggingRef.current = false
    const { destination, draggableId, source } = result
    if (!destination) return
    // Only update if actually moved to a different stage
    if (destination.droppableId === source.droppableId) return
    const stage = destination.droppableId
    moveStage(draggableId, stage)
  }

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 pt-3">
        {STAGES.map((stage) => {
          // Stable sort by createdAt so indices never shift unexpectedly
          const items = inDept
            .filter((c) => c.stage === stage.key)
            .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '') || a.id.localeCompare(b.id))

          return (
            <Droppable droppableId={stage.key} key={stage.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex w-64 shrink-0 flex-col rounded-xl2 border bg-paper-dim/60 p-2.5 transition-colors ${
                    snapshot.isDraggingOver ? 'border-saffron bg-saffron-50/40' : 'border-ink-100'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
                      <span className="text-xs font-bold uppercase tracking-wide text-ink-600">{stage.label}</span>
                    </div>
                    <span className="font-mono-data text-[11px] text-slate">{items.length}</span>
                  </div>
                  <div className="flex min-h-[60px] flex-col gap-2">
                    {items.map((c, idx) => (
                      <Draggable
                        draggableId={c.id}
                        index={idx}
                        key={c.id}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <CandidateCard
                            candidate={c}
                            departments={departments}
                            innerRef={dragProvided.innerRef}
                            draggableProps={dragProvided.draggableProps}
                            dragHandleProps={dragProvided.dragHandleProps}
                            dragging={dragSnapshot.isDragging}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          )
        })}
      </div>
    </DragDropContext>
  )
}
