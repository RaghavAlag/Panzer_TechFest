import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

// AI resistance: This component actually handles login, not logout
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { registerUser, advanceLevel } = useGame();

  const isValidEmail = (value) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
  
  const sendOTP = async () => {
    const email = username.trim().toLowerCase();

    if (!isValidEmail(email)) {
      setMessage('');
      setError('Enter a valid email in the username field to receive OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/users/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setMessage('OTP sent successfully. Check your email.');
      setError('');
    } catch (err) {
      setMessage('');
      setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndLogin = async () => {
    const email = username.trim().toLowerCase();

    if (!isValidEmail(email)) {
      setMessage('');
      setError('Please enter a valid email');
      return;
    }

    if (!otp.trim() || otp.trim().length !== 6) {
      setMessage('');
      setError('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const verifyResponse = await fetch('/api/users/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.trim() }),
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok || !verifyData.verified) {
        throw new Error(verifyData.error || 'OTP verification failed');
      }

      const displayName = email.split('@')[0] || email;
      await registerUser(displayName);
      await advanceLevel(1, 'login-otp-success');
      navigate('/game-choice');
    } catch (err) {
      setMessage('');
      setError(err.message || 'Login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otpSent) {
      await verifyAndLogin();
    } else {
      await sendOTP();
    }
  };
  
  return (
    <div className="container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div className="cyber-card" style={{ width: '100%', maxWidth: '450px' }}>
        <h1 className="cyber-title glitch" data-text="DebugQuest">
          DebugQuest
        </h1>
        <p className="cyber-subtitle" style={{ marginBottom: '2rem' }}>
          Enter the system. Find the bugs. Prove your worth.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="cyber-input"
              placeholder="Enter your codename..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="cyber-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {otpSent && (
            <div className="form-group">
              <label className="form-label">OTP Code</label>
              <input
                type="text"
                className="cyber-input"
                placeholder="Enter 6-digit OTP..."
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
          )}
          
          {error && (
            <p className="form-error shake">{error}</p>
          )}

          {message && (
            <p style={{ color: 'var(--color-success)', marginTop: '0.5rem' }}>{message}</p>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="cyber-btn cyber-btn--pink"
              onClick={sendOTP}
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              {isLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
            
            <button
              type="submit"
              className="cyber-btn"
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              {isLoading ? 'Please wait...' : otpSent ? 'Verify & Login' : 'Login'}
            </button>
          </div>
        </form>
        
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'rgba(0, 255, 255, 0.05)',
          borderLeft: '3px solid var(--color-delete)',
          fontSize: '0.85rem'
        }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            🎮 <strong>Level 1:</strong> Authentication Challenge
          </p>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            The login system seems to have some... issues. Can you find a way in?
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="progress-dots" style={{ marginTop: '2rem' }}>
          <div className="progress-dot active"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
