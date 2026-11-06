import { useMemo } from "react";
import {
  InfoOutlined,
  GavelOutlined,
  VerifiedUserOutlined,
  PersonOutlined,
  HowToVoteOutlined,
  GroupOutlined,
  WarningOutlined,
  BlockOutlined,
  ArticleOutlined,
  DoneOutlined,
  BalanceOutlined,
  SecurityOutlined,
  PublicOutlined,
  UpdateOutlined,
  MailOutlined,
  AssignmentOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import LegalDocument from "../components/LegalDocument";
import { Typography } from "@mui/material";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BulletItem {
  text: string;
  sub?: string[];
}

interface TermsSection {
  id: string;
  title: string;
  icon: React.ReactElement;
  subsections?: {
    title: string;
    icon?: React.ReactElement;
    paragraphs?: string[];
    bullets?: BulletItem[];
  }[];
  paragraphs?: string[];
  bullets?: BulletItem[];
}

// ─── Data factory (needs `t` at render time) ──────────────────────────────────

function buildSections(t: TFunction): TermsSection[] {
  const p = "termsAndConditions.sections";
  return [
    {
      id: "1",
      title: t(`${p}.s1.title`),
      icon: <InfoOutlined />,
      paragraphs: [t(`${p}.s1.p1`)],
    },
    {
      id: "2",
      title: t(`${p}.s2.title`),
      icon: <ArticleOutlined />,
      paragraphs: [t(`${p}.s2.p1`)],
      bullets: [
        { text: t(`${p}.s2.b1`) },
        { text: t(`${p}.s2.b2`) },
        { text: t(`${p}.s2.b3`) },
        { text: t(`${p}.s2.b4`) },
        { text: t(`${p}.s2.b5`) },
        { text: t(`${p}.s2.b6`) },
      ],
    },
    {
      id: "3",
      title: t(`${p}.s3.title`),
      icon: <VerifiedUserOutlined />,
      paragraphs: [t(`${p}.s3.p1`)],
      bullets: [
        { text: t(`${p}.s3.b1`) },
        { text: t(`${p}.s3.b2`) },
        { text: t(`${p}.s3.b3`) },
        { text: t(`${p}.s3.b4`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s3.p2`)] }],
    },
    {
      id: "4",
      title: t(`${p}.s4.title`),
      icon: <PersonOutlined />,
      bullets: [
        { text: t(`${p}.s4.b1`) },
        { text: t(`${p}.s4.b2`) },
        { text: t(`${p}.s4.b3`) },
        { text: t(`${p}.s4.b4`) },
        { text: t(`${p}.s4.b5`) },
        { text: t(`${p}.s4.b6`) },
      ],
    },
    {
      id: "5",
      title: t(`${p}.s5.title`),
      icon: <PublicOutlined />,
      paragraphs: [t(`${p}.s5.p1`), t(`${p}.s5.p2`)],
      bullets: [
        { text: t(`${p}.s5.b1`) },
        { text: t(`${p}.s5.b2`) },
        { text: t(`${p}.s5.b3`) },
        { text: t(`${p}.s5.b4`) },
        { text: t(`${p}.s5.b5`) },
        { text: t(`${p}.s5.b6`) },
        { text: t(`${p}.s5.b7`) },
        { text: t(`${p}.s5.b8`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s5.p3`)] }],
    },
    {
      id: "6",
      title: t(`${p}.s6.title`),
      icon: <BalanceOutlined />,
      bullets: [
        { text: t(`${p}.s6.b1`) },
        { text: t(`${p}.s6.b2`) },
        { text: t(`${p}.s6.b3`) },
        { text: t(`${p}.s6.b4`) },
        { text: t(`${p}.s6.b5`) },
        { text: t(`${p}.s6.b6`) },
      ],
    },
    {
      id: "7",
      title: t(`${p}.s7.title`),
      icon: <GroupOutlined />,
      paragraphs: [t(`${p}.s7.p1`)],
      subsections: [
        {
          title: t(`${p}.s7.sub1.title`),
          bullets: [
            { text: t(`${p}.s7.sub1.b1`) },
            { text: t(`${p}.s7.sub1.b2`) },
            { text: t(`${p}.s7.sub1.b3`) },
            { text: t(`${p}.s7.sub1.b4`) },
            { text: t(`${p}.s7.sub1.b5`) },
          ],
        },
        {
          title: t(`${p}.s7.sub2.title`),
          bullets: [
            { text: t(`${p}.s7.sub2.b1`) },
            { text: t(`${p}.s7.sub2.b2`) },
            { text: t(`${p}.s7.sub2.b3`) },
            { text: t(`${p}.s7.sub2.b4`) },
            { text: t(`${p}.s7.sub2.b5`) },
            { text: t(`${p}.s7.sub2.b6`) },
            { text: t(`${p}.s7.sub2.b7`) },
            { text: t(`${p}.s7.sub2.b8`) },
            { text: t(`${p}.s7.sub2.b9`) },
            { text: t(`${p}.s7.sub2.b10`) },
          ],
        },
      ],
    },
    {
      id: "8",
      title: t(`${p}.s8.title`),
      icon: <PersonOutlined />,
      paragraphs: [t(`${p}.s8.p1`)],
      bullets: [
        { text: t(`${p}.s8.b1`) },
        { text: t(`${p}.s8.b2`) },
        { text: t(`${p}.s8.b3`) },
        { text: t(`${p}.s8.b4`) },
        { text: t(`${p}.s8.b5`) },
        { text: t(`${p}.s8.b6`) },
        { text: t(`${p}.s8.b7`) },
      ],
    },
    {
      id: "9",
      title: t(`${p}.s9.title`),
      icon: <WarningOutlined />,
      paragraphs: [t(`${p}.s9.p1`), t(`${p}.s9.p2`)],
      bullets: [
        { text: t(`${p}.s9.b1`) },
        { text: t(`${p}.s9.b2`) },
        { text: t(`${p}.s9.b3`) },
        { text: t(`${p}.s9.b4`) },
        { text: t(`${p}.s9.b5`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s9.p3`)] }],
    },
    {
      id: "10",
      title: t(`${p}.s10.title`),
      icon: <ArticleOutlined />,
      subsections: [
        {
          title: t(`${p}.s10.sub1.title`),
          bullets: [
            { text: t(`${p}.s10.sub1.b1`) },
            { text: t(`${p}.s10.sub1.b2`) },
            { text: t(`${p}.s10.sub1.b3`) },
          ],
        },
        {
          title: t(`${p}.s10.sub2.title`),
          bullets: [
            { text: t(`${p}.s10.sub2.b1`) },
            { text: t(`${p}.s10.sub2.b2`) },
            { text: t(`${p}.s10.sub2.b3`) },
          ],
        },
      ],
    },
    {
      id: "11",
      title: t(`${p}.s11.title`),
      icon: <HowToVoteOutlined />,
      bullets: [
        { text: t(`${p}.s11.b1`) },
        { text: t(`${p}.s11.b2`) },
        { text: t(`${p}.s11.b3`) },
        { text: t(`${p}.s11.b4`) },
        { text: t(`${p}.s11.b5`) },
        { text: t(`${p}.s11.b6`) },
        { text: t(`${p}.s11.b7`) },
      ],
    },
    {
      id: "12",
      title: t(`${p}.s12.title`),
      icon: <SecurityOutlined />,
      paragraphs: [t(`${p}.s12.p1`)],
      bullets: [
        { text: t(`${p}.s12.b1`) },
        { text: t(`${p}.s12.b2`) },
        { text: t(`${p}.s12.b3`) },
        { text: t(`${p}.s12.b4`) },
        { text: t(`${p}.s12.b5`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s12.p2`)] }],
    },
    {
      id: "13",
      title: t(`${p}.s13.title`),
      icon: <BlockOutlined />,
      paragraphs: [t(`${p}.s13.p1`)],
      bullets: [
        { text: t(`${p}.s13.b1`) },
        { text: t(`${p}.s13.b2`) },
        { text: t(`${p}.s13.b3`) },
        { text: t(`${p}.s13.b4`) },
        { text: t(`${p}.s13.b5`) },
        { text: t(`${p}.s13.b6`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s13.p2`)] }],
    },
    {
      id: "14",
      title: t(`${p}.s14.title`),
      icon: <GavelOutlined />,
      paragraphs: [t(`${p}.s14.p1`)],
      bullets: [
        { text: t(`${p}.s14.b1`) },
        { text: t(`${p}.s14.b2`) },
        { text: t(`${p}.s14.b3`) },
        { text: t(`${p}.s14.b4`) },
        { text: t(`${p}.s14.b5`) },
        { text: t(`${p}.s14.b6`) },
      ],
    },
    {
      id: "15",
      title: t(`${p}.s15.title`),
      icon: <AssignmentOutlined />,
      paragraphs: [t(`${p}.s15.p1`)],
      bullets: [
        { text: t(`${p}.s15.b1`) },
        { text: t(`${p}.s15.b2`) },
        { text: t(`${p}.s15.b3`) },
        { text: t(`${p}.s15.b4`) },
        { text: t(`${p}.s15.b5`) },
        { text: t(`${p}.s15.b6`) },
      ],
    },
    {
      id: "16",
      title: t(`${p}.s16.title`),
      icon: <SecurityOutlined />,
      paragraphs: [t(`${p}.s16.p1`)],
    },
    {
      id: "17",
      title: t(`${p}.s17.title`),
      icon: <PublicOutlined />,
      paragraphs: [t(`${p}.s17.p1`)],
    },
    {
      id: "18",
      title: t(`${p}.s18.title`),
      icon: <UpdateOutlined />,
      paragraphs: [t(`${p}.s18.p1`)],
    },
    {
      id: "19",
      title: t(`${p}.s19.title`),
      icon: <ArticleOutlined />,
      paragraphs: [t(`${p}.s19.p1`)],
    },
    {
      id: "20",
      title: t(`${p}.s20.title`),
      icon: <DoneOutlined />,
      paragraphs: [t(`${p}.s20.p1`)],
    },
    {
      id: "21",
      title: t(`${p}.s21.title`),
      icon: <BlockOutlined />,
      paragraphs: [t(`${p}.s21.p1`)],
    },
    {
      id: "22",
      title: t(`${p}.s22.title`),
      icon: <BalanceOutlined />,
      paragraphs: [t(`${p}.s22.p1`)],
    },
    {
      id: "23",
      title: t(`${p}.s23.title`),
      icon: <MailOutlined />,
      paragraphs: [t(`${p}.s23.p1`)],
      bullets: [{ text: t(`${p}.s23.b1`) }, { text: t(`${p}.s23.b2`) }],
      subsections: [{ title: "", paragraphs: [t(`${p}.s23.p2`)] }],
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

export default function TermsAndConditionsPage() {
  const { t } = useTranslation();
  // Build sections from translations (re-computed when language changes)
  const sections = useMemo(() => buildSections(t), [t]);

  return (
    <LegalDocument
      title={t("termsAndConditions.hero.title")}
      subtitle={t("termsAndConditions.hero.association")}
      meta={t("termsAndConditions.hero.effectiveDate")}
      intro={
        <>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.75, mb: 1.5 }}>{t("termsAndConditions.hero.intro")}</Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.75 }}>{t("termsAndConditions.hero.affiliation")}</Typography>
        </>
      }
      sections={sections}
      copyright={t("termsAndConditions.footer.copyright", { year: new Date().getFullYear() })}
    />
  );
}
