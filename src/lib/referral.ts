export const PLATFORM_REFERRAL_CODE = "CORECHAIN";
export const MAX_REFERRAL_LEVELS = 15;

export const REFERRAL_LEVEL_RATES: number[] = [
  5, 3, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
];

export function normalizeReferralCode(value: string | null | undefined) {
  return (value || "").trim().replace(/\s+/g, " ").toUpperCase();
}

export function displayReferralCode(value: string | null | undefined) {
  return (value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function referralRateForLevel(level: number) {
  return REFERRAL_LEVEL_RATES[level - 1] ?? 0;
}

export interface ReferralUserLike {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  referredBy?: string;
  role?: string;
}

export interface ReferralTransactionLike {
  userId: string;
  type: string;
  amount: number;
  status?: string;
  referralLevel?: number;
}

export interface ReferralMember {
  id: string;
  name: string;
  email: string;
  referralCode: string;
}

export interface ReferralUplineMember {
  level: number;
  id: string;
  name: string;
  referralCode: string;
}

export interface ReferralLevelSummary {
  level: number;
  rate: number;
  count: number;
  volume: number;
  earnings: number;
  commissionCount: number;
  members: ReferralMember[];
}

export interface ReferralSummary {
  level: number;
  referredBy: string | null;
  upline: ReferralUplineMember[];
  directCount: number;
  networkCount: number;
  networkVolume: number;
  activeLevels: number;
  deepestLevel: number;
  totalRate: number;
  totalEarnings: number;
  commissionCount: number;
  levels: ReferralLevelSummary[];
}

function toMember(user: ReferralUserLike): ReferralMember {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    referralCode: user.referralCode,
  };
}

export function getUplineChain(
  userId: string,
  users: ReferralUserLike[],
  maxLevels = MAX_REFERRAL_LEVELS
): ReferralUplineMember[] {
  const byCode = new Map<string, ReferralUserLike>();
  for (const user of users) {
    const code = normalizeReferralCode(user.referralCode);
    if (code && !byCode.has(code)) byCode.set(code, user);
  }

  let current = users.find((user) => user.id === userId);
  const seen = new Set<string>([userId]);
  const chain: ReferralUplineMember[] = [];

  while (current && chain.length < maxLevels) {
    const sponsorCode = normalizeReferralCode(current.referredBy);
    if (!sponsorCode) break;
    const sponsor = byCode.get(sponsorCode);
    if (!sponsor || seen.has(sponsor.id)) break;
    seen.add(sponsor.id);
    chain.push({
      level: chain.length + 1,
      id: sponsor.id,
      name: sponsor.name,
      referralCode: sponsor.referralCode,
    });
    current = sponsor;
  }

  return chain;
}

export function summarizeReferralNetwork(
  userId: string,
  users: ReferralUserLike[],
  transactions: ReferralTransactionLike[]
): ReferralSummary {
  const user = users.find((entry) => entry.id === userId);
  const upline = getUplineChain(userId, users);
  const levels: ReferralLevelSummary[] = REFERRAL_LEVEL_RATES.map((rate, index) => ({
    level: index + 1,
    rate,
    count: 0,
    volume: 0,
    earnings: 0,
    commissionCount: 0,
    members: [],
  }));

  const approvedVolumeByUser = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.type !== "DEPOSIT" || transaction.status !== "APPROVED") continue;
    approvedVolumeByUser.set(
      transaction.userId,
      (approvedVolumeByUser.get(transaction.userId) || 0) + transaction.amount
    );
  }

  const childrenBySponsor = new Map<string, ReferralUserLike[]>();
  for (const entry of users) {
    if (entry.id === userId) continue;
    const sponsorCode = normalizeReferralCode(entry.referredBy);
    if (!sponsorCode) continue;
    const list = childrenBySponsor.get(sponsorCode) || [];
    list.push(entry);
    childrenBySponsor.set(sponsorCode, list);
  }

  const seen = new Set<string>([userId]);
  let frontier: ReferralUserLike[] = user ? [user] : [];

  for (let level = 1; level <= MAX_REFERRAL_LEVELS && frontier.length > 0; level += 1) {
    const next: ReferralUserLike[] = [];
    for (const parent of frontier) {
      const children = childrenBySponsor.get(normalizeReferralCode(parent.referralCode)) || [];
      for (const child of children) {
        if (seen.has(child.id)) continue;
        seen.add(child.id);
        next.push(child);
      }
    }
    if (next.length === 0) break;
    const summary = levels[level - 1];
    summary.members = next.map(toMember);
    summary.count = next.length;
    summary.volume =
      Math.round(
        next.reduce((total, member) => total + (approvedVolumeByUser.get(member.id) || 0), 0) * 100
      ) / 100;
    frontier = next;
  }

  const ownCommissions = transactions.filter(
    (entry) =>
      entry.userId === userId &&
      entry.type === "REFERRAL" &&
      entry.status !== "REJECTED"
  );
  for (const commission of ownCommissions) {
    const level = Number(commission.referralLevel);
    const summary = levels[level - 1];
    if (summary) {
      summary.earnings = Math.round((summary.earnings + commission.amount) * 100) / 100;
      summary.commissionCount += 1;
    }
  }

  const totalEarnings = Math.round(
    ownCommissions.reduce((total, entry) => total + entry.amount, 0) * 100
  ) / 100;
  const networkCount = levels.reduce((total, entry) => total + entry.count, 0);
  const networkVolume =
    Math.round(levels.reduce((total, entry) => total + entry.volume, 0) * 100) / 100;
  const activeLevels = levels.filter((entry) => entry.count > 0).length;
  const deepestLevel = levels.reduce(
    (deepest, entry) => (entry.count > 0 ? entry.level : deepest),
    0
  );

  return {
    level: upline.length,
    referredBy: user?.referredBy || null,
    upline,
    directCount: levels[0].count,
    networkCount,
    networkVolume,
    activeLevels,
    deepestLevel,
    totalRate: levels.reduce((total, entry) => total + entry.rate, 0),
    totalEarnings,
    commissionCount: ownCommissions.length,
    levels,
  };
}
