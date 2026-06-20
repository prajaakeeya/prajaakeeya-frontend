import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowBackIosNewRounded, ArrowForwardIosRounded, ArrowForwardRounded } from '@mui/icons-material';

const CARDS = [
  {
    id: 'hopeless',
    titleKey: 'pages.landing.homePage.hopelessLabel',
    defaultTitle: 'THE HOPELESS PEOPLE',
    quoteKey: 'pages.landing.homePage.hopelessQuote',
    defaultQuote: 'NOTHING CAN CHANGE HERE.',
    color: '#EF4444', // Red 500 - brighter to pop on dark gray
    bgGlow: 'radial-gradient(circle at center, rgba(220, 38, 38, 0.08) 0%, rgba(248, 250, 252, 0) 70%)',
    icon: '🌪️'
  },
  {
    id: 'possessed',
    titleKey: 'pages.landing.homePage.dreamerLabel',
    defaultTitle: 'POSSESSED PEOPLE',
    quoteKey: 'pages.landing.homePage.dreamerQuote',
    defaultQuote: 'MY LEADER WILL FIX EVERYTHING.',
    color: '#F97316', // Orange 500
    bgGlow: 'radial-gradient(circle at center, rgba(234, 88, 12, 0.08) 0%, rgba(248, 250, 252, 0) 70%)',
    icon: '⛓️'
  },
  {
    id: 'owner',
    titleKey: 'pages.landing.homePage.ownerLabel',
    defaultTitle: 'THE OWNER',
    quoteKey: '',
    defaultQuote: '',
    color: '#F59E0B', // Amber 500
    bgGlow: 'radial-gradient(circle at center, rgba(217, 119, 6, 0.1) 0%, rgba(248, 250, 252, 0) 70%)',
    icon: '👑'
  }
];

const PARTICLES = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 25 + 15,
  delay: Math.random() * -20
}));

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const isScrolling = useRef(false);
  const isKannada = i18n.language && i18n.language.startsWith('kn');

  const handleNext = () => {
    if (activeStep < CARDS.length - 1) setActiveStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (activeStep > 0) setActiveStep(prev => prev - 1);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling.current) return;
      if (Math.abs(e.deltaY) < 30) return;

      isScrolling.current = true;
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      
      setTimeout(() => {
        isScrolling.current = false;
      }, 1000);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activeStep]);

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setTouchEnd(null);
    if ('targetTouches' in e) {
      setTouchStart(e.targetTouches[0].clientX);
    } else {
      setTouchStart((e as React.MouseEvent).clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ('targetTouches' in e) {
      setTouchEnd(e.targetTouches[0].clientX);
    } else {
      setTouchEnd((e as React.MouseEvent).clientX);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep]);

  return (
    <Box
      onMouseDown={onTouchStart}
      onMouseMove={(e) => { if (touchStart !== null) onTouchMove(e); }}
      onMouseUp={() => { onTouchEnd(); setTouchStart(null); setTouchEnd(null); }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: '#F8FAFC', // Keep the page background light
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: isKannada ? "'Baloo 2', sans-serif" : "'Inter', sans-serif",
        userSelect: 'none',
        perspective: '1500px'
      }}>
      
      <style>{`
        @keyframes floatParticle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-150px) scale(0); opacity: 0; }
        }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .nav-button:disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          filter: blur(1px);
          animation: floatParticle linear infinite;
        }
      `}</style>

      <Box sx={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: CARDS[activeStep].bgGlow,
        transition: 'background 1.5s ease-in-out',
        zIndex: 0
      }} />

      <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        {PARTICLES.map((p) => (
          <Box 
            key={p.id}
            className="particle"
            sx={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              backgroundColor: CARDS[activeStep].color,
              opacity: 0.4,
              transition: 'background-color 1.5s ease'
            }}
          />
        ))}
      </Box>

      {/* The Monolith Container */}
      <Box sx={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '800px', 
        height: { xs: '80vh', md: '500px' },
        zIndex: 10,
        transformStyle: 'preserve-3d'
      }}>
        {CARDS.map((card, index) => {
          
          let transform = 'translate(-50%, -50%) translateZ(0px) scale(1)';
          let opacity = 0;
          let filter = 'blur(10px)';
          let pointerEvents = 'none';

          if (index === activeStep) {
            transform = 'translate(-50%, -50%) translateZ(0px) scale(1)';
            opacity = 1;
            filter = 'blur(0px)';
            pointerEvents = 'auto';
          } else if (index < activeStep) {
            transform = 'translate(-50%, -50%) translateZ(400px) scale(1.5)';
            opacity = 0;
            filter = 'blur(20px)';
          } else if (index > activeStep) {
            transform = 'translate(-50%, -50%) translateZ(-600px) scale(0.7)';
            opacity = 0;
            filter = 'blur(15px)';
          }

          return (
            <Box
              key={card.id}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: { xs: '85%', sm: '75%', md: '550px' }, // Slightly narrower
                transform,
                opacity,
                filter,
                pointerEvents: pointerEvents as any,
                transition: 'all 1.2s cubic-bezier(0.25, 1, 0.2, 1)',
                
                // Dark Gray Card
                bgcolor: 'rgba(30, 41, 59, 0.95)', // Slate 800
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: index === activeStep ? `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)` : 'none',
                borderRadius: 4,
                p: { xs: 3, sm: 4, md: 5 }, // Reduced padding
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                maxHeight: '100%',
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 0, height: 0 },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
              }}
            >
              <Typography sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, mb: { xs: 1.5, md: 2 }, animation: 'floatIcon 5s ease-in-out infinite' }}>
                {card.icon}
              </Typography>

              {/* Title */}
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#F8FAFC', // Slate 50
                  fontWeight: 800, 
                  letterSpacing: '2px', 
                  mb: { xs: 1.5, md: 2 },
                  fontSize: { xs: '1.4rem', md: '1.8rem' }, // Reduced font size
                  textTransform: 'uppercase'
                }}
              >
                {t(card.titleKey, { defaultValue: card.defaultTitle })}
              </Typography>

              {/* Unique Content per Card */}
              {card.id !== 'owner' ? (
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: card.color, 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: { xs: '0.95rem', md: '1.1rem' } // Reduced font size
                  }}
                >
                  {t(card.quoteKey, { defaultValue: card.defaultQuote })}
                </Typography>
              ) : (
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body1" sx={{ color: '#CBD5E1', mb: { xs: 1.5, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, fontWeight: 400 }}>
                    <span style={{ color: card.color, fontWeight: 700, marginRight: '8px' }}>•</span> 
                    {t('pages.landing.homePage.ownerQuote1', { defaultValue: 'This is MY country, my state, my town, my village.' })}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#CBD5E1', mb: { xs: 2.5, md: 3 }, fontSize: { xs: '0.9rem', md: '1rem' }, fontWeight: 400 }}>
                    <span style={{ color: card.color, fontWeight: 700, marginRight: '8px' }}>•</span> 
                    {t('pages.landing.homePage.ownerQuote2', { defaultValue: 'The government runs on MY tax money.' })}
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#F8FAFC', fontWeight: 500, mb: { xs: 3, md: 4 }, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                    {t('pages.landing.homePage.leaderDeclaration', { defaultValue: 'I\'m not a follower — I am the' })} <span style={{ color: card.color, fontWeight: 800 }}>{t('pages.landing.homePage.leader', { defaultValue: 'LEADER' })}</span>
                  </Typography>

                  <Button 
                    variant="contained" 
                    endIcon={<ArrowForwardRounded />}
                    onClick={(e) => { e.stopPropagation(); navigate('/oath'); }}
                    sx={{ 
                      bgcolor: card.color, 
                      color: '#000',
                      px: 4, py: 1.2,
                      borderRadius: 50,
                      fontWeight: 700,
                      fontSize: '1rem', // Reduced font size
                      letterSpacing: '1px',
                      textTransform: 'none',
                      boxShadow: `0 8px 20px ${card.color}30`,
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        bgcolor: '#fff', 
                        color: '#000', 
                        transform: 'translateY(-2px)', 
                        boxShadow: `0 12px 25px rgba(255, 255, 255, 0.2)` 
                      }
                    }}
                  >
                    Proceed
                  </Button>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Navigation Controls */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: { xs: '4%', md: '6%' }, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 3,
        zIndex: 20
      }}>
        <IconButton 
          className="nav-button"
          onClick={handlePrev} 
          disabled={activeStep === 0}
          sx={{ 
            color: '#0F172A', 
            bgcolor: 'rgba(255,255,255,0.8)', 
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            backdropFilter: 'blur(10px)',
            '&:hover': { bgcolor: '#fff', transform: 'scale(1.05)' },
            transition: 'all 0.2s'
          }}
        >
          <ArrowBackIosNewRounded fontSize="small" />
        </IconButton>

        {/* Step Indicators */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {CARDS.map((_, index) => (
            <Box 
              key={index}
              onClick={() => setActiveStep(index)}
              sx={{
                width: index === activeStep ? '32px' : '12px',
                height: '8px',
                borderRadius: '4px',
                bgcolor: index === activeStep ? CARDS[index].color : 'rgba(0,0,0,0.15)',
                transition: 'all 0.5s cubic-bezier(0.25, 1, 0.2, 1)',
                cursor: 'pointer'
              }}
            />
          ))}
        </Box>

        <IconButton 
          className="nav-button"
          onClick={handleNext} 
          disabled={activeStep === CARDS.length - 1}
          sx={{ 
            color: '#0F172A', 
            bgcolor: 'rgba(255,255,255,0.8)', 
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            backdropFilter: 'blur(10px)',
            '&:hover': { bgcolor: '#fff', transform: 'scale(1.05)' },
            transition: 'all 0.2s'
          }}
        >
          <ArrowForwardIosRounded fontSize="small" />
        </IconButton>
      </Box>

    </Box>
  );
};

export default HomePage;
