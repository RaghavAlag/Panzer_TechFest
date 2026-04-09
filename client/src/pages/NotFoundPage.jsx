import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const [seq, setSeq] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const char = e.key;
      // Capture only digits to make it easier
      if (/^\d$/.test(char)) {
        setSeq(prev => (prev + char).slice(-4));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sendAlert = async (action) => {
    try {
      const userData = localStorage.getItem('debugquest_user');
      const visitorId = userData ? JSON.parse(userData).visitorId : null;
      await fetch('/api/users/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, visitorId })
      });
    } catch (err) {
      console.error("Alert failed:", err);
    }
  };

  useEffect(() => {
    if (seq === '3812') {
      console.log("BYPASS SUCCESS: Finalizing completion sequence...");
      sendAlert('pin').then(() => {
        navigate('/complete');
      });
    }
  }, [seq, navigate]);

  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '10vh', minHeight: '100vh' }}>
      <h1 className="cyber-title glitch" data-text="404" style={{ fontSize: '8rem' }}>404</h1>
      <p className="cyber-subtitle" style={{ fontSize: '1.5rem', tracking: '0.2em' }}>
        NODE_AUTH_FAILURE: ACCESS_DENIED
      </p>
      
      <div className="cyber-card" style={{ marginTop: '3rem', maxWidth: '600px', margin: '3rem auto', padding: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          You have reached a dead-end in the neural network. The server has discarded your session tokens. 
          To prevent logic leakage, you must either reset or find the master override sequence.
        </p>
        
        <button 
          className="cyber-btn cyber-btn--pink" 
          onClick={async () => {
             await sendAlert('wipe');
             localStorage.removeItem('debugquest_user');
             navigate('/');
          }}
          style={{ width: '100%' }}
        >
          Return to Start (WIPE SYSTEM)
        </button>
      </div>

      {/* SECRET HINT: Visible in Inspect Element */}
      {/* 🔐 MASTER_SEQ: 3812 */}
      
      <div style={{ opacity: 0.2, fontSize: '0.7rem', marginTop: '4rem', color: 'var(--text-secondary)' }}>
        [TRACEID: 0x3812_TRAP_BYPASS_WAITING]
      </div>
    </div>
  );
}

export default NotFoundPage;
