import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import AtlasReport from './AtlasReport'

const ArticleDetailPage = lazy(() => import('./ArticleDetailPage'))

function App() {
  return (
    <Routes>
      <Route path="/" element={<AtlasReport />} />
      <Route path="/article/:id" element={
        <Suspense fallback={null}>
          <ArticleDetailPage />
        </Suspense>
      } />
    </Routes>
  )
}

export default App
