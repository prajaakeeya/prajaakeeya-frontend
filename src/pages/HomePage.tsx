import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { DarkModeRounded, LightModeRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';
import useThemeStore from '../store/useThemeStore';
import LanguageSelector from '../components/LanguageSelector';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import unlockImg from '../assets/images/unlock.png';

/* ═══════════════ ICONS ═══════════════ */

const LockIcon = ({ isDark: _isDark }: { isDark: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'lockBlink 1s ease-in-out infinite' }}>
    <rect x="5" y="11" width="14" height="10" rx="2.5" stroke="rgb(255,0,0)" strokeWidth="1.8" />
    <path d="M8 11V8a4 4 0 118 0v3" stroke="rgb(255,0,0)" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1.5" fill="rgb(255,0,0)" />
  </svg>
);

const OpenLockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2.5" stroke="#22C55E" strokeWidth="1.8" />
    <path d="M8 11V8a4 4 0 118 0" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1.5" fill="#22C55E" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

/* ═══════════════ SIGNAL LIGHT ═══════════════ */

const RedLight: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, rgb(224, 32, 16) 0%, rgb(255, 203, 0) 45%, rgb(245, 168, 0) 100%)',
    boxShadow: `0 0 ${size * .4}px ${size * .12}px rgba(245,168,0,.5), 0 0 ${size * .8}px ${size * .25}px rgba(245,168,0,.18), inset 0 -3px 6px rgba(0,0,0,.35), inset 0 2px 4px rgba(255,255,255,.2)`,
    position: 'relative',
    animation: 'redPulse 2.5s ease-in-out infinite',
  }}>
    <div style={{
      position: 'absolute', top: '20%', left: '28%', width: '26%', height: '18%',
      borderRadius: '50%', background: 'rgba(255,255,255,.35)', filter: 'blur(2px)',
    }} />
  </div>
);

/* ═══════════════ ANIMATED CROWN ═══════════════ */

const AnimatedCrown = () => (
  <div className="crown-wrap">
    <div className="sparkle s1" /><div className="sparkle s2" />
    <div className="sparkle s3" /><div className="sparkle s4" />
    <div className="crown-glow" />
    <svg className="crown-svg" width="40" height="40" viewBox="0 0 48 48" fill="none">
      <path d="M6 35L10 13l10 10L24 6l4 17 10-10 4 22H6z" fill="url(#crG)" stroke="#B8860B" strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="6" y="35" width="36" height="5.5" rx="2.5" fill="url(#crBand)" />
      <circle cx="14" cy="37.8" r="1.8" fill="#E11D48" />
      <circle cx="24" cy="37.8" r="2" fill="#2563EB" />
      <circle cx="34" cy="37.8" r="1.8" fill="#059669" />
      <circle cx="24" cy="6" r="2.2" fill="#FFD700" stroke="#DAA520" strokeWidth=".8" />
      <circle cx="10" cy="13" r="1.6" fill="#FFD700" stroke="#DAA520" strokeWidth=".6" />
      <circle cx="38" cy="13" r="1.6" fill="#FFD700" stroke="#DAA520" strokeWidth=".6" />
      <defs>
        <linearGradient id="crG" x1="24" y1="6" x2="24" y2="35">
          <stop stopColor="#FFE566" /><stop offset=".5" stopColor="#FFD700" /><stop offset="1" stopColor="#FF9500" />
        </linearGradient>
        <linearGradient id="crBand" x1="6" y1="35" x2="42" y2="40">
          <stop stopColor="#DAA520" /><stop offset=".5" stopColor="#FFD700" /><stop offset="1" stopColor="#B8860B" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

/* ═══════════════ STATIC CSS (animations & shapes only) ═══════════════ */

const CSS = `
  /* C-PERF-2: Bebas Neue + DM Sans are now loaded via the consolidated <link>
     in index.html. Importing them here injected the request only after React
     mounted and the <style> block rendered — the slowest possible path. */

  .anim-down{opacity:0;transform:translateY(-22px);transition:opacity .55s ease,transform .6s cubic-bezier(.34,1.56,.64,1)}
  .anim-down.on{opacity:1;transform:translateY(0)}
  .anim-left{opacity:0;transform:translateX(-26px);transition:opacity .45s ease,transform .5s cubic-bezier(.34,1.56,.64,1)}
  .anim-left.on{opacity:1;transform:translateX(0)}
  .anim-up{opacity:0;transform:translateY(34px) scale(.96);transition:opacity .5s ease,transform .6s cubic-bezier(.34,1.56,.64,1)}
  .anim-up.on{opacity:1;transform:translateY(0) scale(1)}
  .anim-fade{opacity:0;transition:opacity .5s ease}
  .anim-fade.on{opacity:1}

  @keyframes redPulse{
    0%,100%{box-shadow:0 0 15px 5px rgba(245,168,0,.45),0 0 30px 10px rgba(245,168,0,.15),inset 0 -3px 6px rgba(0,0,0,.35),inset 0 2px 4px rgba(255,255,255,.2)}
    50%{box-shadow:0 0 22px 8px rgba(245,168,0,.6),0 0 50px 18px rgba(245,168,0,.2),inset 0 -3px 6px rgba(0,0,0,.35),inset 0 2px 4px rgba(255,255,255,.2)}
  }

  .stripe-red{
    position:absolute;top:0;left:0;bottom:0;width:4px;
    background:linear-gradient(180deg,#EF4444,#7F1D1D);
    border-radius:22px 0 0 22px;
  }

  .crown-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center;width:50px;height:50px}
  .crown-svg{position:relative;z-index:2;animation:crownFloat 3s ease-in-out infinite;filter:drop-shadow(0 4px 12px rgba(255,215,0,.35))}
  @keyframes crownFloat{
    0%,100%{transform:translateY(0) rotate(0deg)}
    25%{transform:translateY(-6px) rotate(1.5deg)}
    50%{transform:translateY(-10px) rotate(0deg)}
    75%{transform:translateY(-6px) rotate(-1.5deg)}
  }
  .crown-glow{position:absolute;inset:-8px;border-radius:50%;z-index:0;background:radial-gradient(circle,rgba(255,215,0,.15) 0%,transparent 70%);animation:glowP 3s ease-in-out infinite}
  @keyframes glowP{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
  .sparkle{position:absolute;width:6px;height:6px;border-radius:50%;z-index:3;background:#FFD700;animation:sparkA 2.4s ease-in-out infinite}
  .s1{top:6px;left:20px;animation-delay:0s}
  .s2{top:10px;right:14px;animation-delay:.6s;width:5px;height:5px}
  .s3{bottom:16px;left:10px;animation-delay:1.2s;width:4px;height:4px}
  .s4{bottom:10px;right:20px;animation-delay:1.8s;width:5px;height:5px}
  @keyframes sparkA{0%,100%{opacity:0;transform:scale(0)}15%{opacity:1;transform:scale(1)}30%{opacity:1;transform:scale(1.2)}50%{opacity:0;transform:scale(0)}}

  .shimmer{position:absolute;top:0;left:-120%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.035),transparent);animation:shimAnim 5s ease-in-out infinite;pointer-events:none}
  @keyframes shimAnim{0%{left:-120%}100%{left:200%}}

  .leader-word{font-family:'Bebas Neue',sans-serif;font-size:24px;line-height:1.5;color:#FFD700;text-shadow:0 0 20px rgba(255,215,0,.35)}

  .pulse-dot{width:7px;height:7px;border-radius:50%;background:rgb(255,0,0);animation:dotP 2s ease infinite;display:inline-block}
  @keyframes dotP{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}

  .enter-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg,#C8180A 0%,#E8720A 50%,#F5A800 100%);border:none;border-radius:16px;padding:16px;cursor:pointer;font-size:15px;font-weight:700;color:#fff;letter-spacing:.5px;font-family:'DM Sans',sans-serif;box-shadow:0 4px 24px rgba(200,80,10,.35);transition:transform .15s ease,box-shadow .15s ease}
  .enter-btn:active{transform:scale(.97);box-shadow:0 2px 12px rgba(200,80,10,.2)}
  .enter-btn:hover{background:linear-gradient(135deg,#df210f 0%,#f08010 50%,#ffbe1a 100%);box-shadow:0 6px 32px rgba(200,80,10,.5)}
`;

/* ═══════════════ MAIN ═══════════════ */

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 800),
      setTimeout(() => setStep(3), 1400),
      setTimeout(() => setStep(4), 1900),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Theme-aware tokens ──
  const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;

  const noEntryCardStyle: React.CSSProperties = {
    position: 'relative',
    background: isDark
      ? 'linear-gradient(150deg,#1C0A0A 0%,#160707 40%,#120505 100%)'
      : '#FFF5F5',
    border: `1px solid ${isDark ? 'rgba(239,68,68,.18)' : 'rgba(239,68,68,.3)'}`,
    borderRadius: 22, padding: '20px 18px', overflow: 'hidden',
    transition: 'transform .2s ease',
  };

  const welcomeCardStyle: React.CSSProperties = {
    position: 'relative',
    background: isDark ? 'linear-gradient(135deg, rgba(200,24,10,0.18), rgba(245,168,0,0.12))' : 'rgb(255,245,245)',
    border: `1px solid ${isDark ? 'rgba(245,168,0,0.28)' : 'rgba(239,68,68,0.3)'}`,
    borderRadius: 24, padding: '24px 22px', overflow: 'hidden',
    transition: 'transform .2s ease',
    animation: 'wGlow 3s ease-in-out infinite 2.4s',
    boxShadow: isDark ? '0 8px 32px rgba(200,24,10,0.15), 0 0 0 0 rgba(245,168,0,0)' : 'none',
  };

  const redTagStyle: React.CSSProperties = {
    fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
    color: isDark ? '#FCA5A5' : '#DC2626',
    background: isDark ? 'rgba(239,68,68,.08)' : 'rgba(239,68,68,.06)',
    border: `1px solid ${isDark ? 'rgba(239,68,68,.15)' : 'rgba(239,68,68,.25)'}`,
    borderRadius: 6, padding: '3px 10px', display: 'inline-block',
  };

  const awakeBadgeStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5,
    color: isDark ? '#FFD700' : 'rgb(146, 24, 24)',
    marginBottom: 18,
  };

  const S: Record<string, React.CSSProperties> = {
    root: {
      background: bg,
      fontFamily: "'DM Sans', sans-serif",
      color: isDark ? '#fff' : '#111827',
      padding: '72px 18px 0', maxWidth: 480, margin: '0 auto', overflowX: 'hidden',
    },
    noEntryHeader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 0, position: 'relative' },
    noEntryBadge: { fontSize: 22, fontWeight: 800, letterSpacing: isEn ? 3 : 0, lineHeight: 1.5, color: 'rgb(255,0,0)', textTransform: 'uppercase' },
    personRow: { display: 'flex', alignItems: 'flex-start', gap: 14, justifyContent: 'center' },
    personText: { flex: 1, minWidth: 0, textAlign: 'center' as const },
    innerSep: { height: 1, margin: '8px 0', background: isDark ? 'linear-gradient(90deg,transparent,rgba(239,68,68,.15),transparent)' : 'linear-gradient(90deg,transparent,rgba(239,68,68,.2),transparent)' },
    redTitle: {
      fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: isEn ? 3 : 0, lineHeight: 1.5, margin: '0 0 2px',
      ...(isDark
        ? { background: 'linear-gradient(135deg, rgb(224,32,16) 0%, rgb(255,203,0) 45%, rgb(245,168,0) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
        : { color: '#7F1D1D' }),
    },
    quote: { fontSize: 17, color: isDark ? '#ffffff' : '#000000', lineHeight: 1.45, margin: '0 0 10px', textAlign: 'center' as const },
    tagRow: { display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
    divider: { display: 'flex', alignItems: 'center', gap: 16, margin: '22px 0' },
    divLine: { flex: 1, height: 1, background: isDark ? 'linear-gradient(90deg,transparent,#333,transparent)' : 'linear-gradient(90deg,transparent,#D1D5DB,transparent)' },
    divText: { fontSize: 12, fontWeight: 800, letterSpacing: 4, color: isDark ? '#444' : '#9CA3AF' },
    sectionLabel: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, position: 'relative' },
    greenLabel: { fontSize: 22, fontWeight: 800, letterSpacing: 3, color: '#22C55E', whiteSpace: 'nowrap' },
    greenLine: { flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(34,197,94,.4),transparent)' },
    greenLineLeft: { flex: 1, height: 1, background: 'linear-gradient(270deg,rgba(34,197,94,.4),transparent)' },
    crownCenter: { display: 'flex', justifyContent: 'center', marginBottom: 0, position: 'relative', zIndex: 1 },
    greenTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: isEn ? 5 : 0, lineHeight: 1.5, color: isDark ? '#FFFFFF' : '#14532D', margin: '0 0 12px', textAlign: 'center', position: 'relative', zIndex: 1, overflow: 'visible' as const },
    wQuote: { fontSize: 17, color: isDark ? '#FFFFFF' : '#166534', lineHeight: 1.55, marginBottom: 6, position: 'relative', zIndex: 1 },
    greenDiv: { width: 60, height: 2, background: 'linear-gradient(90deg,#22C55E,transparent)', borderRadius: 2, margin: '12px 0 14px', position: 'relative', zIndex: 1 },
    declaration: { fontSize: 15, color: isDark ? '#FFFFFF' : '#166534', fontWeight: 500, lineHeight: 1.6, marginBottom: 14, position: 'relative', zIndex: 1 },
  };

  return (
    <>
      <style>{CSS}</style>
      <style>{`
        @keyframes wGlow{
          0%,100%{box-shadow:0 8px 32px rgba(200,24,10,0.15),0 0 0 0 rgba(245,168,0,0)}
          50%{box-shadow:0 8px 40px rgba(200,24,10,0.22),0 0 0 4px rgba(245,168,0,0.07)}
        }
        @keyframes lockBlink{
          0%,100%{opacity:1}
          50%{opacity:0.15}
        }
      `}</style>

      {/* Top bar */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, py: 1.2,
        bgcolor: isDark ? 'rgba(10,8,8,0.92)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
      }}>
        <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ height: 40 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            onClick={toggleTheme}
            sx={{
              minWidth: 40, width: 40, height: 40, p: 0, borderRadius: 50,
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
              color: isDark ? '#F5A800' : '#111827',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(17,24,39,0.12)'}`,
              boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.35)' : '0 2px 10px rgba(17,24,39,0.15)',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.94)' },
            }}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
          </Button>
          <LanguageSelector
            size="small"
            sx={{
              px: 2, py: 0.6, fontSize: '0.82rem', fontWeight: 700, borderRadius: 50,
              bgcolor: '#F5A800', color: '#0A0808', textTransform: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
              '&:hover': { bgcolor: '#d99000' },
            }}
          />
        </Box>
      </Box>

      <div style={S.root}>

        {/* ═══ NO ENTRY CARD ═══ */}
        <section className={`anim-up ${step >= 1 ? 'on' : ''}`} style={{ transitionDelay: '0s' }}>
          <div style={noEntryCardStyle}>

            <div style={S.noEntryHeader}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#DC2626" stroke="#FF6B6B" strokeWidth="1.5" />
                <rect x="5.5" y="10.5" width="13" height="3" rx="1.5" fill="#fff" />
              </svg>
              <span style={S.noEntryBadge}>{t('pages.landing.homePage.noEntryBadge')}</span>
              <div style={{ position: 'absolute', right: 0 }}><LockIcon isDark={isDark} /></div>
            </div>

            {/* The Hopeless */}
            <div style={S.personRow}>
              <div style={S.personText}>
            <h3 style={S.redTitle}>{t('pages.landing.homePage.hopelessQuote')}</h3>
            <p style={{...S.quote, textTransform: 'uppercase', fontWeight: 700}}>{t('pages.landing.homePage.hopelessLabel')}</p>
              </div>
            </div>

            <div style={S.innerSep} />

            {/* Possessed People */}
            <div style={S.personRow}>
              <div style={S.personText}>
                 <h3 style={S.redTitle} >{t('pages.landing.homePage.dreamerQuote')}</h3>
                <p style={{...S.quote, fontWeight: 700}}>{t('pages.landing.homePage.dreamerLabel')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ WELCOME — THE OWNER ═══ */}
        <section className={`anim-up ${step >= 3 ? 'on' : ''}`} style={{ paddingTop: 24 }}>
          <div className={`anim-up ${step >= 4 ? 'on' : ''}`}>
            <div style={welcomeCardStyle}>
              <div className={`anim-left ${step >= 2 ? 'on' : ''}`} style={{ ...S.sectionLabel, justifyContent: 'center', marginBottom: 12 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l7.5 3.5v5c0 5-3.5 8.5-7.5 10.5-4-2-7.5-5.5-7.5-10.5v-5L12 3z" fill="#166534" stroke="#22C55E" strokeWidth="1.5" />
                  <path d="M9 12.5l2 2 4-4" stroke="#BBF7D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={S.greenLabel}>{t('pages.landing.homePage.welcomeLabel')}</span>
              </div>
              <div className="shimmer" />
              <div style={{ position: 'absolute', top: 16, right: 16, opacity: .55 }}><img src={unlockImg} alt="unlock" style={{ width: 22, height: 22, objectFit: 'contain' }} /></div>

              <div style={S.crownCenter}>
                <AnimatedCrown />
              </div>

              <h3 style={S.greenTitle}>{t('pages.landing.homePage.ownerLabel')}</h3>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', position: 'relative', zIndex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4, fontSize: 17, color: isDark ? '#FFFFFF' : '#166534', lineHeight: 1.55 }}>
                  <span style={{ color: '#F5A800', fontWeight: 900, fontSize: 18, lineHeight: 1.55 }}>•</span>
                  {t('pages.landing.homePage.ownerQuote1')}
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4, fontSize: 17, color: isDark ? '#FFFFFF' : '#166534', lineHeight: 1.55 }}>
                  <span style={{ color: '#F5A800', fontWeight: 900, fontSize: 18, lineHeight: 1.55 }}>•</span>
                  {t('pages.landing.homePage.ownerQuote2')}
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 0, fontSize: 15, color: isDark ? '#FFFFFF' : '#166534', fontWeight: 500, lineHeight: 1.6 }}>
                  <span style={{ color: '#F5A800', fontWeight: 900, fontSize: 18, lineHeight: 1.6 }}>•</span>
                  <span>{t('pages.landing.homePage.leaderDeclaration')} <span className="leader-word" style={{ color: isDark ? '#FFD700' : '#ff6400', letterSpacing: isEn ? 4 : 0 }}>{t('pages.landing.homePage.leader')}</span></span>
                </li>
              </ul>

              <div style={{ marginBottom: 0, display: 'flex', justifyContent: 'center' }}>
                <div style={awakeBadgeStyle}>
                  <span className="pulse-dot" />
                  {t('pages.landing.homePage.awakeLabel')}
                </div>
              </div>

              <button className="enter-btn" onClick={() => navigate('/oath')}>
                <span>{t('pages.landing.homePage.proceed')}</span>
                <ArrowIcon />
              </button>
            </div>
          </div>
        </section>

        <div style={{ height: 40 }} />
      </div>
    </>
  );
};

export default HomePage;
