import { useMemo } from "react";
import {
  LockOutlined,
  PeopleOutline,
  PersonAdd,
  LocationOn,
  InfoOutlined,
  ShieldOutlined,
  ReportProblemOutlined,
  ChildCareOutlined,
  UpdateOutlined,
  EmailOutlined,
  BalanceOutlined,
  AssignmentIndOutlined,
  GavelOutlined,
  StorageOutlined,
  CookieOutlined,
  ShareOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import LegalDocument from "../components/LegalDocument";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BulletItem {
  text: string;
  sub?: string[];
}

interface PolicySection {
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

function buildSections(t: TFunction): PolicySection[] {
  const p = "privacyPolicy.sections";
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
      icon: <LockOutlined />,
      subsections: [
        {
          title: t(`${p}.s2.sub21.title`),
          icon: <PeopleOutline />,
          paragraphs: [t(`${p}.s2.sub21.p1`)],
          bullets: [
            { text: t(`${p}.s2.sub21.b1`) },
            { text: t(`${p}.s2.sub21.b2`) },
          ],
        },
        {
          title: t(`${p}.s2.sub22.title`),
          icon: <VerifiedUserOutlined />,
          paragraphs: [t(`${p}.s2.sub22.p1`)],
          bullets: [
            { text: t(`${p}.s2.sub22.b1`) },
            { text: t(`${p}.s2.sub22.b2`) },
            { text: t(`${p}.s2.sub22.b3`) },
            { text: t(`${p}.s2.sub22.b4`) },
            { text: t(`${p}.s2.sub22.b5`) },
            { text: t(`${p}.s2.sub22.b6`) },
            { text: t(`${p}.s2.sub22.b7`) },
          ],
        },
        {
          title: t(`${p}.s2.sub23.title`),
          icon: <PersonAdd />,
          paragraphs: [t(`${p}.s2.sub23.p1`), t(`${p}.s2.sub23.p2`)],
        },
      ],
    },
    {
      id: "3",
      title: t(`${p}.s3.title`),
      icon: <InfoOutlined />,
      paragraphs: [t(`${p}.s3.p1`)],
      bullets: [
        { text: t(`${p}.s3.b1`) },
        { text: t(`${p}.s3.b2`) },
        { text: t(`${p}.s3.b3`) },
        { text: t(`${p}.s3.b4`) },
        { text: t(`${p}.s3.b5`) },
        { text: t(`${p}.s3.b6`) },
        { text: t(`${p}.s3.b7`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s3.p2`)] }],
    },
    {
      id: "4",
      title: t(`${p}.s4.title`),
      icon: <LocationOn />,
      paragraphs: [t(`${p}.s4.p1`)],
      bullets: [
        { text: t(`${p}.s4.b1`) },
        { text: t(`${p}.s4.b2`) },
        { text: t(`${p}.s4.b3`) },
        { text: t(`${p}.s4.b4`) },
        { text: t(`${p}.s4.b5`) },
        { text: t(`${p}.s4.b6`) },
        { text: t(`${p}.s4.b7`) },
        { text: t(`${p}.s4.b8`) },
      ],
      subsections: [
        { title: "", paragraphs: [t(`${p}.s4.p2`), t(`${p}.s4.p3`)] },
      ],
    },
    {
      id: "5",
      title: t(`${p}.s5.title`),
      icon: <ShieldOutlined />,
      paragraphs: [t(`${p}.s5.p1`)],
      bullets: [
        { text: t(`${p}.s5.b1`) },
        { text: t(`${p}.s5.b2`) },
        { text: t(`${p}.s5.b3`) },
        { text: t(`${p}.s5.b4`) },
        { text: t(`${p}.s5.b5`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s5.p2`)] }],
    },
    {
      id: "6",
      title: t(`${p}.s6.title`),
      icon: <ShareOutlined />,
      paragraphs: [t(`${p}.s6.p1`)],
      bullets: [
        { text: t(`${p}.s6.b1`) },
        { text: t(`${p}.s6.b2`) },
        { text: t(`${p}.s6.b3`) },
        { text: t(`${p}.s6.b4`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s6.p2`)] }],
    },
    {
      id: "7",
      title: t(`${p}.s7.title`),
      icon: <VerifiedUserOutlined />,
      paragraphs: [t(`${p}.s7.p1`)],
      bullets: [
        { text: t(`${p}.s7.b1`) },
        { text: t(`${p}.s7.b2`) },
        { text: t(`${p}.s7.b3`) },
        { text: t(`${p}.s7.b4`) },
        { text: t(`${p}.s7.b5`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s7.p2`)] }],
    },
    {
      id: "8",
      title: t(`${p}.s8.title`),
      icon: <ReportProblemOutlined />,
      paragraphs: [t(`${p}.s8.p1`)],
      bullets: [
        { text: t(`${p}.s8.b1`) },
        { text: t(`${p}.s8.b2`) },
        { text: t(`${p}.s8.b3`) },
        { text: t(`${p}.s8.b4`) },
        { text: t(`${p}.s8.b5`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s8.p2`)] }],
    },
    {
      id: "9",
      title: t(`${p}.s9.title`),
      icon: <CookieOutlined />,
      paragraphs: [t(`${p}.s9.p1`)],
      bullets: [
        { text: t(`${p}.s9.b1`) },
        { text: t(`${p}.s9.b2`) },
        { text: t(`${p}.s9.b3`) },
        { text: t(`${p}.s9.b4`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s9.p2`)] }],
    },
    {
      id: "10",
      title: t(`${p}.s10.title`),
      icon: <ChildCareOutlined />,
      paragraphs: [t(`${p}.s10.p1`), t(`${p}.s10.p2`)],
    },
    {
      id: "11",
      title: t(`${p}.s11.title`),
      icon: <UpdateOutlined />,
      paragraphs: [t(`${p}.s11.p1`), t(`${p}.s11.p2`)],
    },
    {
      id: "12",
      title: t(`${p}.s12.title`),
      icon: <BalanceOutlined />,
      paragraphs: [
        t(`${p}.s12.p1`),
        t(`${p}.s12.p2`),
        t(`${p}.s12.p3`),
        t(`${p}.s12.p4`),
        t(`${p}.s12.p5`),
        t(`${p}.s12.p6`),
        t(`${p}.s12.p7`),
      ],
    },
    {
      id: "13",
      title: t(`${p}.s13.title`),
      icon: <AssignmentIndOutlined />,
      paragraphs: [t(`${p}.s13.p1`), t(`${p}.s13.p2`)],
      bullets: [
        { text: t(`${p}.s13.b1`) },
        { text: t(`${p}.s13.b2`) },
        { text: t(`${p}.s13.b3`) },
        { text: t(`${p}.s13.b4`) },
        { text: t(`${p}.s13.b5`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s13.p3`)] }],
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
      icon: <StorageOutlined />,
      paragraphs: [t(`${p}.s15.p1`)],
      bullets: [
        { text: t(`${p}.s15.b1`) },
        { text: t(`${p}.s15.b2`) },
        { text: t(`${p}.s15.b3`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s15.p2`)] }],
    },
    {
      id: "16",
      title: t(`${p}.s16.title`),
      icon: <BalanceOutlined />,
      paragraphs: [t(`${p}.s16.p1`)],
    },
    {
      id: "17",
      title: t(`${p}.s17.title`),
      icon: <EmailOutlined />,
      paragraphs: [t(`${p}.s17.p1`)],
      bullets: [
        { text: t(`${p}.s17.b1`) },
        { text: t(`${p}.s17.b2`) },
        { text: t(`${p}.s17.b3`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s17.p2`)] }],
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  // Build sections from translations (re-computed when language changes)
  const sections = useMemo(() => buildSections(t), [t]);

  return (
    <LegalDocument
      title={t("privacyPolicy.hero.title")}
      subtitle={t("privacyPolicy.hero.association")}
      meta={t("privacyPolicy.hero.effectiveDate")}
      sections={sections}
      copyright={t("privacyPolicy.footer.copyright", { year: new Date().getFullYear() })}
    />
  );
}
