import { BrowserRouter, Routes, Route } from 'react-router-dom'

import FixturesPage from './pages/FixturesPage'
import ShiftPage from './pages/ShiftPage'
import GamePage from './pages/GamePage'

import Header from './components/Header'
import ShiftBuilderPage from './pages/ShiftBuilderPage'
import HistoryPage from './pages/HistoryPage'
import { ShiftCartProvider } from './context/ShiftCartContext'

function App() {
  return (
    <BrowserRouter>
      <ShiftCartProvider>
        <Header />
        <Routes>
          <Route path="/" element={<ShiftBuilderPage />} />
          <Route path="/shift-builder" element={<ShiftBuilderPage />} />
          <Route path="/shift" element={<ShiftPage />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/fixtures" element={<FixturesPage />} />
        </Routes>
      </ShiftCartProvider>
    </BrowserRouter>
  );
}

export default App;
