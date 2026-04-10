import { BrowserRouter, Routes, Route } from 'react-router-dom'

import FixturesPage from './pages/FixturesPage'
import ShiftPage from './pages/ShiftPage'
import GamePage from './pages/GamePage'

import Header from './components/Header'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<FixturesPage />} />
        <Route path="/shift" element={<ShiftPage />} />
        <Route path="/game/:id" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
