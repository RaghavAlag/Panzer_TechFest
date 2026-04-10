import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

function FeedbackFinalPage() {
  const navigate = useNavigate();
  const { user, currentLevel, advanceLevel, completeGame, discoveredBugs, startTime } = useGame();

  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailRuleUnlocked, setEmailRuleUnlocked] = useState(false);
  const [dobRuleUnlocked, setDobRuleUnlocked] = useState(false);
  const [precisionMode, setPrecisionMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formState, setFormState] = useState({
    teamName: '',
    phoneCounter: 1000000000,
    email: '',
    dob: '',
    favoriteBug: '',
    severity: 'Low',
    message: '',
  });

  useEffect(() => {
    if (currentLevel < 4) {
      navigate('/dashboard');
    }
  }, [currentLevel, navigate]);

  const updateField = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const incrementPhone = () => {
    const step = precisionMode ? 1 : 2;
    setFormState(prev => ({
      ...prev,
      phoneCounter: Math.min(prev.phoneCounter + step, 9999999999),
    }));
  };

  const decrementPhone = () => {
    const step = precisionMode ? 1 : 2;
    setFormState(prev => ({
      ...prev,
      phoneCounter: Math.max(prev.phoneCounter - step, 1000000000),
    }));
  };

  const handleEmailLabelContextMenu = (e) => {
    e.preventDefault();
    setEmailRuleUnlocked(true);
    setSubmitStatus('Email parser changed mode.');
  };

  const handleDobLabelDoubleClick = () => {
    setDobRuleUnlocked(true);
    setSubmitStatus('Date control switched mode.');
  };

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    let current = 0;
    const tick = () => {
      current += Math.random() * 25;
      if (current >= 100) {
        setUploadProgress(100);
        setIsUploading(false);
      } else {
        setUploadProgress(current);
        setTimeout(tick, 200);
      }
    };
    setTimeout(tick, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // CTF BUG: Enforce strict "@Gmail" exact string
    if (!formState.teamName || !formState.email || !formState.dob || !formState.message.trim()) {
      setSubmitStatus('Submission blocked: All fields are required.');
      return;
    }

    // FEATURE 4: Admin check
    if (!isAdmin) {
      setSubmitStatus('Access Denied: Administrative privileges required for final submission.');
      return;
    }

    // FEATURE 3: Upload check
    if (uploadProgress < 100) {
      setSubmitStatus('Verification Incomplete: Profile picture sync stuck at Silk Board junction (99%).');
      return;
    }


    const stats = {
      teamName: formState.teamName,
      displayName: user?.displayName || 'Unknown',
      timeTakenMs: startTime ? Date.now() - startTime : 0,
      bugsFound: discoveredBugs.length,
      currentLevel,
    };

    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const response = await fetch('/api/feedback/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          stats,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      await advanceLevel(4, 'feedback-final-submitted');
      const totalTime = await completeGame();
      // THE FINAL TRAP: Redirect to 404 instead of completion
      navigate('/not-found', { state: { totalTime } });
    } catch {
      setSubmitStatus('Submission blocked. Retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', paddingTop: '2rem' }}>
      <div className="cyber-card" style={{ maxWidth: '760px', margin: '0 auto' }}>
        <h1 className="cyber-title" style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>
          FINAL FEEDBACK LEVEL
        </h1>
        <p className="cyber-subtitle" style={{ marginBottom: '1.25rem' }}>
          Stabilize the form and submit to finish the challenge.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Team Name</label>
            <input
              type="text"
              className="cyber-input"
              value={formState.teamName}
              onChange={(e) => updateField('teamName', e.target.value)}
              placeholder="Team identifier"
            />
          </div>

          {/* FEATURE 3: Silk Board Progress Bar */}
          <div className="form-group">
            <label className="form-label">Verify Profile Identity</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden-file-input" 
                style={{ display: 'none' }} 
                accept="image/*,.pdf,.doc,.docx"
              />
              <button 
                type="button" 
                className="cyber-btn cyber-btn--pink" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || uploadProgress === 100}
                style={{ fontSize: '0.75rem' }}
              >
                {uploadProgress === 100 ? 'Uploaded ✅' : isUploading ? 'Syncing...' : 'Upload Avatar'}
              </button>
              <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${uploadProgress}%`, 
                  height: '100%', 
                  background: 'var(--color-pink)',
                  boxShadow: '0 0 10px var(--color-pink)',
                  transition: 'width 0.3s ease-out'
                }} />
              </div>
              <span style={{ fontSize: '0.8rem', minWidth: '35px' }}>{Math.floor(uploadProgress)}%</span>
            </div>
            {uploadProgress === 99 && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.7rem', marginTop: '0.5rem' }}>
                ⚠️ Network Congestion: Stuck at Silk Board Junction.
              </p>
            )}
          </div>

          {/* FEATURE 4: Admin Toggle with Bubbling Trap */}
          <div className="form-group">
            <label className="form-label">System Privileges</label>
            <div 
              style={{ 
                position: 'relative', 
                padding: '0.5rem', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid #333',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div 
                  className={`toggle-broken ${isAdmin ? 'active' : ''}`}
                  onClick={(e) => {
                    // STUDENT CHALLENGE: This toggle keeps switching back to OFF! (Event Bubbling)
                    setIsAdmin(!isAdmin);
                  }}
                >
                  <div className="toggle-broken__slider"></div>
                </div>
                <span style={{ color: isAdmin ? 'var(--color-pink)' : 'var(--text-secondary)' }}>
                  {isAdmin ? 'ADMIN ACCESS GRANTED' : 'REQUEST ADMIN ACCESS'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label
              className="form-label"
              onDoubleClick={() => setPrecisionMode((prev) => !prev)}
              title="Phone control"
            >
              Phone Number Counter
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button type="button" className="cyber-btn" onClick={decrementPhone}>-</button>
              <input
                type="text"
                className="cyber-input"
                value={formState.phoneCounter}
                onChange={(e) => {
                  const numStr = e.target.value.replace(/\D/g, '').slice(0, 10);
                  updateField('phoneCounter', numStr);
                }}
                style={{ textAlign: 'center' }}
              />
              <button type="button" className="cyber-btn" onClick={incrementPhone}>+</button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" onContextMenu={handleEmailLabelContextMenu} title="Email parser">
              Email
            </label>
            <input
              type="email"
              className="cyber-input"
              value={formState.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="Team contact"
            />
          </div>

          <div className="form-group">
            <label className="form-label" onDoubleClick={handleDobLabelDoubleClick} title="Date control">
              DOB
            </label>
            <input
              type="date"
              className="cyber-input"
              value={formState.dob}
              onChange={(e) => updateField('dob', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Favorite Bug</label>
            <select
              className="cyber-input"
              value={formState.favoriteBug}
              onChange={(e) => updateField('favoriteBug', e.target.value)}
            >
              <option value="">Select signal</option>
              <option value="otp">OTP</option>
              <option value="loading">Loading</option>
              <option value="dashboard">Dashboard</option>
              <option value="feedback">Feedback form</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Severity</label>
            <select
              className="cyber-input"
              value={formState.severity}
              onChange={(e) => updateField('severity', e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="cyber-input"
              value={formState.message}
              onChange={(e) => updateField('message', e.target.value)}
              rows={4}
              placeholder="Tell us which bugs are solved and how"
            />
          </div>

          {submitStatus && <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{submitStatus}</p>}

          <div style={{ position: 'relative' }}>
            <button type="submit" className="cyber-btn" style={{ width: '100%', position: 'relative' }} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Final Feedback'}
            </button>
          </div>
        </form>


        <div className="progress-dots" style={{ marginTop: '1.5rem' }}>
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
          <div className="progress-dot active"></div>
          <div className="progress-dot"></div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackFinalPage;
