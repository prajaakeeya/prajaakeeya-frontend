import React from 'react';
import {
  Box, Button, Card, CardContent, Container, Divider, Link, Stack, Typography, alpha,
} from '@mui/material';
import {
  ArrowForwardRounded, BlockRounded, CheckRounded, FingerprintRounded, GavelRounded,
  GroupsRounded, HowToVoteRounded, VerifiedUserOutlined, VisibilityOutlined, BalanceRounded,
  HandshakeOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublicTopBar from '../components/PublicTopBar';
import AuthFooter from '../components/AuthFooter';
import { getCitizensCount } from '../services/statsService';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';

// ── Small layout helpers ──────────────────────────────────────────────────────

const Section: React.FC<{ id?: string; alt?: boolean; children: React.ReactNode }> = ({ id, alt, children }) => (
  <Box
    component="section"
    id={id}
    sx={{
      py: { xs: 8, md: 12 }, scrollMarginTop: 64,
      bgcolor: alt ? (th) => (th.palette.mode === 'dark' ? 'grey.900' : 'grey.50') : 'background.default',
      borderTop: alt ? 1 : 0, borderBottom: alt ? 1 : 0, borderColor: 'divider',
    }}
  >
    <Container maxWidth="lg">{children}</Container>
  </Box>
);

const SectionHeading: React.FC<{ kicker?: string; title: string; subtitle?: string }> = ({ kicker, title, subtitle }) => (
  <Box sx={{ maxWidth: 680, mb: { xs: 5, md: 7 } }}>
    {kicker && (
      <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
        {kicker}
      </Typography>
    )}
    <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, mt: 0.5 }}>{title}</Typography>
    {subtitle && (
      <Typography sx={{ color: 'text.secondary', fontSize: '1.125rem', mt: 1.5 }}>{subtitle}</Typography>
    )}
  </Box>
);

const IconBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      width: 44, height: 44, borderRadius: 3, display: 'grid', placeItems: 'center', mb: 2.5,
      color: 'primary.main', bgcolor: (th) => alpha(th.palette.primary.main, th.palette.mode === 'dark' ? 0.16 : 0.08),
    }}
  >
    {children}
  </Box>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const L = (key: string, opts?: Record<string, unknown>) => t(`pages.landing.${key}`, opts) as string;

  const [citizens, setCitizens] = React.useState<number | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    getCitizensCount()
      .then((resp) => {
        const total = resp?.data?.citizens;
        if (!cancelled && typeof total === 'number') setCitizens(total);
      })
      .catch(() => { /* count stays hidden */ });
    return () => { cancelled = true; };
  }, []);

  const join = () => navigate('/oath');
  const joinLabel = L('joinNow', { defaultValue: 'Join now' });

  const pillars = [
    { key: 'election', icon: <BalanceRounded /> },
    { key: 'mission', icon: <HandshakeOutlined /> },
    { key: 'issues', icon: <VisibilityOutlined /> },
  ];
  const features = [
    { key: 'item1', icon: <GroupsRounded /> },
    { key: 'item2', icon: <HowToVoteRounded /> },
    { key: 'item3', icon: <VerifiedUserOutlined /> },
    { key: 'item4', icon: <FingerprintRounded /> },
  ];
  const roles = [
    { key: 'voter', icon: <HowToVoteRounded /> },
    { key: 'aspirant', icon: <GavelRounded /> },
  ];
  const milestones = ['2017', '2018', '2019'];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PublicTopBar
        links={[
          { label: L('nav.about'), href: '#about' },
          { label: L('foundation.title'), href: '#values' },
          { label: L('journey.title'), href: '#journey' },
          { label: t('userDashboard.actions.civicIssues', { defaultValue: 'Public Issues' }), href: '/guest/civic-issues' },
        ]}
        cta={<Button variant="contained" size="small" onClick={join}>{joinLabel}</Button>}
      />

      {/* ── Hero ── */}
      <Box component="section" sx={{ pt: { xs: 14, md: 18 }, pb: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' }, gap: { xs: 6, md: 8 }, alignItems: 'center' }}>
            <Box>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                {L('about.title')}
              </Typography>
              <Typography
                variant="h1"
                sx={{ fontSize: { xs: '2.5rem', sm: '3.25rem', md: '3.75rem' }, lineHeight: 1.05, letterSpacing: '-0.035em', mt: 1 }}
              >
                {L('animatedTitles.1')}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: { xs: '1.0625rem', md: '1.1875rem' }, mt: 3, maxWidth: 560 }}>
                {L('about.summary')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
                <Button variant="contained" size="large" endIcon={<ArrowForwardRounded />} onClick={join}>
                  {joinLabel}
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate('/guest/dashboard')}>
                  {L('exploreAsGuest', { defaultValue: 'Explore as guest' })}
                </Button>
              </Stack>
              {citizens != null && (
                <Stack direction="row" spacing={1.5} alignItems="baseline" sx={{ mt: 5 }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                    {citizens.toLocaleString()}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {t('userDashboard.totalVoters', { defaultValue: 'No. of Registered Citizens' })}
                  </Typography>
                </Stack>
              )}
            </Box>

            {/* Brand panel */}
            <Box
              sx={{
                position: 'relative', overflow: 'hidden', borderRadius: 4,
                bgcolor: 'primary.main', color: 'primary.contrastText',
                p: { xs: 4, md: 5 }, minHeight: { md: 440 },
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute', right: -80, bottom: -80, width: 320, height: 320, borderRadius: '50%',
                  border: '48px solid', borderColor: (th) => alpha(th.palette.common.white, 0.08),
                }}
              />
              <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ width: 72, height: 72, borderRadius: 4, boxShadow: 3 }} />
              <Box sx={{ position: 'relative' }}>
                <Typography sx={{ fontFamily: '"Noto Sans Kannada", inherit', fontWeight: 700, fontSize: { xs: '2.75rem', md: '3.5rem' }, lineHeight: 1.15 }}>
                  ಪ್ರಜಾಕೀಯ
                </Typography>
                <Typography sx={{ opacity: 0.85, mt: 1, fontSize: '1.0625rem' }}>{t('pages.login.footerMotto')}</Typography>
                <Divider sx={{ borderColor: (th) => alpha(th.palette.common.white, 0.2), my: 3 }} />
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                  {pillars.map((p) => (
                    <Typography key={p.key} sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                      {L(`pillars.${p.key}.title`)}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Manifesto: who this is for ── */}
      <Section id="about" alt>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Card sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'error.main', mb: 3 }}>
              <BlockRounded fontSize="small" />
              <Typography variant="overline" sx={{ fontWeight: 700 }}>{L('homePage.noEntryBadge')}</Typography>
            </Stack>
            {[['hopelessQuote', 'hopelessLabel'], ['dreamerQuote', 'dreamerLabel']].map(([q, l], i) => (
              <Box key={q} sx={{ py: 2.5, borderTop: i ? 1 : 0, borderColor: 'divider' }}>
                <Typography
                  sx={{
                    fontSize: '1.25rem', fontWeight: 600, color: 'text.secondary',
                    textDecoration: 'line-through', textDecorationThickness: 2,
                    textDecorationColor: (th) => alpha(th.palette.error.main, 0.55),
                  }}
                >
                  {L(`homePage.${q}`)}
                </Typography>
                <Typography variant="overline" sx={{ color: 'text.disabled' }}>{L(`homePage.${l}`)}</Typography>
              </Box>
            ))}
          </Card>

          <Card sx={{ p: { xs: 3, md: 4 }, borderColor: (th) => alpha(th.palette.primary.main, 0.4) }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'success.main', mb: 1.5 }}>
              <VerifiedUserOutlined fontSize="small" />
              <Typography variant="overline" sx={{ fontWeight: 700 }}>{L('homePage.welcomeLabel')}</Typography>
            </Stack>
            <Typography variant="h3" sx={{ mb: 3 }}>{L('homePage.ownerLabel')}</Typography>
            <Stack spacing={1.5}>
              {[L('homePage.ownerQuote1'), L('homePage.ownerQuote2')].map((line) => (
                <Stack key={line} direction="row" spacing={1.5}>
                  <CheckRounded sx={{ color: 'primary.main', fontSize: 20, mt: '3px' }} />
                  <Typography sx={{ fontSize: '1.0625rem' }}>{line}</Typography>
                </Stack>
              ))}
              <Stack direction="row" spacing={1.5}>
                <CheckRounded sx={{ color: 'primary.main', fontSize: 20, mt: '3px' }} />
                <Typography sx={{ fontSize: '1.0625rem' }}>
                  {L('homePage.leaderDeclaration')}{' '}
                  <Box component="strong" sx={{ color: 'primary.main' }}>{L('homePage.leader')}</Box>
                </Typography>
              </Stack>
            </Stack>
            <Button variant="contained" endIcon={<ArrowForwardRounded />} onClick={join} sx={{ mt: 4 }}>
              {L('homePage.proceed')}
            </Button>
          </Card>
        </Box>
      </Section>

      {/* ── Values ── */}
      <Section id="values">
        <SectionHeading kicker={L('foundation.kicker')} title={L('foundation.title')} subtitle={L('foundation.subtitle')} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 4, md: 6 } }}>
          {pillars.map((p, i) => (
            <Box key={p.key} sx={{ borderTop: 2, borderColor: i === 0 ? 'primary.main' : 'divider', pt: 3 }}>
              <IconBadge>{p.icon}</IconBadge>
              <Typography variant="h5" component="h3">{L(`pillars.${p.key}.title`)}</Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>{L(`pillars.${p.key}.body`)}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mt: { xs: 6, md: 10 } }}>
          {features.map((f) => (
            <Card key={f.key}>
              <CardContent sx={{ p: 3 }}>
                <IconBadge>{f.icon}</IconBadge>
                <Typography sx={{ fontWeight: 600 }}>{L(`features.${f.key}.title`)}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>{L(`features.${f.key}.body`)}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Section>

      {/* ── Roles ── */}
      <Section alt>
        <SectionHeading
          title={L('rolesTitle', { defaultValue: 'Two ways to take part' })}
          subtitle={L('animatedSubtitle')}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {roles.map((r) => {
            const bullets = t(`pages.landing.cards.${r.key}.bullets`, { returnObjects: true });
            return (
              <Card key={r.key} sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: { xs: 3, md: 4 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <IconBadge>{r.icon}</IconBadge>
                  <Typography variant="h4" component="h3">{L(`cards.${r.key}.title`)}</Typography>
                  <Typography sx={{ color: 'text.secondary', mt: 1 }}>{L(`cards.${r.key}.description`)}</Typography>
                  <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', p: 0, my: 3, flex: 1 }}>
                    {(Array.isArray(bullets) ? (bullets as string[]) : []).map((b) => (
                      <Stack component="li" key={b} direction="row" spacing={1.5}>
                        <CheckRounded sx={{ color: 'success.main', fontSize: 20, mt: '2px' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.9375rem' }}>{b}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button variant="outlined" endIcon={<ArrowForwardRounded />} onClick={join} sx={{ alignSelf: 'flex-start' }}>
                    {L(`cards.${r.key}.cta`)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Section>

      {/* ── Journey ── */}
      <Section id="journey">
        <SectionHeading kicker={L('journey.kicker')} title={L('journey.title')} subtitle={L('journey.subtitle')} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 0, md: 4 } }}>
          {milestones.map((year, i) => (
            <Box
              key={year}
              sx={{
                position: 'relative', pl: { xs: 4, md: 0 }, pt: { md: 5 }, pb: { xs: 4, md: 0 },
                borderLeft: { xs: 2, md: 0 }, borderTop: { md: 2 }, borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  position: 'absolute', width: 14, height: 14, borderRadius: '50%',
                  bgcolor: i === milestones.length - 1 ? 'primary.main' : 'background.default',
                  border: 2, borderColor: 'primary.main',
                  left: { xs: -8, md: 0 }, top: { xs: 4, md: -8 },
                }}
              />
              <Typography sx={{ fontWeight: 700, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>{year}</Typography>
              <Typography variant="h6" component="h3" sx={{ mt: 0.5 }}>{L(`journey.cards.${year}.title`)}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontSize: '0.9375rem' }}>
                {L(`journey.cards.${year}.body`)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Section>

      {/* ── Call to action ── */}
      <Box component="section" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems={{ md: 'center' }} justifyContent="space-between">
            <Box sx={{ maxWidth: 640 }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>{L('animatedTitles.0')}</Typography>
              <Typography sx={{ opacity: 0.85, mt: 1.5, fontSize: '1.125rem' }}>{L('note')}</Typography>
            </Box>
            <Button
              size="large"
              endIcon={<ArrowForwardRounded />}
              onClick={join}
              sx={{
                flexShrink: 0, px: 4, bgcolor: 'common.white', color: 'primary.main',
                '&:hover': { bgcolor: (th) => alpha(th.palette.common.white, 0.9) },
              }}
            >
              {joinLabel}
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', pt: { xs: 6, md: 8 }, pb: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.6fr 1fr 1fr' }, gap: 5 }}>
            <Box>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box component="img" src={prajakeeyaLogo} alt="" sx={{ width: 32, height: 32, borderRadius: 2 }} />
                <Typography sx={{ fontWeight: 700 }}>Prajaakeeya</Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2, maxWidth: 360 }}>
                {L('about.compareBody')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {L('footerExplore', { defaultValue: 'Explore' })}
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                {[
                  { label: t('userDashboard.actions.candidates', { defaultValue: 'View Aspirants' }), to: '/guest/aspirants' },
                  { label: t('userDashboard.actions.civicIssues', { defaultValue: 'Public Issues' }), to: '/guest/civic-issues' },
                  { label: t('userDashboard.actions.howUPPWorks', { defaultValue: 'SOP' }), to: '/guest/sop' },
                  { label: L('exploreAsGuest', { defaultValue: 'Explore as guest' }), to: '/guest/dashboard' },
                ].map((l) => (
                  <Link
                    key={l.to}
                    href={l.to}
                    onClick={(e) => { e.preventDefault(); navigate(l.to); }}
                    underline="hover"
                    sx={{ color: 'text.primary', fontSize: '0.9375rem' }}
                  >
                    {l.label}
                  </Link>
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {L('about.quickFactsTitle')}
              </Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                {['founded', 'headquarters', 'ideology'].map((k) => (
                  <Typography key={k} variant="body2">
                    <Box component="span" sx={{ color: 'text.secondary' }}>{L(`about.${k}.label`)}</Box>{' '}
                    {L(`about.${k}.value`)}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Box>
          <Divider sx={{ mt: 6, mb: 1 }} />
          <AuthFooter />
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
