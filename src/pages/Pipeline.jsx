import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TopBar } from '../components/Shell'
import DepartmentTabs from '../components/DepartmentTabs'
import PipelineBoard from '../components/PipelineBoard'
import ErrorBoundary from '../components/ErrorBoundary'
import { useApp } from '../store/AppContext'

export default function Pipeline() {
  const { departments, loading } = useApp()
  const [params, setParams] = useSearchParams()
  const active = params.get('dept') || departments[0]?.key

  useEffect(() => {
    if (!params.get('dept') && departments[0]) {
      setParams({ dept: departments[0].key }, { replace: true })
    }
  }, [departments, params, setParams])

  return (
    <div className="pb-24 lg:pb-10">
      <TopBar title="Pipelines" subtitle="Drag a card to move it to the next stage" />
      <div className="px-2 sm:px-6">
        <DepartmentTabs active={active} onChange={(key) => setParams({ dept: key })} />
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-slate">
            Loading…
          </div>
        ) : active ? (
          // key=active forces full remount of DragDropContext on every tab switch
          // preventing stale drag state that caused blank screen
          <ErrorBoundary key={active}>
            <PipelineBoard key={active} department={active} />
          </ErrorBoundary>
        ) : null}
      </div>
    </div>
  )
}
