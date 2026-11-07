import LegalDocument from '../components/LegalDocument';
import {
    ShieldOutlined, ReportProblemOutlined,
    EmailOutlined, GavelOutlined, ChildCareOutlined,
    BlockOutlined, SecurityOutlined, VerifiedUserOutlined,
} from '@mui/icons-material';

interface SafetySection {
    id: string;
    title: string;
    icon: React.ReactElement;
    paragraphs: string[];
    bullets?: string[];
}

const sections: SafetySection[] = [
    {
        id: '1',
        title: '1. Our Commitment',
        icon: <ShieldOutlined />,
        paragraphs: [
            'Prajaakeeya is committed to creating a safe environment for all users, including children. We maintain a zero-tolerance policy towards Child Sexual Abuse and Exploitation (CSAE) content on our platform.',
            'We comply with all applicable Indian laws, including the Protection of Children from Sexual Offences (POCSO) Act, 2012, the Information Technology Act, 2000, and Google Play\'s Child Safety policies.',
        ],
    },
    {
        id: '2',
        title: '2. Prohibited Content and Conduct',
        icon: <BlockOutlined />,
        paragraphs: [
            'The following content and conduct are strictly prohibited on Prajaakeeya:',
        ],
        bullets: [
            'Any content that sexually exploits or endangers children',
            'Sharing, distributing, or promoting Child Sexual Abuse Material (CSAM)',
            'Grooming or solicitation of minors for sexual purposes',
            'Any content that depicts, encourages, or promotes abuse of children',
            'Sextortion or blackmail involving minors',
            'Trafficking of minors in any form',
            'Any attempt to collect personal information from children for exploitative purposes',
        ],
    },
    {
        id: '3',
        title: '3. Detection and Prevention',
        icon: <SecurityOutlined />,
        paragraphs: [
            'We employ the following measures to detect and prevent CSAE on our platform:',
        ],
        bullets: [
            'Content moderation and review of user-generated content',
            'User reporting mechanisms for flagging inappropriate content',
            'Prompt review and action on all reports related to child safety',
            'Cooperation with law enforcement agencies when required',
        ],
    },
    {
        id: '4',
        title: '4. Reporting and Enforcement',
        icon: <ReportProblemOutlined />,
        paragraphs: [
            'If you encounter any content or behaviour on Prajaakeeya that endangers children or constitutes CSAE, please report it immediately through any of the following channels:',
        ],
        bullets: [
            'Email: support@prajaakeeya.org',
            'In-app reporting feature',
            'Contact local law enforcement or Childline India (Dial 1098)',
            'Report to the National Commission for Protection of Child Rights (NCPCR) at https://ncpcr.gov.in',
        ],
    },
    {
        id: '5',
        title: '5. Actions Taken Against Violations',
        icon: <GavelOutlined />,
        paragraphs: [
            'Upon identification of CSAE content or conduct, Prajaakeeya will take the following actions:',
        ],
        bullets: [
            'Immediate removal of the offending content',
            'Permanent ban of the offending user account',
            'Preservation of relevant evidence for law enforcement',
            'Reporting to the Indian Cyber Crime Coordination Centre (I4C) and relevant authorities',
            'Reporting to the National Center for Missing & Exploited Children (NCMEC) as applicable',
            'Full cooperation with law enforcement investigations',
        ],
    },
    {
        id: '6',
        title: '6. Child User Safety',
        icon: <ChildCareOutlined />,
        paragraphs: [
            'Prajaakeeya is designed for users aged 18 and above. We do not knowingly collect personal information from children under 18 years of age. If we discover that a child under 18 has provided us with personal information, we will delete such information from our servers immediately.',
        ],
    },
    {
        id: '7',
        title: '7. Training and Awareness',
        icon: <VerifiedUserOutlined />,
        paragraphs: [
            'Our team is trained to identify and respond to CSAE content. We continuously update our policies and practices to align with the latest child safety standards and legal requirements.',
        ],
    },
    {
        id: '8',
        title: '8. Contact Information',
        icon: <EmailOutlined />,
        paragraphs: [
            'For any questions, concerns, or reports related to child safety on Prajaakeeya, please contact us:',
        ],
        bullets: [
            'Email: support@prajaakeeya.org',
            'Organization: Prajaakeeya',
            'Website: https://prajaakeeya.org',
        ],
    },
];

export default function ChildSafetyPage() {
    return (
        <LegalDocument
            title="Child Safety Standards"
            subtitle="Prajaakeeya - Standards Against Child Sexual Abuse and Exploitation (CSAE)"
            meta="Effective Date: March 28, 2026"
            sections={sections}
            copyright={`© ${new Date().getFullYear()} Prajaakeeya. All rights reserved.`}
        />
    );
}
