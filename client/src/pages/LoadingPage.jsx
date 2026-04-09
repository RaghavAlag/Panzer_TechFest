import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const LOADING_DURATION_MS = 240000;
const PUZZLE_ANSWER = '13-21-34';

// AI resistance: Component name suggests it unloads things
function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const [skipKeySequence, setSkipKeySequence] = useState([]);
  const [canSkip, setCanSkip] = useState(false);
  const [puzzleInput, setPuzzleInput] = useState('');
  const [puzzleError, setPuzzleError] = useState('');
  
  const navigate = useNavigate();
  const { advanceLevel, setCurrentLevel } = useGame();

  const proceedToDashboard = useCallback(async (bugId) => {
    // Ensure level state is updated before route guard checks run.
    setCurrentLevel(3);
    await advanceLevel(2, bugId);
    navigate('/dashboard');
  }, [advanceLevel, navigate, setCurrentLevel]);
  
  // SECRET: Press 'S' twice quickly to skip at any time.
  const handleKeyPress = useCallback((e) => {
    if (e.key.toLowerCase() === 's') {
      setSkipKeySequence(prev => {
        const newSeq = [...prev, Date.now()];
        // Check for double 'S' press within 500ms
        if (newSeq.length >= 2) {
          const timeDiff = newSeq[newSeq.length - 1] - newSeq[newSeq.length - 2];
          if (timeDiff < 500) {
            proceedToDashboard('loading-skip-bug');
          }
        }
        return newSeq.slice(-5); // Keep last 5 presses
      });
    }
  }, [proceedToDashboard]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
  
  useEffect(() => {
    const interval = 100;
    const increment = 100 / (LOADING_DURATION_MS / interval);
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        
        // Show hint at 50%
        if (prev < 50 && next >= 50) {
          setCanSkip(true);
        }
        
        if (next >= 100) {
          clearInterval(timer);
          proceedToDashboard('loading-complete');
          return 100;
        }
        return next;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [proceedToDashboard]);

  const handlePuzzleSubmit = (e) => {
    e.preventDefault();
    if (puzzleInput.trim().toLowerCase() === PUZZLE_ANSWER) {
      setPuzzleError('');
      proceedToDashboard('loading-puzzle-solved');
      return;
    }

    setPuzzleError('Incorrect sequence.');
  };

  const formatTime = (percent) => {
    const remaining = Math.ceil(((100 - percent) / 100) * (LOADING_DURATION_MS / 1000));
    return `${remaining}s`;
  };
  
  return (
    <div className="container" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>
        <h1 className="cyber-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          INITIALIZING SYSTEM
        </h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <div className="loading-bar" style={{ height: '8px', borderRadius: '4px' }}>
            <div 
              className="loading-bar__fill" 
              style={{ 
                width: `${progress}%`,
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '0.5rem',
            color: 'var(--text-secondary)',
          }}>
            <span>{Math.floor(progress)}%</span>
            <span>ETA: {formatTime(progress)}</span>
          </div>
        </div>
        
        {/* Loading messages */}
        <div style={{ 
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          marginBottom: '2rem',
        }}>
          {progress < 25 && 'Decrypting neural pathways...'}
          {progress >= 25 && progress < 50 && 'Syncing quantum matrices...'}
          {progress >= 50 && progress < 75 && 'Calibrating bug detectors...'}
          {progress >= 75 && 'Finalizing system breach...'}
        </div>
        
        {/* Hint area - shown at 50% */}
        {canSkip && (
          <div style={{
            padding: '1rem',
            background: 'rgba(255, 0, 255, 0.1)',
            border: '1px dashed var(--color-error)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}>
            💡 Patience is a virtue... but hackers know shortcuts.
          </div>
        )}

        <div className="cyber-card" style={{ marginTop: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Puzzle (works any time):
            Start with Fibonacci sequence. Take terms at positions 7, 8, and 9. Write them as a dash-separated code.
          </p>
          <form onSubmit={handlePuzzleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="cyber-input"
              placeholder="Example format: 00-00-00"
              value={puzzleInput}
              onChange={(e) => setPuzzleInput(e.target.value)}
              style={{ flex: 1, minWidth: '220px' }}
            />
            <button type="submit" className="cyber-btn">
              Solve & Continue
            </button>
          </form>
          {puzzleError && (
            <p className="form-error" style={{ marginTop: '0.5rem' }}>{puzzleError}</p>
          )}
        </div>
        
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'rgba(0, 255, 255, 0.05)',
          borderLeft: '3px solid var(--color-delete)',
          fontSize: '0.85rem'
        }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            🎮 <strong>Level 2:</strong> The Waiting Game
          </p>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            4 minutes is a long time. Solve the puzzle or use shortcuts to continue faster.
          </p>
        </div>
        
        {/* Progress dots */}
        <div className="progress-dots" style={{ marginTop: '2rem' }}>
          <div className="progress-dot completed"></div>
          <div className="progress-dot active"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingPage;
