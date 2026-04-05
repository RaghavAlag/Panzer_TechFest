import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import HintButton from '../components/HintButton';

function FeedbackFinalPage() {
  const navigate = useNavigate();
  const { user, currentLevel, advanceLevel, completeGame, hintsRemaining, discoveredBugs, startTime } = useGame();

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
    console.log("HINT: The system memory is corrupted. Flaws report message field ONLY accepts binary [0, 1, space].");
  }, [currentLevel, navigate]);

  const updateField = (field, value) => {
    let finalValue = value;
    // CTF Bug: Team name is inverted
    if (field === 'teamName') {
      finalValue = value.split('').reverse().join('');
    }
    setFormState(prev => ({ ...prev, [field]: finalValue }));
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

  const startSilkBoardUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const next = prev + Math.random() * 15;
        // STUDENT CHALLENGE: The progress bar is stuck at 99%! (Silk Board Ceiling)
        if (next >= 99) {
          clearInterval(interval);
          return 99; 
        }
        return next;
      });
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // CTF BUG: Enforce strict "@Gmail" exact string
    const emailUppercaseBlocked = !formState.email.endsWith('@Gmail');
    const dobIsPast = formState.dob && formState.dob < new Date().toISOString().split('T')[0];
    const dobBlocked = dobIsPast && !dobRuleUnlocked;
    const phoneLooksUnfixed = String(formState.phoneCounter).endsWith('2') || String(formState.phoneCounter).endsWith('4');
    const messageBinaryOnly = /^[01\s]+$/.test(formState.message.trim());

    if (!formState.teamName || !formState.email || !formState.dob || !formState.message.trim() || emailUppercaseBlocked || dobBlocked || phoneLooksUnfixed || !messageBinaryOnly) {
      setSubmitStatus('Submission blocked. Check behavior and retry.');
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

    // CTF BUG: Reversal trap on save!
    // STUDENT CHALLENGE: Even after fixing the mirror CSS, the save still fails. Why?
    if (formState.teamName !== formState.teamName.split('').reverse().join('')) {
      setSubmitStatus('Security Check: Name string proxy invalid (must be a palindrome to save).');
      return;
    }

    const stats = {
      teamName: formState.teamName,
      displayName: user?.displayName || 'Unknown',
      timeTakenMs: startTime ? Date.now() - startTime : 0,
      hintsTaken: 3 - hintsRemaining,
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
              style={{ unicodeBidi: 'bidi-override', direction: 'rtl' }}
            />
          </div>

          {/* FEATURE 3: Silk Board Progress Bar */}
          <div className="form-group">
            <label className="form-label">Verify Profile Identity</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                type="button" 
                className="cyber-btn cyber-btn--pink" 
                onClick={startSilkBoardUpload}
                disabled={isUploading}
                style={{ fontSize: '0.75rem' }}
              >
                {uploadProgress > 0 ? 'Syncing...' : 'Upload Avatar'}
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
              onClick={() => setIsAdmin(false)} 
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
                value={String(formState.phoneCounter).padStart(10, '0')}
                readOnly
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
              min={new Date().toISOString().split('T')[0]}
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
              placeholder="Final report"
            />
          </div>

          {submitStatus && <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{submitStatus}</p>}

          <div style={{ position: 'relative' }}>
            {/* STUDENT CHALLENGE: Why can't I click the submit button? (Z-Index Trap) */}
            <div 
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 9999,
                cursor: 'not-allowed',
                opacity: 0 // Invisible trap!
              }} 
              title="System Error: Button Blocked"
              onClick={(e) => {
                e.preventDefault();
                setSubmitStatus("ERR_BLOCKED: An invisible force prevents submission.");
              }}
            />
            <button type="submit" className="cyber-btn" style={{ width: '100%', position: 'relative', zIndex: 1 }} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Final Feedback'}
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '1.25rem',
          padding: '0.9rem',
          background: 'rgba(0, 255, 255, 0.05)',
          borderLeft: '3px solid var(--color-delete)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}>
          Hints are available if you get stuck.
        </div>

        <div className="progress-dots" style={{ marginTop: '1.5rem' }}>
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
          <div className="progress-dot active"></div>
          <div className="progress-dot"></div>
        </div>
      </div>

      <HintButton level={4} />
    </div>
  );
}

export default FeedbackFinalPage;
