import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import LoginPage from './pages/LoginPage';
import GameChoicePage from './pages/GameChoicePage';
import LoadingPage from './pages/LoadingPage';
import DashboardPage from './pages/DashboardPage';
import FeedbackFinalPage from './pages/FeedbackFinalPage';
import CompletionPage from './pages/CompletionPage';

import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/game-choice" element={<GameChoicePage />} />
          
          {/* CTF Challenge: Why aren't these routes being protected properly?? */}
          <Route element={<ProtectedRoute requireLevel={2} />}>
            <Route path="/loading" element={<LoadingPage />} />
          </Route>
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/feedback-final" element={
            <ProtectedRoute requiredLevel="level-4">
              <FeedbackFinalPage />
            </ProtectedRoute>
          } />
          
          <Route path="/complete" element={<CompletionPage />} />

          <Route path="/not-found" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
