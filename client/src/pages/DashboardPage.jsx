import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

function DashboardPage() {
  const [isMonochromeMode, setIsMonochromeMode] = useState(false);
  const [narrationStatus, setNarrationStatus] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: '🤖 ASTRA online. How can I assist you, agent?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [routeStatus, setRouteStatus] = useState('');
  const [utilityStatus, setUtilityStatus] = useState('');
  const [buttonPos, setButtonPos] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
  const [statsData, setStatsData] = useState(null);
  const chatEndRef = useRef(null);
  
  useEffect(() => {
    // Simulate fetching progress data
    const timer = setTimeout(() => {
      setStatsData({
        UserProgress: [65, 40, 85, 30, 55],
        label: 'System Status'
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
    // document.body.classList.toggle('light-mode');
    document.body.classList.toggle('light-mode');
  };

  const handleReadAloudClick = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(outroParagraph);
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setNarrationStatus('Reading text aloud...');
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setNarrationStatus('Done.');
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setNarrationStatus('');
    };
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseClick = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setNarrationStatus('Paused.');
    }
  };

  const handleResumeClick = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setNarrationStatus('Reading text aloud...');
    }
  };
  
  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || isChatLoading) return;

    setChatMessages(prev => [...prev, { role: 'user', text }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Build history for context (exclude the greeting)
      const history = chatMessages
        .filter((_, i) => i > 0)
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: `⚠️ ${err.message}` }]);
    } finally {
      setIsChatLoading(false);
    }
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
    setDecryptState(prev => ({ ...prev, isVisible: true }));
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

      <div className="cyber-card" style={{ marginBottom: '2rem', padding: 0, overflow: 'hidden', border: '1px solid rgba(0,255,247,0.15)' }}>
        {/* Chat header */}
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'rgba(0,255,247,0.06)',
          borderBottom: '1px solid rgba(0,255,247,0.12)',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00fff7', boxShadow: '0 0 6px #00fff7', display: 'inline-block' }} />
          <span style={{ color: '#00fff7', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: 1 }}>ASTRA AI</span>
          <span style={{ color: 'rgba(0,255,247,0.4)', fontFamily: 'monospace', fontSize: '0.72rem', marginLeft: 4 }}>· Groq · llama-3.1-8b</span>
        </div>

        {/* Messages */}
        <div style={{
          height: '300px',
          overflowY: 'auto',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          background: 'rgba(0,5,15,0.6)',
        }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '78%',
                padding: '0.6rem 0.95rem',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(0,255,247,0.18), rgba(0,180,200,0.22))'
                  : 'rgba(255,255,255,0.05)',
                border: msg.role === 'user'
                  ? '1px solid rgba(0,255,247,0.3)'
                  : '1px solid rgba(255,255,255,0.08)',
                color: msg.role === 'user' ? '#e0ffff' : 'rgba(255,255,255,0.82)',
                fontSize: '0.88rem',
                lineHeight: 1.55,
                fontFamily: msg.role === 'user' ? 'inherit' : 'inherit',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '0.6rem 1rem',
                borderRadius: '16px 16px 16px 4px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(0,255,247,0.6)',
                fontSize: '0.88rem',
                fontFamily: 'monospace',
                letterSpacing: 2,
              }}>
                ▋ thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleChatSubmit} style={{
          display: 'flex', gap: '0',
          borderTop: '1px solid rgba(0,255,247,0.1)',
          background: 'rgba(0,5,15,0.8)',
        }}>
          <input
            type="text"
            className="cyber-input"
            placeholder="Message ASTRA..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isChatLoading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              padding: '0.85rem 1.25rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            className="cyber-btn"
            disabled={isChatLoading || !chatInput.trim()}
            style={{
              borderRadius: 0,
              padding: '0.85rem 1.4rem',
              borderLeft: '1px solid rgba(0,255,247,0.1)',
              opacity: isChatLoading || !chatInput.trim() ? 0.5 : 1,
            }}
          >
            {isChatLoading ? '...' : '➤'}
          </button>
        </form>
      </div>

      <div className="cyber-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-pink)' }}>
          {statsData?.label || 'Loading status...'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '100px', padding: '0 1rem' }}>
          {(statsData?.UserProgress || [0, 0, 0, 0, 0]).map((val, i) => (
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
          Current node health
        </p>
      </div>

      <div className="cyber-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-delete)' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem 0',
      }}>
        <button
          ref={continueButtonRef}
          className="cyber-btn cyber-btn--pink"
          onClick={handleContinue}
          style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}
        >
          Continue to Final Feedback →
        </button>
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
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="cyber-btn cyber-btn--pink"
            onClick={handleReadAloudClick}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            🔊 Read Aloud
          </button>
          {isSpeaking && !isPaused && (
            <button
              className="cyber-btn"
              onClick={handlePauseClick}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              ⏸ Pause
            </button>
          )}
          {isSpeaking && isPaused && (
            <button
              className="cyber-btn"
              onClick={handleResumeClick}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              ▶ Resume
            </button>
          )}
        </div>
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
    </div>
  );
}

export default DashboardPage;
