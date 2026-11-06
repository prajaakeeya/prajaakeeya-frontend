import { useMemo } from "react";
import {
  InfoOutlined,
  HandshakeOutlined,
  VerifiedUserOutlined,
  PersonOutlined,
  ChatOutlined,
  HowToVoteOutlined,
  GroupOutlined,
  WarningOutlined,
  BlockOutlined,
  ArticleOutlined,
  FlagOutlined,
  MediationOutlined,
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

interface GuidelinesSection {
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

function buildSections(t: TFunction): GuidelinesSection[] {
  const p = "communityGuidelines.sections";
  return [
    {
      id: "1",
      title: t(`${p}.s1.title`),
      icon: <InfoOutlined />,
      paragraphs: [t(`${p}.s1.p1`), t(`${p}.s1.p2`), t(`${p}.s1.p3`)],
    },
    {
      id: "2",
      title: t(`${p}.s2.title`),
      icon: <AssignmentOutlined />,
      paragraphs: [t(`${p}.s2.p1`)],
      bullets: [
        { text: t(`${p}.s2.b1`) },
        { text: t(`${p}.s2.b2`) },
        { text: t(`${p}.s2.b3`) },
        { text: t(`${p}.s2.b4`) },
        { text: t(`${p}.s2.b5`) },
      ],
    },
    {
      id: "3",
      title: t(`${p}.s3.title`),
      icon: <PersonOutlined />,
      subsections: [
        {
          title: t(`${p}.s3.ss1.title`),
          bullets: [
            { text: t(`${p}.s3.ss1.b1`) },
            { text: t(`${p}.s3.ss1.b2`) },
            { text: t(`${p}.s3.ss1.b3`) },
            { text: t(`${p}.s3.ss1.b4`) },
            { text: t(`${p}.s3.ss1.b5`) },
          ],
        },
        {
          title: t(`${p}.s3.ss2.title`),
          bullets: [
            { text: t(`${p}.s3.ss2.b1`) },
            { text: t(`${p}.s3.ss2.b2`) },
            { text: t(`${p}.s3.ss2.b3`) },
            { text: t(`${p}.s3.ss2.b4`) },
            { text: t(`${p}.s3.ss2.b5`) },
          ],
        },
        {
          title: t(`${p}.s3.ss3.title`),
          bullets: [
            { text: t(`${p}.s3.ss3.b1`) },
            { text: t(`${p}.s3.ss3.b2`) },
            { text: t(`${p}.s3.ss3.b3`) },
            { text: t(`${p}.s3.ss3.b4`) },
            { text: t(`${p}.s3.ss3.b5`) },
          ],
        },
      ],
    },
    {
      id: "4",
      title: t(`${p}.s4.title`),
      icon: <VerifiedUserOutlined />,
      subsections: [
        {
          title: t(`${p}.s4.ss1.title`),
          bullets: [
            { text: t(`${p}.s4.ss1.b1`) },
            { text: t(`${p}.s4.ss1.b2`) },
            { text: t(`${p}.s4.ss1.b3`) },
            { text: t(`${p}.s4.ss1.b4`) },
            { text: t(`${p}.s4.ss1.b5`) },
          ],
        },
        {
          title: t(`${p}.s4.ss2.title`),
          bullets: [
            { text: t(`${p}.s4.ss2.b1`) },
            { text: t(`${p}.s4.ss2.b2`) },
            { text: t(`${p}.s4.ss2.b3`) },
            { text: t(`${p}.s4.ss2.b4`) },
            { text: t(`${p}.s4.ss2.b5`) },
          ],
        },
        {
          title: t(`${p}.s4.ss3.title`),
          bullets: [
            { text: t(`${p}.s4.ss3.b1`) },
            { text: t(`${p}.s4.ss3.b2`) },
            { text: t(`${p}.s4.ss3.b3`) },
            { text: t(`${p}.s4.ss3.b4`) },
            { text: t(`${p}.s4.ss3.b5`) },
          ],
        },
      ],
    },
    {
      id: "5",
      title: t(`${p}.s5.title`),
      icon: <BlockOutlined />,
      paragraphs: [t(`${p}.s5.p1`)],
      subsections: [
        {
          title: t(`${p}.s5.ss1.title`),
          bullets: [
            { text: t(`${p}.s5.ss1.b1`) },
            { text: t(`${p}.s5.ss1.b2`) },
            { text: t(`${p}.s5.ss1.b3`) },
          ],
        },
        {
          title: t(`${p}.s5.ss2.title`),
          bullets: [
            { text: t(`${p}.s5.ss2.b1`) },
            { text: t(`${p}.s5.ss2.b2`) },
            { text: t(`${p}.s5.ss2.b3`) },
            { text: t(`${p}.s5.ss2.b4`) },
            { text: t(`${p}.s5.ss2.b5`) },
          ],
        },
        {
          title: t(`${p}.s5.ss3.title`),
          bullets: [
            { text: t(`${p}.s5.ss3.b1`) },
            { text: t(`${p}.s5.ss3.b2`) },
            { text: t(`${p}.s5.ss3.b3`) },
            { text: t(`${p}.s5.ss3.b4`) },
            { text: t(`${p}.s5.ss3.b5`) },
          ],
        },
        {
          title: t(`${p}.s5.ss4.title`),
          bullets: [
            { text: t(`${p}.s5.ss4.b1`) },
            { text: t(`${p}.s5.ss4.b2`) },
            { text: t(`${p}.s5.ss4.b3`) },
            { text: t(`${p}.s5.ss4.b4`) },
            { text: t(`${p}.s5.ss4.b5`) },
          ],
        },
        {
          title: t(`${p}.s5.ss5.title`),
          bullets: [
            { text: t(`${p}.s5.ss5.b1`) },
            { text: t(`${p}.s5.ss5.b2`) },
            { text: t(`${p}.s5.ss5.b3`) },
            { text: t(`${p}.s5.ss5.b4`) },
            { text: t(`${p}.s5.ss5.b5`) },
          ],
        },
        {
          title: t(`${p}.s5.ss6.title`),
          bullets: [
            { text: t(`${p}.s5.ss6.b1`) },
            { text: t(`${p}.s5.ss6.b2`) },
            { text: t(`${p}.s5.ss6.b3`) },
            { text: t(`${p}.s5.ss6.b4`) },
          ],
        },
        {
          title: t(`${p}.s5.ss7.title`),
          bullets: [
            { text: t(`${p}.s5.ss7.b1`) },
            { text: t(`${p}.s5.ss7.b2`) },
            { text: t(`${p}.s5.ss7.b3`) },
            { text: t(`${p}.s5.ss7.b4`) },
            { text: t(`${p}.s5.ss7.b5`) },
          ],
        },
      ],
    },
    {
      id: "6",
      title: t(`${p}.s6.title`),
      icon: <ChatOutlined />,
      paragraphs: [t(`${p}.s6.p1`)],
      subsections: [
        {
          title: t(`${p}.s6.ss1.title`),
          bullets: [
            { text: t(`${p}.s6.ss1.b1`) },
            { text: t(`${p}.s6.ss1.b2`) },
            { text: t(`${p}.s6.ss1.b3`) },
            { text: t(`${p}.s6.ss1.b4`) },
            { text: t(`${p}.s6.ss1.b5`) },
            { text: t(`${p}.s6.ss1.b6`) },
          ],
        },
        {
          title: t(`${p}.s6.ss2.title`),
          bullets: [
            { text: t(`${p}.s6.ss2.b1`) },
            { text: t(`${p}.s6.ss2.b2`) },
            { text: t(`${p}.s6.ss2.b3`) },
            { text: t(`${p}.s6.ss2.b4`) },
            { text: t(`${p}.s6.ss2.b5`) },
            { text: t(`${p}.s6.ss2.b6`) },
          ],
        },
      ],
    },
    {
      id: "7",
      title: t(`${p}.s7.title`),
      icon: <ArticleOutlined />,
      subsections: [
        {
          title: t(`${p}.s7.ss1.title`),
          bullets: [
            { text: t(`${p}.s7.ss1.b1`) },
            { text: t(`${p}.s7.ss1.b2`) },
            { text: t(`${p}.s7.ss1.b3`) },
            { text: t(`${p}.s7.ss1.b4`) },
            { text: t(`${p}.s7.ss1.b5`) },
          ],
        },
        {
          title: t(`${p}.s7.ss2.title`),
          bullets: [
            { text: t(`${p}.s7.ss2.b1`) },
            { text: t(`${p}.s7.ss2.b2`) },
            { text: t(`${p}.s7.ss2.b3`) },
            { text: t(`${p}.s7.ss2.b4`) },
            { text: t(`${p}.s7.ss2.b5`) },
          ],
        },
      ],
    },
    {
      id: "8",
      title: t(`${p}.s8.title`),
      icon: <PublicOutlined />,
      paragraphs: [t(`${p}.s8.p1`)],
      bullets: [
        { text: t(`${p}.s8.b1`) },
        { text: t(`${p}.s8.b2`) },
        { text: t(`${p}.s8.b3`) },
        { text: t(`${p}.s8.b4`) },
        { text: t(`${p}.s8.b5`) },
        { text: t(`${p}.s8.b6`) },
      ],
    },
    {
      id: "9",
      title: t(`${p}.s9.title`),
      icon: <SecurityOutlined />,
      bullets: [
        { text: t(`${p}.s9.b1`) },
        { text: t(`${p}.s9.b2`) },
        { text: t(`${p}.s9.b3`) },
        { text: t(`${p}.s9.b4`) },
        { text: t(`${p}.s9.b5`) },
        { text: t(`${p}.s9.b6`) },
      ],
    },
    {
      id: "10",
      title: t(`${p}.s10.title`),
      icon: <WarningOutlined />,
      paragraphs: [t(`${p}.s10.p1`)],
      subsections: [
        {
          title: t(`${p}.s10.ss1.title`),
          paragraphs: [t(`${p}.s10.ss1.p1`), t(`${p}.s10.ss1.p2`)],
        },
        {
          title: t(`${p}.s10.ss2.title`),
          paragraphs: [t(`${p}.s10.ss2.p1`), t(`${p}.s10.ss2.p2`)],
        },
        {
          title: t(`${p}.s10.ss3.title`),
          paragraphs: [
            t(`${p}.s10.ss3.p1`),
            t(`${p}.s10.ss3.p2`),
            t(`${p}.s10.ss3.p3`),
          ],
        },
        {
          title: t(`${p}.s10.ss4.title`),
          paragraphs: [
            t(`${p}.s10.ss4.p1`),
            t(`${p}.s10.ss4.p2`),
            t(`${p}.s10.ss4.p3`),
          ],
        },
        {
          title: t(`${p}.s10.ss5.title`),
          paragraphs: [t(`${p}.s10.ss5.p1`), t(`${p}.s10.ss5.p2`)],
        },
      ],
    },
    {
      id: "11",
      title: t(`${p}.s11.title`),
      icon: <FlagOutlined />,
      paragraphs: [t(`${p}.s11.p1`), t(`${p}.s11.p2`)],
      bullets: [
        { text: t(`${p}.s11.b1`) },
        { text: t(`${p}.s11.b2`) },
        { text: t(`${p}.s11.b3`) },
        { text: t(`${p}.s11.b4`) },
        { text: t(`${p}.s11.b5`) },
        { text: t(`${p}.s11.b6`) },
        { text: t(`${p}.s11.b7`) },
        { text: t(`${p}.s11.b8`) },
      ],
      subsections: [
        {
          title: "",
          paragraphs: [t(`${p}.s11.p3`)],
        },
      ],
    },
    {
      id: "12",
      title: t(`${p}.s12.title`),
      icon: <MediationOutlined />,
      paragraphs: [t(`${p}.s12.p1`), t(`${p}.s12.p2`)],
      bullets: [
        { text: t(`${p}.s12.b1`) },
        { text: t(`${p}.s12.b2`) },
        { text: t(`${p}.s12.b3`) },
        { text: t(`${p}.s12.b4`) },
      ],
      subsections: [
        {
          title: "",
          paragraphs: [t(`${p}.s12.p3`)],
        },
      ],
    },
    {
      id: "13",
      title: t(`${p}.s13.title`),
      icon: <SecurityOutlined />,
      bullets: [
        { text: t(`${p}.s13.b1`) },
        { text: t(`${p}.s13.b2`) },
        { text: t(`${p}.s13.b3`) },
        { text: t(`${p}.s13.b4`) },
        { text: t(`${p}.s13.b5`) },
      ],
    },
    {
      id: "14",
      title: t(`${p}.s14.title`),
      icon: <GroupOutlined />,
      paragraphs: [t(`${p}.s14.p1`)],
      bullets: [
        { text: t(`${p}.s14.b1`) },
        { text: t(`${p}.s14.b2`) },
        { text: t(`${p}.s14.b3`) },
        { text: t(`${p}.s14.b4`) },
        { text: t(`${p}.s14.b5`) },
      ],
    },
    {
      id: "15",
      title: t(`${p}.s15.title`),
      icon: <UpdateOutlined />,
      paragraphs: [t(`${p}.s15.p1`)],
      bullets: [
        { text: t(`${p}.s15.b1`) },
        { text: t(`${p}.s15.b2`) },
        { text: t(`${p}.s15.b3`) },
        { text: t(`${p}.s15.b4`) },
        { text: t(`${p}.s15.b5`) },
      ],
    },
    {
      id: "16",
      title: t(`${p}.s16.title`),
      icon: <MailOutlined />,
      paragraphs: [t(`${p}.s16.p1`)],
      bullets: [
        { text: t(`${p}.s16.b1`) },
        { text: t(`${p}.s16.b2`) },
        { text: t(`${p}.s16.b3`) },
      ],
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

export default function CommunityGuidelinesPage() {
  const { t } = useTranslation();
  // Build sections from translations (re-computed when language changes)
  const sections = useMemo(() => buildSections(t), [t]);

  return (
    <LegalDocument
      title={t("communityGuidelines.hero.title")}
      subtitle={t("communityGuidelines.hero.association")}
      intro={
        <>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.75, mb: 1.5 }}>{t("communityGuidelines.hero.intro")}</Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.75 }}>{t("communityGuidelines.hero.affiliation")}</Typography>
        </>
      }
      sections={sections}
      copyright={t("communityGuidelines.footer.copyright", { year: new Date().getFullYear() })}
    />
  );
}
