import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Confetti from '../components/Confetti';

function CompletionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, discoveredBugs } = useGame();
  const [actionStatus, setActionStatus] = useState('');
  
  const totalTime = location.state?.totalTime || 0;
  
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const buildSummaryText = () => {
    return [
      `Player: ${user?.displayName || 'Hacker'}`,
      `Completion Time: ${formatTime(totalTime)}`,
      `Bugs Discovered: ${discoveredBugs.length}`,
    ].join('\n');
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText());
      setActionStatus('Summary copied to clipboard.');
    } catch {
      setActionStatus('Clipboard permission unavailable.');
    }
  };

  const exportSummary = () => {
    const blob = new Blob([buildSummaryText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `debugquest-summary-${Date.now()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setActionStatus('Summary file downloaded.');
  };
  
  return (
    <div className="container" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}>
      <Confetti />
      
      <h1 className="cyber-title glitch" data-text="VICTORY!" style={{ fontSize: '3rem' }}>
        VICTORY!
      </h1>
      
      <p className="cyber-subtitle" style={{ marginBottom: '2rem' }}>
        You've conquered DebugQuest, {user?.displayName || 'Hacker'}!
      </p>
      
      <div className="cyber-card" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 style={{ 
          color: 'var(--color-delete)', 
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
        }}>
          Your Stats
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              COMPLETION TIME
            </p>
            <p style={{ 
              fontSize: '2rem', 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-delete)',
            }}>
              {formatTime(totalTime)}
            </p>
          </div>
          
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              BUGS DISCOVERED
            </p>
            <p style={{ 
              fontSize: '2rem', 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-broken)',
            }}>
              {discoveredBugs.length}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="cyber-btn cyber-btn--pink"
            onClick={() => {
              localStorage.removeItem('debugquest_user');
              navigate('/');
            }}
          >
            Play Again
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button className="cyber-btn" onClick={copySummary}>Copy Summary</button>
          <button className="cyber-btn cyber-btn--pink" onClick={exportSummary}>Export Stats</button>
        </div>

        {actionStatus && (
          <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {actionStatus}
          </p>
        )}
      </div>
      
      {/* Progress dots */}
      <div className="progress-dots" style={{ marginTop: '2rem' }}>
        <div className="progress-dot completed"></div>
        <div className="progress-dot completed"></div>
        <div className="progress-dot completed"></div>
        <div className="progress-dot completed"></div>
        <div className="progress-dot completed"></div>
      </div>
    </div>
  );
}

export default CompletionPage;
