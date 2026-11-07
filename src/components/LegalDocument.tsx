import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Container, Divider, Link, Stack, Typography } from '@mui/material';
import PublicTopBar from './PublicTopBar';
import AuthFooter from './AuthFooter';

export interface LegalBullet {
  text: string;
  sub?: string[];
}

export interface LegalSection {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: (string | LegalBullet)[];
  subsections?: { title?: string; paragraphs?: string[]; bullets?: (string | LegalBullet)[] }[];
}

interface LegalDocumentProps {
  title: string;
  /** Line under the title (organisation / scope). */
  subtitle?: ReactNode;
  /** Effective date and similar metadata. */
  meta?: ReactNode;
  /** Introductory paragraphs shown before the sections. */
  intro?: ReactNode;
  sections: LegalSection[];
  copyright?: ReactNode;
}

const Body = ({ children }: { children: ReactNode }) => (
  <Typography sx={{ color: 'text.secondary', lineHeight: 1.75, mb: 1.5, fontSize: '0.9375rem' }}>{children}</Typography>
);

const Bullets = ({ items }: { items: (string | LegalBullet)[] }) => (
  <Box component="ul" sx={{ pl: 2.5, my: 1, '& li': { color: 'text.secondary', lineHeight: 1.75, mb: 0.75, fontSize: '0.9375rem' } }}>
    {items.map((item, i) => {
      const b = typeof item === 'string' ? { text: item } : item;
      return (
        <li key={i}>
          {b.text}
          {b.sub && (
            <Box component="ul" sx={{ pl: 2.5, mt: 0.5, listStyleType: 'circle' }}>
              {b.sub.map((s, j) => <li key={j}>{s}</li>)}
            </Box>
          )}
        </li>
      );
    })}
  </Box>
);

/** Document-style layout for policy pages: header, table of contents, sections. */
export default function LegalDocument({ title, subtitle, meta, intro, sections, copyright }: LegalDocumentProps) {
  const { t } = useTranslation();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PublicTopBar />

      <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 16 }, pb: 6 }}>
        <Box sx={{ maxWidth: 760 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.75rem' } }}>{title}</Typography>
          {subtitle && <Typography sx={{ mt: 1.5, fontSize: '1.0625rem', fontWeight: 500 }}>{subtitle}</Typography>}
          {meta && <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>{meta}</Typography>}
          {intro && <Box sx={{ mt: 3 }}>{intro}</Box>}
        </Box>

        <Divider sx={{ my: { xs: 4, md: 6 } }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' }, gap: { md: 8 } }}>
          {/* Table of contents */}
          <Box component="nav" aria-label={t('common.contents', { defaultValue: 'Contents' })} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Stack spacing={1.25} sx={{ position: 'sticky', top: 96 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('common.contents', { defaultValue: 'Contents' })}</Typography>
              {sections.map((s) => (
                <Link
                  key={s.id}
                  href={`#section-${s.id}`}
                  underline="none"
                  sx={{ color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.4, '&:hover': { color: 'text.primary' } }}
                >
                  {s.title}
                </Link>
              ))}
            </Stack>
          </Box>

          <Box sx={{ maxWidth: 760 }}>
            {sections.map((section, idx) => (
              <Box
                component="section"
                id={`section-${section.id}`}
                key={section.id}
                sx={{ scrollMarginTop: 88, pt: idx ? 5 : 0 }}
              >
                <Typography variant="h5" component="h2" sx={{ mb: 2 }}>{section.title}</Typography>
                {section.paragraphs?.map((p, i) => <Body key={i}>{p}</Body>)}
                {section.bullets && <Bullets items={section.bullets} />}
                {section.subsections?.map((sub, i) => (
                  <Box key={i} sx={{ mt: sub.title ? 3 : 1 }}>
                    {sub.title && (
                      <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mb: 1 }}>{sub.title}</Typography>
                    )}
                    {sub.paragraphs?.map((p, j) => <Body key={j}>{p}</Body>)}
                    {sub.bullets && <Bullets items={sub.bullets} />}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ mt: 8, mb: 2 }} />
        {copyright && (
          <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center' }}>{copyright}</Typography>
        )}
        <AuthFooter />
      </Container>
    </Box>
  );
}
