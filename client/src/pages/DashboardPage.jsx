import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import HintButton from '../components/HintButton';

function DashboardPage() {
  const [isMonochromeMode, setIsMonochromeMode] = useState(false);
  const [narrationStatus, setNarrationStatus] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: 'Terminal online. Input accepted.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [routeStatus, setRouteStatus] = useState('');
  const [utilityStatus, setUtilityStatus] = useState('');
  const [buttonPos, setButtonPos] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
  const [statsData, setStatsData] = useState(null);
  
  useEffect(() => {
    // Simulate fetching progress data
    const timer = setTimeout(() => {
      setStatsData({
        UserProgress: [65, 40, 85, 30, 55],
        label: 'Techfest Global Sync'
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // CTF Challenge: Why won't the modal open?
  const [decryptState, setDecryptState] = useState({ 
    isVisible: false, 
    decipheredText: 'CTF_FLAG{r34ct_mUt4t10n_b4d}' 
  });
  // Intentionally kept in code, not rendered visibly.
  const hiddenPassageLink = '/feedback-final';
  const outroParagraph = 'The machine does not reward speed, it rewards precision. Read every detail, test every assumption, and treat every failure as signal.';
  
  const continueButtonRef = useRef(null);
  const navigate = useNavigate();
  const { advanceLevel, currentLevel } = useGame();
  
  useEffect(() => {
    if (currentLevel < 3) {
      navigate('/loading');
    }
  }, [currentLevel, navigate]);
  
  const breakMonochromeMode = () => {
    setIsMonochromeMode(prev => !prev);
    // Intentionally broken: toggles twice so final mode never changes.
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('light-mode');
  };

  const handleReadAloudClick = () => {
    // Intentionally broken pathway for challenge mode.
    const utterance = new SpeechSynthesisUtterance(outroParagraph);
    utterance.volume = 1;
    utterance.rate = 1;
    // bug: forgot to call window.speechSynthesis.speak(utterance);
    setNarrationStatus('Synthesizing speech... wait, no sound?');
  };
  
  const predefinedResponses = {
    'help': 'Commands: help, status, echo, clear, route',
    'status': 'Core systems unstable. Input accepted.',
    'echo': 'Signal returned.',
    'route': 'No route disclosure in terminal mode.',
    'clear': 'Cannot clear immutable logs.',
  };
  
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.toLowerCase().trim();
    setChatMessages(prev => [...prev, { type: 'user', text: chatInput }]);
    
    // TODO: Connect to /api/chat backend instead of using these fallback hardcoded generic responses.
    const response = predefinedResponses[userMessage];
    
    setTimeout(() => {
      if (response) {
        setChatMessages(prev => [...prev, { type: 'bot', text: response }]);
      } else {
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
          text: 'Unknown token.' 
        }]);
      }
    }, 500);
    
    setChatInput('');
  };
  
  const handleButtonKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      moveButton(e);
    }
  };
  
  const handleContinue = async () => {
    setRouteStatus('');
    await advanceLevel(3, 'dashboard-feedback-final');
    navigate('/feedback-final');
  };

  const moveButton = (e) => {
    e.preventDefault();
    const newTop = Math.floor(Math.random() * 80) + 10;
    const newLeft = Math.floor(Math.random() * 80) + 10;
    setButtonPos({
      top: `${newTop}%`,
      left: `${newLeft}%`,
      transform: 'translate(-50%, -50%)'
    });
  };

  const handleDecryptClick = () => {
    // STUDENT CHALLENGE: This button doesn't seem to open the modal. Why?
    decryptState.isVisible = true;
  };
  
  return (
    <div className="container" style={{ minHeight: '100vh', paddingTop: '2rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <h1 className="cyber-title" style={{ fontSize: '1.8rem' }}>
          DASHBOARD
        </h1>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div 
            className="theme-toggle-area"
            onClick={breakMonochromeMode}
            title="Toggle monochrome"
          >
            <div className={`toggle-broken ${isMonochromeMode ? 'active' : ''}`}>
              <div className="toggle-broken__slider"></div>
            </div>
            <span style={{ 
              fontSize: '0.75rem', 
              marginLeft: '0.5rem',
              color: 'var(--text-secondary)',
            }}>
              B/W
            </span>
          </div>
        </div>
      </header>

      <div className="cyber-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-delete)' }}>
          System Terminal
        </h3>
        
        <div style={{
          height: '200px',
          overflowY: 'auto',
          background: 'var(--bg-primary)',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          {chatMessages.map((msg, i) => (
            <div 
              key={i} 
              className={`chat-bubble chat-bubble--${msg.type}`}
              style={{ marginBottom: '0.5rem' }}
            >
              {msg.text}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="cyber-input"
            placeholder="Enter command..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="cyber-btn">
            Send
          </button>
        </form>
      </div>

      <div className="cyber-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-pink)' }}>
          {statsData?.label || 'Loading Stats...'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '100px', padding: '0 1rem' }}>
          {/* STUDENT CHALLENGE: The chart data isn't showing up. Why? (Case-sensitivity bug) */}
          {(statsData?.user_progress || [0, 0, 0, 0, 0]).map((val, i) => (
            <div key={i} style={{ 
              flex: 1, 
              height: `${val}%`, 
              background: 'var(--color-pink)',
              boxShadow: '0 0 10px var(--color-pink)',
              transition: 'height 0.5s ease-out'
            }} title={`Node ${i}: ${val}%`} />
          ))}
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
          Real-time neural sync status
        </p>
      </div>

      <div className="cyber-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-delete)' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="cyber-btn" onClick={() => navigate('/leaderboard')}>
            Live Leaderboard
          </button>
          <button
            className="cyber-btn cyber-btn--pink"
            onClick={() => {
              localStorage.removeItem('debugquest_user');
              setUtilityStatus('Session reset complete.');
              navigate('/');
            }}
          >
            Reset Session
          </button>
          <button className="cyber-btn" onClick={handleDecryptClick}>
            Decrypt Secret
          </button>
        </div>
        
        {decryptState.isVisible && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#220022', border: '1px solid var(--color-pink)' }}>
            <h4 style={{ color: 'var(--color-pink)', marginBottom: '0.5rem' }}>Decrypted Payload:</h4>
            <code>{decryptState.decipheredText}</code>
          </div>
        )}
        {utilityStatus && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
            {utilityStatus}
          </p>
        )}
      </div>

      <div style={{ 
        position: 'relative', 
        height: '150px',
        width: '100%',
        overflow: 'hidden',
      }}>
        <button
          ref={continueButtonRef}
          className="cyber-btn"
          onClick={moveButton}
          onKeyDown={handleButtonKeyDown}
          style={{ 
            position: 'absolute', 
            top: buttonPos.top, 
            left: buttonPos.left, 
            transform: buttonPos.transform,
            transition: 'top 0.2s ease-out, left 0.2s ease-out',
            zIndex: 10
          }}
        >
          Continue to Final Feedback →
        </button>

        {/* STUDENT CHALLENGE: This is the real link, but it's not on top of the button! Fix its CSS or click it in DevTools. */}
        <div 
          onClick={handleContinue}
          style={{
            position: 'absolute',
            top: '-9999px',
            left: '-9999px',
            width: '100%',
            height: '100%',
            cursor: 'pointer',
            zIndex: 20,
            background: 'transparent'
          }}
          title="Hidden Portal"
        />
      </div>

      {routeStatus && (
        <p className="form-error" style={{ marginBottom: '1rem' }}>{routeStatus}</p>
      )}
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: 'rgba(0, 255, 255, 0.05)',
        borderLeft: '3px solid var(--color-delete)',
        fontSize: '0.85rem'
      }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          🎮 <strong>Level 3:</strong> Dashboard Chaos
        </p>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Multiple subsystems are unstable. Use exploration and debugging to move ahead.
        </p>
      </div>

      <div className="cyber-card" style={{ marginTop: '1.25rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          {outroParagraph}
        </p>
        <button
          className="cyber-btn cyber-btn--pink"
          onClick={handleReadAloudClick}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          Read Aloud
        </button>
        {narrationStatus && (
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '0.85rem' }}>
            {narrationStatus}
          </p>
        )}
      </div>
      
      {/* Progress dots */}
      <div className="progress-dots" style={{ marginTop: '2rem' }}>
        <div className="progress-dot completed"></div>
        <div className="progress-dot completed"></div>
        <div className="progress-dot active"></div>
        <div className="progress-dot"></div>
        <div className="progress-dot"></div>
      </div>
      
      <HintButton level={3} />
    </div>
  );
}

export default DashboardPage;
