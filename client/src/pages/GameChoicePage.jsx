import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

function GameChoicePage() {
  const navigate = useNavigate();
  const { currentLevel } = useGame();
  const [showNote, setShowNote] = useState(false);

  if (currentLevel < 2) {
    navigate('/');
    return null;
  }

  return (
    <div className="container" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="cyber-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 className="cyber-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Login Successful
        </h1>

        <p className="cyber-subtitle" style={{ marginBottom: '1.5rem' }}>
          You have to build a game by following the video guide. The game should be in between the login page and the next puzzle.
        </p>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Because there is waiting time, use that time to build the game shown in the video.
          When you are ready, click Continue and complete the next tasks.
        </p>

        <div className="cyber-card" style={{ margin: 0 }}>
          <h3 style={{ color: 'var(--color-delete)', marginBottom: '0.75rem' }}>What To Do Now</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            1. Open the <a href="https://drive.google.com/file/d/1usQjNgeYyrcHhCHK4MkhMdsyAKGZAeQL/view?usp=drive_link" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-pink)', textDecoration: 'underline' }}>video guide</a>.
          </p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            2. Build the same game while the system is in waiting mode.
          </p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            3. Click Continue to proceed to further tasks.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="cyber-btn"
              onClick={() => navigate('/loading')}
            >
              Continue
            </button>
            <button
              className="cyber-btn cyber-btn--pink"
              onClick={() => setShowNote((prev) => !prev)}
            >
              {showNote ? 'Hide Note' : 'Show Note'}
            </button>
          </div>

          {showNote && (
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
              You can continue immediately if you prefer and finish the build later.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameChoicePage;