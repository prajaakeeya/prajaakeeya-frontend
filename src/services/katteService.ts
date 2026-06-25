/**
 * katteService.ts
 *
 * Katte (ಕಟ್ಟೆ) — the civic discussion forum service.
 *
 * Currently backed by in-memory + localStorage mock data.
 * When the backend gains Katte-thread endpoints, replace the mock
 * helpers with real apiClient calls while keeping the same interfaces.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type KatteCategory =
  | 'government'
  | 'local'
  | 'elections'
  | 'infrastructure'
  | 'social'
  | 'environment';

export type KatteAuthorRole = 'citizen' | 'karyakarta';

export interface KatteAuthor {
  id: number;
  name: string;
  role: KatteAuthorRole;
  avatarInitial: string;
}

export interface KatteThread {
  id: string;
  title: string;
  description: string;
  category: KatteCategory;
  author: KatteAuthor;
  upvotes: number;
  downvotes: number;
  interest: number; // separate "Interested" counter — triggers petition at 100000+
  commentCount: number;
  createdAt: string; // ISO date string
  isPetitionable: boolean; // computed: interest >= 100000
  tags?: string[];
}

export interface CreateKatteThreadPayload {
  title: string;
  description: string;
  category: KatteCategory;
}

// ─── Petition threshold ───────────────────────────────────────────────────────
export const PETITION_THRESHOLD = 100000;

// ─── Category meta ────────────────────────────────────────────────────────────
export const KATTE_CATEGORIES: Record<
  KatteCategory,
  { label: string; labelKn: string; color: string }
> = {
  government: { label: 'Government Schemes', labelKn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', color: '#C8180A' },
  local:       { label: 'Local Issues',       labelKn: 'ಸ್ಥಳೀಯ ಸಮಸ್ಯೆಗಳು',     color: '#253A9A' },
  elections:   { label: 'Elections',          labelKn: 'ಚುನಾವಣೆಗಳು',           color: '#22c55e' },
  infrastructure: { label: 'Infrastructure', labelKn: 'ಮೂಲಸೌಕರ್ಯ',             color: '#F5A800' },
  social:      { label: 'Social',             labelKn: 'ಸಾಮಾಜಿಕ',               color: '#8B5CF6' },
  environment: { label: 'Environment',        labelKn: 'ಪರಿಸರ',                 color: '#10B981' },
};

// ─── Seed mock data ───────────────────────────────────────────────────────────

const SEED_THREADS: KatteThread[] = [
  {
    id: 'katte-1',
    title: 'New Ayushman Bharat Health Scheme — Is it reaching rural areas?',
    description:
      'The government announced expansion of Ayushman Bharat to cover 60 crore citizens. But ground reports from our ward show hospitals still not empanelled. What is your experience? Is this scheme actually working or is it just on paper?',
    category: 'government',
    author: { id: 101, name: 'Ramesh Gowda', role: 'citizen', avatarInitial: 'R' },
    upvotes: 3842,
    downvotes: 412,
    interest: 112500,
    commentCount: 287,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isPetitionable: true,
    tags: ['health', 'scheme', 'rural'],
  },
  {
    id: 'katte-2',
    title: 'Ward 47 road crater — 6 months and no repair in sight',
    description:
      'The main road near the market has a huge crater that has caused 3 accidents this month alone. The corporation says budget is pending. This is unacceptable. We need to collectively raise our voices.',
    category: 'local',
    author: { id: 202, name: 'Priya Shankar', role: 'karyakarta', avatarInitial: 'P' },
    upvotes: 5621,
    downvotes: 89,
    interest: 78432,
    commentCount: 534,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isPetitionable: false,
    tags: ['roads', 'infrastructure', 'ward47'],
  },
  {
    id: 'katte-3',
    title: 'EVM Security — Are our votes truly safe?',
    description:
      'With the upcoming elections, there are widespread concerns about EVM tampering. Should India go back to paper ballots? I have spoken with 3 candidates from our assembly who have differing opinions. Let us discuss openly.',
    category: 'elections',
    author: { id: 303, name: 'Suresh Hegde', role: 'karyakarta', avatarInitial: 'S' },
    upvotes: 9102,
    downvotes: 2341,
    interest: 145200,
    commentCount: 892,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isPetitionable: true,
    tags: ['elections', 'EVM', 'democracy'],
  },
  {
    id: 'katte-4',
    title: 'Cauvery water sharing — Karnataka\'s side of the story',
    description:
      'The Supreme Court order on Cauvery water sharing is impacting farmers in Mandya and Mysuru severely. Our political representatives have not spoken clearly. Is the government doing enough to protect Karnataka farmers?',
    category: 'environment',
    author: { id: 404, name: 'Lakshmi Narayana', role: 'citizen', avatarInitial: 'L' },
    upvotes: 6780,
    downvotes: 930,
    interest: 89300,
    commentCount: 445,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isPetitionable: false,
    tags: ['cauvery', 'farmers', 'water'],
  },
  {
    id: 'katte-5',
    title: 'Free bus travel for women — 1 year later, has it helped?',
    description:
      'The Shakti scheme gave free bus travel to women. One year on, let us evaluate: has it increased women\'s mobility? Has it helped working women and students? Or has it strained KSRTC finances beyond repair?',
    category: 'social',
    author: { id: 505, name: 'Deepa Reddy', role: 'citizen', avatarInitial: 'D' },
    upvotes: 4256,
    downvotes: 654,
    interest: 65400,
    commentCount: 312,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isPetitionable: false,
    tags: ['women', 'KSRTC', 'shakti'],
  },
  {
    id: 'katte-6',
    title: 'New Metro line Phase 3 — Will it actually reach Yelahanka?',
    description:
      'The Phase 3 announcement came with much fanfare but the alignment map shows Yelahanka is still not covered. Thousands of commuters are waiting. When will the outskirts of Bengaluru get metro connectivity?',
    category: 'infrastructure',
    author: { id: 606, name: 'Anand Kumar', role: 'karyakarta', avatarInitial: 'A' },
    upvotes: 7843,
    downvotes: 321,
    interest: 103200,
    commentCount: 621,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isPetitionable: true,
    tags: ['metro', 'bengaluru', 'transport'],
  },
];

// ─── localStorage persistence helpers ────────────────────────────────────────

const LS_KEY = 'katte_threads_v1';
const LS_VOTES_KEY = 'katte_user_votes_v1';

function loadThreads(): KatteThread[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as KatteThread[];
      // Merge any new seed threads not yet in storage
      const ids = new Set(parsed.map((t) => t.id));
      const merged = [...parsed];
      for (const seed of SEED_THREADS) {
        if (!ids.has(seed.id)) merged.push(seed);
      }
      return merged;
    }
  } catch {
    // ignore
  }
  // First load — seed and persist
  localStorage.setItem(LS_KEY, JSON.stringify(SEED_THREADS));
  return [...SEED_THREADS];
}

function saveThreads(threads: KatteThread[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(threads));
  } catch {
    // ignore quota errors
  }
}

/** User's vote state per thread: 'up' | 'down' | null */
type VoteState = Record<string, 'up' | 'down' | null>;

function loadVotes(): VoteState {
  try {
    const raw = localStorage.getItem(LS_VOTES_KEY);
    if (raw) return JSON.parse(raw) as VoteState;
  } catch {
    // ignore
  }
  return {};
}

function saveVotes(votes: VoteState): void {
  try {
    localStorage.setItem(LS_VOTES_KEY, JSON.stringify(votes));
  } catch {
    // ignore
  }
}

// ─── Interest tracking ────────────────────────────────────────────────────────
const LS_INTEREST_KEY = 'katte_user_interest_v1';

function loadInterests(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_INTEREST_KEY);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    // ignore
  }
  return {};
}

function saveInterests(interests: Record<string, boolean>): void {
  try {
    localStorage.setItem(LS_INTEREST_KEY, JSON.stringify(interests));
  } catch {
    // ignore
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getDiscussions(category?: KatteCategory | 'all'): KatteThread[] {
  const threads = loadThreads();
  const filtered =
    !category || category === 'all'
      ? threads
      : threads.filter((t) => t.category === category);
  return filtered
    .map((t) => ({ ...t, isPetitionable: t.interest >= PETITION_THRESHOLD }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createDiscussion(
  payload: CreateKatteThreadPayload,
  author: KatteAuthor
): KatteThread {
  const threads = loadThreads();
  const newThread: KatteThread = {
    id: `katte-${Date.now()}`,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    author,
    upvotes: 0,
    downvotes: 0,
    interest: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    isPetitionable: false,
  };
  threads.unshift(newThread);
  saveThreads(threads);
  return newThread;
}

export function voteDiscussion(
  threadId: string,
  direction: 'up' | 'down'
): { thread: KatteThread; userVote: 'up' | 'down' | null } {
  const threads = loadThreads();
  const votes = loadVotes();
  const idx = threads.findIndex((t) => t.id === threadId);
  if (idx === -1) throw new Error('Thread not found');

  const thread = { ...threads[idx] };
  const prev = votes[threadId] ?? null;

  if (prev === direction) {
    // toggle off
    if (direction === 'up') thread.upvotes = Math.max(0, thread.upvotes - 1);
    else thread.downvotes = Math.max(0, thread.downvotes - 1);
    votes[threadId] = null;
  } else {
    // undo previous vote
    if (prev === 'up') thread.upvotes = Math.max(0, thread.upvotes - 1);
    if (prev === 'down') thread.downvotes = Math.max(0, thread.downvotes - 1);
    // apply new vote
    if (direction === 'up') thread.upvotes += 1;
    else thread.downvotes += 1;
    votes[threadId] = direction;
  }

  thread.isPetitionable = thread.interest >= PETITION_THRESHOLD;
  threads[idx] = thread;
  saveThreads(threads);
  saveVotes(votes);
  return { thread, userVote: votes[threadId] ?? null };
}

export function expressInterest(
  threadId: string
): { thread: KatteThread; isInterested: boolean } {
  const threads = loadThreads();
  const interests = loadInterests();
  const idx = threads.findIndex((t) => t.id === threadId);
  if (idx === -1) throw new Error('Thread not found');

  const thread = { ...threads[idx] };
  const was = interests[threadId] ?? false;

  if (was) {
    thread.interest = Math.max(0, thread.interest - 1);
    interests[threadId] = false;
  } else {
    thread.interest += 1;
    interests[threadId] = true;
  }

  thread.isPetitionable = thread.interest >= PETITION_THRESHOLD;
  threads[idx] = thread;
  saveThreads(threads);
  saveInterests(interests);
  return { thread, isInterested: !was };
}

export function getUserVotes(): VoteState {
  return loadVotes();
}

export function getUserInterests(): Record<string, boolean> {
  return loadInterests();
}

export function formatInterest(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
