import { lazy, Suspense, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import AtlasReport from './AtlasReport'
import IntroScreen, { hasSeenIntro } from './IntroScreen'

const ArticleDetailPage = lazy(() => import('./ArticleDetailPage'))
const GlobeMapPage      = lazy(() => import('./GlobeMapPage'))

// Wraps route tree so key={pathname} triggers the pageIn animation on navigation
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div
      key={location.pathname}
      style={{ animation: "pageIn 0.35s ease-out both" }}
      onAnimationEnd={e => {
        e.currentTarget.style.animation = "none";
        e.currentTarget.style.opacity = "1";
      }}
    >
      <Routes location={location}>
        <Route path="/" element={<AtlasReport />} />
        <Route path="/globe" element={
          <Suspense fallback={null}>
            <GlobeMapPage />
          </Suspense>
        } />
        <Route path="/article/:id" element={
          <Suspense fallback={null}>
            <ArticleDetailPage />
          </Suspense>
        } />
      </Routes>
    </div>
  )
}

function App() {
  const [introComplete, setIntroComplete] = useState(hasSeenIntro)

  return (
    <>
      {/* Intro screen overlays everything; content loads underneath */}
      {!introComplete && (
        <IntroScreen onEnter={() => setIntroComplete(true)} />
      )}
      <AnimatedRoutes />
    </>
  )
}

export default App
