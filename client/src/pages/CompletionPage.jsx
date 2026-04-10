import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Confetti from '../components/Confetti';

function CompletionPage() {
  const navigate = useNavigate();
  const { user, leaderboard, hintsRemaining } = useGame();
  const [rank, setRank] = useState(null);
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    // Find user's rank
    const userRank = leaderboard.findIndex(
      entry => entry.visitorId === user?.visitorId
    );
    if (userRank !== -1) {
      setRank(userRank + 1);
    }
  }, [leaderboard, user]);
  
  const getRankEmoji = (r) => {
    if (r === 1) return '🥇';
    if (r === 2) return '🥈';
    if (r === 3) return '🥉';
    return '🏅';
  };

  const buildSummaryText = () => {
    const rankText = rank ? `${getRankEmoji(rank)} #${rank}` : 'Unranked';
    return [
      `Player: ${user?.displayName || 'Hacker'}`,
      `Rank: ${rankText}`,
      `Hints Remaining: ${hintsRemaining}/3`,
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
              LEADERBOARD RANK
            </p>
            <p style={{ 
              fontSize: '2rem', 
              fontFamily: 'var(--font-display)',
              color: rank && rank <= 3 ? 'gold' : 'var(--color-error)',
            }}>
              {rank ? `${getRankEmoji(rank)} #${rank}` : '...'}
            </p>
          </div>
          
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              HINTS REMAINING
            </p>
            <p style={{ 
              fontSize: '2rem', 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-warning)',
            }}>
              {hintsRemaining}/3
            </p>
          </div>
        </div>

        {rank && rank <= 3 && (
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255, 0, 255, 0.1))',
            border: '2px solid gold',
            marginBottom: '1.5rem',
          }}>
            <p style={{ fontSize: '1.2rem' }}>
              🎉 You're in the <strong>TOP 3</strong>! 🎉
            </p>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="cyber-btn"
            onClick={() => navigate('/leaderboard')}
          >
            View Leaderboard
          </button>

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
