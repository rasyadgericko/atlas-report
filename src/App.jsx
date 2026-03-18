import { Routes, Route } from 'react-router-dom'
import AtlasReport from './AtlasReport'
import ArticleDetailPage from './ArticleDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AtlasReport />} />
      <Route path="/article/:id" element={<ArticleDetailPage />} />
    </Routes>
  )
}

export default App
