import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import { UiProvider } from './store/UiContext'
import { Sidebar, BottomNav, Fab } from './components/Shell'
import ToastStack from './components/ToastStack'
import InstallBanner from './components/InstallPrompt'
import CandidateFormModal from './components/CandidateFormModal'
import CandidateDrawer from './components/CandidateDrawer'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/Pipeline'
import FollowUps from './pages/FollowUps'
import AllCandidates from './pages/AllCandidates'
import Performance from './pages/Performance'
import Sources from './pages/Sources'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AppProvider>
      <UiProvider>
        <BrowserRouter>
          <div className="flex min-h-screen bg-paper">
            <Sidebar />
            <main className="min-w-0 flex-1">
              <Routes>
                <Route path="/"            element={<Dashboard />} />
                <Route path="/pipeline"    element={<Pipeline />} />
                <Route path="/followups"   element={<FollowUps />} />
                <Route path="/candidates"  element={<AllCandidates />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/sources"     element={<Sources />} />
                <Route path="/settings"    element={<Settings />} />
              </Routes>
            </main>
          </div>
          <BottomNav />
          <Fab />
          <InstallBanner />
          <ToastStack />
          <CandidateFormModal />
          <CandidateDrawer />
        </BrowserRouter>
      </UiProvider>
    </AppProvider>
  )
}
