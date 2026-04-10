import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const GW = 900;
const GH = 500;
const BASE_SPEED = 2.2;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

/* ---------- Star field ---------- */
function makeStars(n) {
  return Array.from({ length: n }, () => ({
    x: Math.random() * GW,
    y: Math.random() * GH,
    r: randomBetween(0.5, 1.8),
    alpha: randomBetween(0.3, 1),
  }));
}

/* ---------- Asteroid polygon ---------- */
function makeAsteroidPoints(radius, sides) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const jitter = randomBetween(0.65, 1.0);
    pts.push({
      x: Math.cos(angle) * radius * jitter,
      y: Math.sin(angle) * radius * jitter,
    });
  }
  return pts;
}

function makeAsteroid() {
  const radius = randomBetween(28, 46);
  const sides = Math.floor(randomBetween(7, 11));
  const hue = randomBetween(25, 40);
  return {
    x: randomBetween(radius, GW - radius),
    y: -radius - 10,
    radius,
    pts: makeAsteroidPoints(radius, sides),
    speed: BASE_SPEED + randomBetween(0, 1.2),
    rot: 0,
    rotSpeed: randomBetween(-0.012, 0.012),
    color: `hsl(${hue}, 35%, 45%)`,
    darkColor: `hsl(${hue}, 25%, 30%)`,
  };
}

/* ---------- Blue bonus orb ---------- */
function makeOrb() {
  return {
    x: randomBetween(20, GW - 20),
    y: -20,
    r: randomBetween(7, 11),
    speed: randomBetween(1.6, 2.8),
    pulse: 0,
    value: 100,
  };
}

/* ---------- Particles ---------- */
function spawnCrashParticles(x, y) {
  return Array.from({ length: 30 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(1.5, 5);
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: randomBetween(2, 5),
      life: 1,
      color: ['#00e5ff', '#ffffff', '#ff6633', '#ffcc00'][Math.floor(Math.random() * 4)],
    };
  });
}

function spawnOrbParticles(x, y) {
  return Array.from({ length: 14 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(1, 3.5);
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: randomBetween(2, 4),
      life: 1,
      color: '#00c8ff',
    };
  });
}

/* ---------- Draw helpers ---------- */
function drawStars(ctx, stars) {
  stars.forEach((s) => {
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawAsteroid(ctx, ast) {
  ctx.save();
  ctx.translate(ast.x, ast.y);
  ctx.rotate(ast.rot);

  ctx.beginPath();
  ctx.moveTo(ast.pts[0].x, ast.pts[0].y);
  ast.pts.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.closePath();

  const grad = ctx.createRadialGradient(
    -ast.radius * 0.3, -ast.radius * 0.3, 0,
    0, 0, ast.radius
  );
  grad.addColorStop(0, ast.color);
  grad.addColorStop(1, ast.darkColor);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  [
    [ast.radius * 0.2, ast.radius * 0.1, ast.radius * 0.18],
    [-ast.radius * 0.3, -ast.radius * 0.2, ast.radius * 0.12],
    [ast.radius * 0.1, -ast.radius * 0.35, ast.radius * 0.09],
  ].forEach(([cx, cy, cr]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawOrb(ctx, orb) {
  const t = orb.pulse;
  const glow = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * 2.5 + Math.sin(t) * 4);
  glow.addColorStop(0, 'rgba(0,200,255,0.55)');
  glow.addColorStop(1, 'rgba(0,100,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.r * 2.5 + Math.sin(t) * 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00c8ff';
  ctx.fillStyle = `rgba(0, ${180 + Math.sin(t) * 40}, 255, 0.95)`;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(orb.x - orb.r * 0.3, orb.y - orb.r * 0.3, orb.r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawShip(ctx, px, py) {
  const w = 22, h = 32;
  ctx.save();
  ctx.translate(px, py);

  // Engine glow
  const glow = ctx.createRadialGradient(0, h * 0.6, 0, 0, h * 0.6, 18);
  glow.addColorStop(0, 'rgba(0,229,255,0.4)');
  glow.addColorStop(1, 'rgba(0,229,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, h * 0.6, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(-w / 2, h / 2);
  ctx.lineTo(0, h / 4);
  ctx.lineTo(w / 2, h / 2);
  ctx.closePath();

  const bodyGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  bodyGrad.addColorStop(0, '#00e5ff');
  bodyGrad.addColorStop(0.5, '#0099bb');
  bodyGrad.addColorStop(1, '#006688');
  ctx.fillStyle = bodyGrad;
  ctx.shadowBlur = 14;
  ctx.shadowColor = '#00e5ff';
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(-w * 0.38, h * 0.3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(w * 0.38, h * 0.3); ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawParticles(ctx, particles) {
  particles.forEach((p) => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawScore(ctx, score) {
  const bw = 130, bh = 56, bx = GW / 2 - bw / 2, by = 14;
  ctx.fillStyle = 'rgba(5,15,30,0.75)';
  ctx.strokeStyle = 'rgba(0,200,220,0.5)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, bx, by, bw, bh, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(0,200,220,0.7)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('SCORE', GW / 2, by + 10);

  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(String(score), GW / 2, by + 26);
}

/* ======================================================== */
function GameChoicePage() {
  const navigate = useNavigate();
  const { currentLevel } = useGame();

  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  const [phase, setPhase] = useState('idle');
  const [finalScore, setFinalScore] = useState(0);
  const [showNote, setShowNote] = useState(false);

  if (currentLevel < 2) {
    navigate('/');
    return null;
  }

  const stopLoop = (st) => {
    if (st && st.animId) { cancelAnimationFrame(st.animId); st.animId = null; }
    if (st) st.running = false;
  };

  /* ---------- Canvas-relative mouse position ---------- */
  const getCanvasPos = (canvas, clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = GW / rect.width;
    const scaleY = GH / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  /* ---------- Mouse move handler ---------- */
  const onMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const st = stateRef.current;
    if (!canvas || !st || !st.running) return;
    const pos = getCanvasPos(canvas, e.clientX, e.clientY);
    st.mouse.x = Math.max(14, Math.min(GW - 14, pos.x));
    st.mouse.y = Math.max(20, Math.min(GH - 20, pos.y));
  }, []);

  /* ---------- Start game ---------- */
  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    stopLoop(stateRef.current);

    const startX = GW / 2, startY = GH - 60;
    const st = {
      player: { x: startX, y: startY },
      mouse: { x: startX, y: startY },
      asteroids: [],
      orbs: [],
      particles: [],
      stars: makeStars(160),
      score: 0,
      frameCount: 0,
      crashed: false,
      running: true,
      animId: null,
    };
    stateRef.current = st;
    setPhase('playing');

    const loop = () => {
      if (!st.running) return;
      st.frameCount++;

      // ---- Smooth follow mouse ----
      const lerp = 0.18;
      st.player.x += (st.mouse.x - st.player.x) * lerp;
      st.player.y += (st.mouse.y - st.player.y) * lerp;

      // ---- Spawn asteroids ----
      const spawnRate = Math.max(40, 90 - Math.floor(st.score / 500) * 5);
      if (st.frameCount % spawnRate === 0) st.asteroids.push(makeAsteroid());

      // ---- Spawn orbs (every ~4 seconds) ----
      if (st.frameCount % 240 === 0) st.orbs.push(makeOrb());

      // ---- Move asteroids ----
      const speedMult = 1 + Math.floor(st.score / 800) * 0.25;
      st.asteroids.forEach((a) => { a.y += a.speed * speedMult; a.rot += a.rotSpeed; });
      st.asteroids = st.asteroids.filter((a) => a.y < GH + 60);

      // ---- Move orbs ----
      st.orbs.forEach((o) => { o.y += o.speed; o.pulse += 0.1; });
      st.orbs = st.orbs.filter((o) => o.y < GH + 20);

      // ---- Score ----
      st.score++;

      // ---- Particles ----
      st.particles.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.025; });
      st.particles = st.particles.filter((p) => p.life > 0);

      // ---- Orb collection ----
      if (!st.crashed) {
        st.orbs = st.orbs.filter((o) => {
          const dx = o.x - st.player.x;
          const dy = o.y - st.player.y;
          if (Math.sqrt(dx * dx + dy * dy) < o.r + 18) {
            st.score += o.value;
            st.particles.push(...spawnOrbParticles(o.x, o.y));
            return false;
          }
          return true;
        });
      }

      // ---- Collision with asteroids ----
      if (!st.crashed) {
        for (const a of st.asteroids) {
          const dx = a.x - st.player.x;
          const dy = a.y - st.player.y;
          if (Math.sqrt(dx * dx + dy * dy) < a.radius * 0.72) {
            st.crashed = true;
            st.particles.push(...spawnCrashParticles(st.player.x, st.player.y));
            break;
          }
        }
      }

      // ---- Draw ----
      ctx.fillStyle = '#050d1b';
      ctx.fillRect(0, 0, GW, GH);
      drawStars(ctx, st.stars);
      st.orbs.forEach((o) => drawOrb(ctx, o));
      st.asteroids.forEach((a) => drawAsteroid(ctx, a));
      drawParticles(ctx, st.particles);
      if (!st.crashed) drawShip(ctx, st.player.x, st.player.y);
      drawScore(ctx, st.score);

      // ---- Post-crash wait for particles then show UI ----
      if (st.crashed && st.particles.length === 0) {
        stopLoop(st);
        setFinalScore(st.score);
        setPhase('crashed');
        return;
      }

      st.animId = requestAnimationFrame(loop);
    };

    st.animId = requestAnimationFrame(loop);
  }, []);

  // Mouse listener
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);

  // Touch drag
  const lastTouch = useRef(null);
  const onTouchStart = (e) => {
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = (e) => {
    const canvas = canvasRef.current;
    const st = stateRef.current;
    if (!canvas || !st) return;
    const pos = getCanvasPos(canvas, e.touches[0].clientX, e.touches[0].clientY);
    st.mouse.x = Math.max(14, Math.min(GW - 14, pos.x));
    st.mouse.y = Math.max(20, Math.min(GH - 20, pos.y));
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  // Idle canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const stars = makeStars(160);
    ctx.fillStyle = '#050d1b';
    ctx.fillRect(0, 0, GW, GH);
    drawStars(ctx, stars);
    drawShip(ctx, GW / 2, GH - 80);
    drawScore(ctx, 0);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Press START GAME to launch', GW / 2, GH / 2);
    ctx.fillStyle = 'rgba(0,229,255,0.4)';
    ctx.font = '13px monospace';
    ctx.fillText('Move your mouse to fly · Collect blue orbs for bonus points', GW / 2, GH / 2 + 28);
  }, []);

  useEffect(() => () => { if (stateRef.current) stopLoop(stateRef.current); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#02080f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        position: 'relative',
        width: GW,
        maxWidth: '100%',
        boxShadow: '0 0 60px rgba(0,200,220,0.12)',
        borderRadius: 4,
        overflow: 'hidden',
        cursor: phase === 'playing' ? 'none' : 'default',
      }}>
        <canvas
          ref={canvasRef}
          width={GW}
          height={GH}
          style={{ display: 'block', width: '100%' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        />

        {/* SKIP button */}
        {phase !== 'playing' && (
          <button
            onClick={() => navigate('/loading')}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(5,15,30,0.75)',
              border: '1px solid rgba(0,200,220,0.45)',
              color: 'rgba(0,220,240,0.85)',
              fontFamily: 'monospace', fontSize: '11px',
              padding: '6px 14px', borderRadius: 6,
              cursor: 'pointer', letterSpacing: '1px',
            }}
          >
            SKIP → ENTER ASTRA NET
          </button>
        )}

        {/* Idle overlay */}
        {phase === 'idle' && (
          <div style={overlayStyle}>
            <button onClick={startGame} style={primaryBtn}>▶ START GAME</button>
          </div>
        )}

        {/* Crashed overlay */}
        {phase === 'crashed' && (
          <div style={overlayStyle}>
            <p style={{ color: '#ff4455', fontSize: '1.8rem', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 3, margin: 0 }}>
              SHIP DESTROYED
            </p>
            <p style={{ color: 'rgba(0,229,255,0.7)', fontFamily: 'monospace', fontSize: '1rem', margin: '6px 0 18px' }}>
              Score: <strong style={{ color: '#00e5ff' }}>{finalScore}</strong>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={startGame} style={primaryBtn}>▶ Play Again</button>
              <button onClick={() => navigate('/loading')} style={outlineBtn('#00e5ff')}>Continue →</button>
              <button onClick={() => setShowNote((p) => !p)} style={outlineBtn('#cc44ff')}>
                {showNote ? 'Hide Note' : 'Show Note'}
              </button>
            </div>
            {showNote && (
              <div style={{
                marginTop: '1rem',
                background: 'rgba(200,100,255,0.08)',
                border: '1px solid rgba(200,100,255,0.3)',
                borderRadius: 8, padding: '0.9rem 1.4rem',
                maxWidth: 380, textAlign: 'center',
              }}>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>
                  📝 Watch the{' '}
                  <a
                    href="https://drive.google.com/file/d/1usQjNgeYyrcHhCHK4MkhMdsyAKGZAeQL/view?usp=drive_link"
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: '#cc44ff' }}
                  >video guide</a>{' '}
                  and proceed to the next task when ready.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace', fontSize: '0.72rem', marginTop: '0.8rem' }}>
        Move your mouse to fly · Collect 🔵 blue orbs for +100 pts · Mobile: drag on screen
      </p>
    </div>
  );
}

const overlayStyle = {
  position: 'absolute', inset: 0,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  gap: '0.5rem',
  background: 'rgba(2,8,15,0.6)',
  backdropFilter: 'blur(3px)',
};

const primaryBtn = {
  background: 'linear-gradient(135deg, rgba(0,190,210,0.9), rgba(0,120,160,0.9))',
  border: '1px solid rgba(0,229,255,0.5)',
  color: '#fff', fontFamily: 'monospace', fontWeight: 'bold',
  fontSize: '1rem', padding: '0.65rem 2rem',
  borderRadius: 6, cursor: 'pointer',
  letterSpacing: '2px',
  boxShadow: '0 0 20px rgba(0,200,220,0.3)',
};

const outlineBtn = (color) => ({
  background: 'transparent',
  border: `1.5px solid ${color}`,
  color, fontFamily: 'monospace', fontWeight: 'bold',
  fontSize: '1rem', padding: '0.65rem 1.6rem',
  borderRadius: 6, cursor: 'pointer', letterSpacing: '1px',
});

export default GameChoicePage;