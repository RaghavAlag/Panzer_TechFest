import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import LoginPage from './pages/LoginPage';
import GameChoicePage from './pages/GameChoicePage';
import LoadingPage from './pages/LoadingPage';
import DashboardPage from './pages/DashboardPage';
import FeedbackFinalPage from './pages/FeedbackFinalPage';
import CompletionPage from './pages/CompletionPage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/game-choice" element={<GameChoicePage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/feedback-final" element={<FeedbackFinalPage />} />
          <Route path="/complete" element={<CompletionPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
