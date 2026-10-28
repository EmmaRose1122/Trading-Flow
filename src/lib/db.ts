import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { calculateDailyProfit } from "./money";
import {
  PLATFORM_REFERRAL_CODE,
  REFERRAL_LEVEL_RATES,
  normalizeReferralCode,
} from "./referral";

export type KycStatus = "NOT_STARTED" | "PENDING" | "APPROVED" | "REJECTED";

export interface KycDetails {
  legalName: string;
  dateOfBirth: string;
  country: string;
  address: string;
  documentType: string;
  documentReference: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "USER" | "ADMIN";
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorPendingSecret?: string;
  twoFactorRecoveryHashes?: string[];
  kycStatus?: KycStatus;
  kycDetails?: KycDetails;
}

export interface DepositAccount {
  id: string;
  label: string;
  method: string;
  network?: string;
  currency: string;
  address: string;
  accountName?: string;
  instructions?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PayoutWallet {
  id: string;
  userId: string;
  label: string;
  method: string;
  network?: string;
  address: string;
  isProfitDestination: boolean;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  currentBalance: number;
  totalInvested: number;
  totalProfit: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalReferralEarnings?: number;
  updatedAt: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyPercentage: number;
  durationDays: number;
  capitalBack: boolean;
  isActive: boolean;
}

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  investedAmount: number;
  dailyPercentage: number;
  durationDays: number;
  remainingDays: number;
  status: "ACTIVE" | "COMPLETED";
  lastAccruedAt?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  type:
    | "DEPOSIT"
    | "WITHDRAWAL"
    | "INVESTMENT"
    | "PROFIT"
    | "CAPITAL_RETURN"
    | "BONUS"
    | "REFERRAL";
  amount: number;
  fee: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUCCESS";
  method: string;
  txHash?: string;
  destination?: string;
  payoutWalletId?: string;
  proofUrl?: string;
  depositAccountId?: string;
  referralLevel?: number;
  sourceUserId?: string;
  sourceUserName?: string;
  investmentId?: string;
  note?: string;
  adminId?: string;
  previousBalance?: number;
  newBalance?: number;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  wallets: Wallet[];
  plans: InvestmentPlan[];
  investments: Investment[];
  transactions: Transaction[];
  depositAccounts?: DepositAccount[];
  payoutWallets?: PayoutWallet[];
}

const DB_FILE = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : process.env.VERCEL
    ? path.join("/tmp", "trading-flow-db.json")
    : path.join(process.cwd(), ".data", "db.json");
const DB_DIR = path.dirname(DB_FILE);

const CURRENT_PLAN_RATES: Record<string, number> = {
  plan_starter: 1.5,
  plan_premium: 2.0,
  plan_vip: 3.0,
};

function ensureBootstrapAdmin(data: DatabaseSchema) {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const adminName = (process.env.ADMIN_NAME || "Platform Admin").trim();
  const adminReferral = PLATFORM_REFERRAL_CODE;

  const demoAdminEmails = new Set(["admin@tradingflow.com"]);
  if (
    data.users.some(
      (user) => user.role === "ADMIN" && !demoAdminEmails.has(user.email.toLowerCase())
    )
  ) {
    return false;
  }
  if (!/^\S+@\S+\.\S+$/.test(adminEmail) || adminPassword.length < 12) return false;
  if (data.users.some((user) => user.email.toLowerCase() === adminEmail)) return false;

  if (
    data.users.some(
      (user) => normalizeReferralCode(user.referralCode) === normalizeReferralCode(adminReferral)
    )
  ) {
    return false;
  }

  const userId = "usr_bootstrap_admin";
  data.users.unshift({
    id: userId,
    email: adminEmail,
    name: adminName,
    passwordHash: bcrypt.hashSync(adminPassword, 12),
    role: "ADMIN",
    referralCode: adminReferral,
    createdAt: new Date().toISOString(),
  });
  data.wallets.push({
    id: "wlt_bootstrap_admin",
    userId,
    currentBalance: 0,
    totalInvested: 0,
    totalProfit: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    updatedAt: new Date().toISOString(),
  });
  return true;
}

function getDefaultDepositAccounts(): DepositAccount[] {
  const createdAt = new Date().toISOString();
  return [
    {
      id: "dep_usdt_trc20",
      label: "USDT (TRC20)",
      method: "USDT (TRC20)",
      network: "TRON",
      currency: "USDT",
      address: "TNVbE1fB8QzLkmXzV8o14Y7J6Xk9Pq3Wa7",
      accountName: "Trading Flow Capital",
      instructions: "Send only USDT on the TRC20 network to this address.",
      isActive: true,
      createdAt,
    },
    {
      id: "dep_btc",
      label: "Bitcoin (BTC)",
      method: "Bitcoin (BTC)",
      network: "Bitcoin",
      currency: "BTC",
      address: "bc1q8x4f0k726af8yqlpt840x9812lkm904",
      accountName: "Trading Flow Capital",
      instructions: "Send only Bitcoin to this address.",
      isActive: true,
      createdAt,
    },
    {
      id: "dep_eth_erc20",
      label: "Ethereum (ERC20)",
      method: "Ethereum (ERC20)",
      network: "Ethereum",
      currency: "ETH / USDT",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      accountName: "Trading Flow Capital",
      instructions: "Confirm the network before sending funds.",
      isActive: true,
      createdAt,
    },
    {
      id: "dep_gbp_bank",
      label: "GBP Bank Transfer (demo)",
      method: "Bank Transfer",
      network: "Faster Payments",
      currency: "GBP",
      address: "Demo Bank · Sort code 00-00-00 · Account 00000000",
      accountName: "Trading Flow Capital Ltd",
      instructions: "Demonstration account details. Replace before accepting real funds.",
      isActive: true,
      createdAt,
    },
  ];
}

function ensureFeatureCollections(data: DatabaseSchema) {
  let changed = false;
  if (!Array.isArray(data.depositAccounts)) {
    data.depositAccounts = getDefaultDepositAccounts();
    changed = true;
  }
  if (!Array.isArray(data.payoutWallets)) {
    data.payoutWallets = [];
    changed = true;
  }
  return changed;
}

function ensurePlatformReferralCode(data: DatabaseSchema) {
  const configuredEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const admin =
    data.users.find(
      (user) => user.role === "ADMIN" && user.email.toLowerCase() === configuredEmail
    ) || data.users.find((user) => user.role === "ADMIN");
  if (!admin) return false;

  const platformCode = normalizeReferralCode(PLATFORM_REFERRAL_CODE);
  const currentCode = normalizeReferralCode(admin.referralCode);
  let changed = false;

  if (currentCode !== platformCode) {
    const conflict = data.users.some(
      (user) => user.id !== admin.id && normalizeReferralCode(user.referralCode) === platformCode
    );
    if (conflict) return false;
    admin.referralCode = PLATFORM_REFERRAL_CODE;
    changed = true;
    if (currentCode) {
      for (const user of data.users) {
        if (normalizeReferralCode(user.referredBy) === currentCode) {
          user.referredBy = PLATFORM_REFERRAL_CODE;
        }
      }
    }
  } else if (admin.referralCode !== PLATFORM_REFERRAL_CODE) {
    admin.referralCode = PLATFORM_REFERRAL_CODE;
    changed = true;
  }

  for (const user of data.users) {
    if (user.role !== "ADMIN" && !normalizeReferralCode(user.referredBy)) {
      user.referredBy = PLATFORM_REFERRAL_CODE;
      changed = true;
    }
  }

  return changed;
}

function synchronizePlanCatalog(data: DatabaseSchema) {
  let changed = false;
  for (const plan of data.plans) {
    const currentRate = CURRENT_PLAN_RATES[plan.id];
    if (currentRate !== undefined && plan.dailyPercentage !== currentRate) {
      plan.dailyPercentage = currentRate;
      changed = true;
    }
  }
  for (const investment of data.investments) {
    if (investment.status !== "ACTIVE") continue;
    const plan = data.plans.find((entry) => entry.id === investment.planId);
    if (plan && investment.dailyPercentage !== plan.dailyPercentage) {
      investment.dailyPercentage = plan.dailyPercentage;
      changed = true;
    }
  }
  return changed;
}

function getDefaultData(): DatabaseSchema {
  const includeDemoAccounts = process.env.ENABLE_DEMO_ACCOUNTS === "true";
  const adminHash = bcrypt.hashSync("admin123", 12);
  const userHash = bcrypt.hashSync("user123", 12);

  return {
    users: includeDemoAccounts ? [
      {
        id: "usr_admin",
        email: "admin@tradingflow.com",
        name: "Platform Master Admin",
        passwordHash: adminHash,
        role: "ADMIN",
        referralCode: PLATFORM_REFERRAL_CODE,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "usr_investor",
        email: "user@tradingflow.com",
        name: "Alex Stewart",
        passwordHash: userHash,
        role: "USER",
        referralCode: "TF89231",
        referredBy: PLATFORM_REFERRAL_CODE,
        createdAt: "2026-01-10T00:00:00.000Z",
      },
    ] : [],
    wallets: includeDemoAccounts ? [
      {
        id: "wlt_admin",
        userId: "usr_admin",
        currentBalance: 500000.0,
        totalInvested: 0,
        totalProfit: 0,
        totalDeposited: 500000.0,
        totalWithdrawn: 0,
        totalReferralEarnings: 0,
        updatedAt: new Date().toISOString(),
      },
      {
        id: "wlt_investor",
        userId: "usr_investor",
        currentBalance: 24580.45,
        totalInvested: 18000.0,
        totalProfit: 6580.45,
        totalDeposited: 36000.0,
        totalWithdrawn: 5000.0,
        totalReferralEarnings: 0,
        updatedAt: new Date().toISOString(),
      },
    ] : [],
    plans: [
      {
        id: "plan_starter",
        name: "Starter Capital Tier",
        minAmount: 100,
        maxAmount: 999,
        dailyPercentage: 1.5,
        durationDays: 15,
        capitalBack: true,
        isActive: true,
      },
      {
        id: "plan_premium",
        name: "Premium Growth Tier",
        minAmount: 1000,
        maxAmount: 9999,
        dailyPercentage: 2.0,
        durationDays: 30,
        capitalBack: true,
        isActive: true,
      },
      {
        id: "plan_vip",
        name: "VIP Capital Partner",
        minAmount: 10000,
        maxAmount: 100000,
        dailyPercentage: 3.0,
        durationDays: 60,
        capitalBack: true,
        isActive: true,
      },
    ],
    investments: includeDemoAccounts ? [
      {
        id: "inv_101",
        userId: "usr_investor",
        planId: "plan_premium",
        planName: "Premium Growth Tier",
        investedAmount: 10000.0,
        dailyPercentage: 2.0,
        durationDays: 30,
        remainingDays: 18,
        status: "ACTIVE",
        createdAt: "2026-10-16T12:00:00.000Z",
      },
      {
        id: "inv_102",
        userId: "usr_investor",
        planId: "plan_starter",
        planName: "Starter Capital Tier",
        investedAmount: 8000.0,
        dailyPercentage: 1.5,
        durationDays: 15,
        remainingDays: 4,
        status: "ACTIVE",
        createdAt: "2026-10-17T09:30:00.000Z",
      },
    ] : [],
    transactions: includeDemoAccounts ? [
      {
        id: "TX-7892104",
        userId: "usr_investor",
        userEmail: "user@tradingflow.com",
        userName: "Alex Stewart",
        type: "PROFIT",
        amount: 280.0,
        fee: 0,
        status: "SUCCESS",
        method: "Automated Daily ROI",
        note: "Daily profit payout on Premium Growth Tier",
        createdAt: "2026-10-28T12:15:00.000Z",
      },
      {
        id: "TX-7892103",
        userId: "usr_investor",
        userEmail: "user@tradingflow.com",
        userName: "Alex Stewart",
        type: "DEPOSIT",
        amount: 5000.0,
        fee: 0,
        status: "APPROVED",
        method: "USDT (TRC20)",
        txHash: "0x8a9fc438e1b29a8d9f104e7b8c9a3",
        createdAt: "2026-10-27T18:30:00.000Z",
      },
      {
        id: "TX-7892102",
        userId: "usr_investor",
        userEmail: "user@tradingflow.com",
        userName: "Alex Stewart",
        type: "WITHDRAWAL",
        amount: 750.0,
        fee: 15.0,
        status: "PENDING",
        method: "BTC Network",
        destination: "bc1q9k4x0m726af8yqlpt840x",
        createdAt: "2026-10-26T09:40:00.000Z",
      },
      {
        id: "TX-7892101",
        userId: "usr_investor",
        userEmail: "user@tradingflow.com",
        userName: "Alex Stewart",
        type: "INVESTMENT",
        amount: 10000.0,
        fee: 0,
        status: "SUCCESS",
        method: "Internal Balance",
        note: "Subscribed to Premium Growth Tier",
        createdAt: "2026-10-16T12:00:00.000Z",
      },
    ] : [],
    depositAccounts: getDefaultDepositAccounts(),
    payoutWallets: includeDemoAccounts
      ? [
          {
            id: "pwl_demo_btc",
            userId: "usr_investor",
            label: "Demo BTC payout",
            method: "Bitcoin (BTC)",
            network: "Bitcoin",
            address: "bc1q9demo4payout7wallet2example8address",
            isProfitDestination: true,
            createdAt: "2026-10-20T10:00:00.000Z",
          },
        ]
      : [],
  };
}

let inMemoryData: DatabaseSchema | null = null;

function loadDatabase(): DatabaseSchema {
  if (inMemoryData) return inMemoryData;

  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    inMemoryData = JSON.parse(raw) as DatabaseSchema;
    const plansChanged = synchronizePlanCatalog(inMemoryData);
    const adminCreated = ensureBootstrapAdmin(inMemoryData);
    const featuresInitialized = ensureFeatureCollections(inMemoryData);
    const platformReferralChanged = ensurePlatformReferralCode(inMemoryData);
    if (plansChanged || adminCreated || featuresInitialized || platformReferralChanged) {
      saveDatabase(inMemoryData);
    }
    return inMemoryData;
  }

  const initialData = getDefaultData();
  ensureBootstrapAdmin(initialData);
  ensureFeatureCollections(initialData);
  ensurePlatformReferralCode(initialData);
  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: DatabaseSchema) {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const temporaryFile = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(temporaryFile, DB_FILE);
  inMemoryData = data;
}

const POSTGRES_URL = (process.env.DATABASE_URL || "").trim();
const USE_POSTGRES = /^postgres(ql)?:\/\//i.test(POSTGRES_URL);

let pool: Pool | null = null;
let readyPromise: Promise<void> | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: POSTGRES_URL,
      ssl: /localhost|127\.0\.0\.1/i.test(POSTGRES_URL) ? undefined : { rejectUnauthorized: false },
      max: 4,
      idleTimeoutMillis: 15_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

function migrateState(data: DatabaseSchema) {
  const plansChanged = synchronizePlanCatalog(data);
  const adminCreated = ensureBootstrapAdmin(data);
  const featuresInitialized = ensureFeatureCollections(data);
  const platformReferralChanged = ensurePlatformReferralCode(data);
  return plansChanged || adminCreated || featuresInitialized || platformReferralChanged;
}

function getInitialPostgresData() {
  const demoFlag = process.env.ENABLE_DEMO_ACCOUNTS;
  process.env.ENABLE_DEMO_ACCOUNTS = "false";
  try {
    const data = getDefaultData();
    migrateState(data);
    return data;
  } finally {
    if (demoFlag === undefined) delete process.env.ENABLE_DEMO_ACCOUNTS;
    else process.env.ENABLE_DEMO_ACCOUNTS = demoFlag;
  }
}

async function initializePostgres() {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.app_state (
        id text PRIMARY KEY,
        data jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await client
      .query("REVOKE ALL ON TABLE public.app_state FROM anon, authenticated")
      .catch(() => undefined);

    let result = await client.query(
      "SELECT data FROM public.app_state WHERE id = $1 FOR UPDATE",
      ["main"]
    );
    if (result.rowCount === 0) {
      const initial = getInitialPostgresData();
      await client.query(
        "INSERT INTO public.app_state (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
        ["main", JSON.stringify(initial)]
      );
      result = await client.query(
        "SELECT data FROM public.app_state WHERE id = $1 FOR UPDATE",
        ["main"]
      );
    }

    const data = result.rows[0].data as DatabaseSchema;
    if (migrateState(data)) {
      await client.query(
        "UPDATE public.app_state SET data = $1, updated_at = now() WHERE id = $2",
        [JSON.stringify(data), "main"]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

function ensurePostgresReady() {
  if (!readyPromise) {
    readyPromise = initializePostgres().catch((error) => {
      readyPromise = null;
      throw error;
    });
  }
  return readyPromise;
}

async function readData<T>(reader: (data: DatabaseSchema) => T): Promise<T> {
  if (!USE_POSTGRES) return reader(loadDatabase());
  await ensurePostgresReady();
  const result = await getPool().query(
    "SELECT data FROM public.app_state WHERE id = $1",
    ["main"]
  );
  if (result.rowCount === 0) throw new Error("PostgreSQL state is unavailable");
  return reader(result.rows[0].data as DatabaseSchema);
}

async function mutateData<T>(mutator: (data: DatabaseSchema) => T): Promise<T> {
  if (!USE_POSTGRES) {
    const data = loadDatabase();
    const result = mutator(data);
    saveDatabase(data);
    return result;
  }

  await ensurePostgresReady();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "SELECT data FROM public.app_state WHERE id = $1 FOR UPDATE",
      ["main"]
    );
    if (result.rowCount === 0) throw new Error("PostgreSQL state is unavailable");
    const data = result.rows[0].data as DatabaseSchema;
    const value = mutator(data);
    await client.query(
      "UPDATE public.app_state SET data = $1, updated_at = now() WHERE id = $2",
      [JSON.stringify(data), "main"]
    );
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

// Database helper functions
export const db = {
  getUsers: () => readData((data) => data.users),
  findUserByEmail: (email: string) =>
    readData((data) =>
      data.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    ),
  findUserById: (id: string) =>
    readData((data) => data.users.find((u) => u.id === id)),

  createUser: (user: User, initialBalance: number = 0) =>
    mutateData((data) => {
      if (data.users.some((entry) => entry.email.toLowerCase() === user.email.toLowerCase())) {
        throw new Error("DUPLICATE_EMAIL");
      }
      if (
        data.users.some(
          (entry) =>
            normalizeReferralCode(entry.referralCode) ===
            normalizeReferralCode(user.referralCode)
        )
      ) {
        throw new Error("DUPLICATE_REFERRAL_CODE");
      }
      data.users.push(user);
      const balance = Math.max(0, initialBalance);
      data.wallets.push({
        id: "wlt_" + Math.random().toString(36).substring(2, 9),
        userId: user.id,
        currentBalance: balance,
        totalInvested: 0.0,
        totalProfit: 0.0,
        totalDeposited: balance,
        totalWithdrawn: 0.0,
        totalReferralEarnings: 0.0,
        updatedAt: new Date().toISOString(),
      });
      return user;
    }),

  getWalletByUserId: (userId: string) =>
    readData((data) => data.wallets.find((w) => w.userId === userId)),

  updateWallet: (userId: string, partial: Partial<Wallet>) =>
    mutateData((data) => {
      const idx = data.wallets.findIndex((w) => w.userId === userId);
      if (idx === -1) return null;
      data.wallets[idx] = {
        ...data.wallets[idx],
        ...partial,
        updatedAt: new Date().toISOString(),
      };
      return data.wallets[idx];
    }),

  getPlans: () => readData((data) => data.plans),
  getPlanById: (planId: string) =>
    readData((data) => data.plans.find((p) => p.id === planId)),

  getInvestmentsByUserId: (userId: string) =>
    readData((data) => data.investments.filter((inv) => inv.userId === userId)),

  createInvestment: (investment: Investment) =>
    mutateData((data) => {
      data.investments.push(investment);
      return investment;
    }),

  distributeReferralCommissions: (investment: Investment) =>
    mutateData((data) => {
      const investor = data.users.find((user) => user.id === investment.userId);
      if (!investor || investment.investedAmount <= 0) {
        return { credited: 0, total: 0, entries: [] as Transaction[] };
      }

      const alreadyCredited = new Set(
        data.transactions
          .filter((tx) => tx.type === "REFERRAL" && tx.investmentId === investment.id)
          .map((tx) => tx.userId)
      );

      let current = investor;
      const seen = new Set<string>([investor.id]);
      const entries: Transaction[] = [];
      let total = 0;

      for (let level = 1; level <= REFERRAL_LEVEL_RATES.length; level += 1) {
        const sponsorCode = normalizeReferralCode(current.referredBy);
        if (!sponsorCode) break;
        const sponsor = data.users.find(
          (user) => normalizeReferralCode(user.referralCode) === sponsorCode
        );
        if (!sponsor || seen.has(sponsor.id)) break;
        seen.add(sponsor.id);

        const rate = REFERRAL_LEVEL_RATES[level - 1];
        const amount = Math.round(investment.investedAmount * rate) / 100;
        if (amount > 0 && !alreadyCredited.has(sponsor.id)) {
          const wallet = data.wallets.find((entry) => entry.userId === sponsor.id);
          if (wallet) {
            wallet.currentBalance = Math.round((wallet.currentBalance + amount) * 100) / 100;
            wallet.totalReferralEarnings =
              Math.round(((wallet.totalReferralEarnings || 0) + amount) * 100) / 100;
            wallet.updatedAt = new Date().toISOString();

            const transaction: Transaction = {
              id: `TX-REF-${investment.id}-L${level}-${sponsor.id}`,
              userId: sponsor.id,
              userEmail: sponsor.email,
              userName: sponsor.name,
              type: "REFERRAL",
              amount,
              fee: 0,
              status: "SUCCESS",
              method: `Referral Commission · Level ${level}`,
              referralLevel: level,
              sourceUserId: investor.id,
              sourceUserName: investor.name,
              investmentId: investment.id,
              previousBalance: Math.round((wallet.currentBalance - amount) * 100) / 100,
              newBalance: wallet.currentBalance,
              note: `Level ${level} commission from ${investor.name} · ${investment.planName}`,
              createdAt: new Date().toISOString(),
            };
            data.transactions.unshift(transaction);
            entries.push(transaction);
            total = Math.round((total + amount) * 100) / 100;
          }
        }

        current = sponsor;
      }

      return { credited: entries.length, total, entries };
    }),

  getTransactions: (userId?: string) =>
    readData((data) =>
      userId ? data.transactions.filter((tx) => tx.userId === userId) : data.transactions
    ),

  createTransaction: (tx: Transaction) =>
    mutateData((data) => {
      data.transactions.unshift(tx);
      return tx;
    }),

  accrueProfits: (date = new Date()) =>
    mutateData((data) => {
      const accrualDate = date.toISOString().slice(0, 10);
      let processed = 0;
      let distributed = 0;

      for (const investment of data.investments) {
        if (investment.status !== "ACTIVE" || investment.remainingDays <= 0) continue;
        if (investment.lastAccruedAt === accrualDate) continue;
        const wallet = data.wallets.find((entry) => entry.userId === investment.userId);
        const user = data.users.find((entry) => entry.id === investment.userId);
        if (!wallet || !user) continue;

        const profit = calculateDailyProfit(
          investment.investedAmount,
          investment.dailyPercentage
        );
        const payoutWallet = data.payoutWallets?.find(
          (entry) => entry.userId === user.id && entry.isProfitDestination
        );
        wallet.currentBalance = Math.round((wallet.currentBalance + profit) * 100) / 100;
        wallet.totalProfit = Math.round((wallet.totalProfit + profit) * 100) / 100;
        investment.remainingDays -= 1;
        investment.lastAccruedAt = accrualDate;
        data.transactions.unshift({
          id: `TX-PROFIT-${investment.id}-${accrualDate}`,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          type: "PROFIT",
          amount: profit,
          fee: 0,
          status: "SUCCESS",
          method: "Automated Daily ROI",
          destination: payoutWallet?.address,
          payoutWalletId: payoutWallet?.id,
          note: payoutWallet
            ? `Daily profit for ${investment.planName} · payout destination: ${payoutWallet.label}`
            : `Daily profit for ${investment.planName}`,
          createdAt: date.toISOString(),
        });
        processed += 1;
        distributed += profit;

        if (investment.remainingDays === 0) {
          investment.status = "COMPLETED";
          wallet.totalInvested = Math.max(
            0,
            Math.round((wallet.totalInvested - investment.investedAmount) * 100) / 100
          );
          const plan = data.plans.find((entry) => entry.id === investment.planId);
          if (plan?.capitalBack) {
            wallet.currentBalance =
              Math.round((wallet.currentBalance + investment.investedAmount) * 100) / 100;
            data.transactions.unshift({
              id: `TX-CAPITAL-${investment.id}`,
              userId: user.id,
              userEmail: user.email,
              userName: user.name,
              type: "CAPITAL_RETURN",
              amount: investment.investedAmount,
              fee: 0,
              status: "SUCCESS",
              method: "Internal Balance",
              note: `Principal returned for ${investment.planName}`,
              createdAt: date.toISOString(),
            });
          }
        }
        wallet.updatedAt = date.toISOString();
      }

      return {
        processed,
        distributed: Math.round(distributed * 100) / 100,
        accrualDate,
      };
    }),

  updateTransactionStatus: (txId: string, status: "APPROVED" | "REJECTED") =>
    mutateData((data) => {
      const tx = data.transactions.find((t) => t.id === txId);
      if (!tx) return { error: "Transaction not found", status: 404 };
      if (tx.type !== "DEPOSIT" && tx.type !== "WITHDRAWAL") {
        return { error: "Only deposit and withdrawal requests can be reviewed", status: 400 };
      }
      if (tx.status !== "PENDING") {
        return { error: "Request has already been processed", status: 409 };
      }

      const wallet = data.wallets.find((w) => w.userId === tx.userId);
      if (!wallet) return { error: "User wallet not found", status: 404 };

      if (tx.type === "DEPOSIT" && status === "APPROVED") {
        wallet.currentBalance = Math.round((wallet.currentBalance + tx.amount) * 100) / 100;
        wallet.totalDeposited = Math.round((wallet.totalDeposited + tx.amount) * 100) / 100;
      }
      if (tx.type === "WITHDRAWAL" && status === "APPROVED") {
        wallet.totalWithdrawn = Math.round((wallet.totalWithdrawn + tx.amount) * 100) / 100;
      }
      if (tx.type === "WITHDRAWAL" && status === "REJECTED") {
        wallet.currentBalance =
          Math.round((wallet.currentBalance + tx.amount + tx.fee) * 100) / 100;
      }

      tx.status = status;
      wallet.updatedAt = new Date().toISOString();
      return { transaction: tx };
    }),

  updateUserPassword: (userId: string, newPasswordHash: string) =>
    mutateData((data) => {
      const user = data.users.find((u) => u.id === userId);
      if (!user) return false;
      user.passwordHash = newPasswordHash;
      return true;
    }),

  updateUserProfile: (userId: string, partial: Pick<User, "name" | "email">) =>
    mutateData((data) => {
      const user = data.users.find((u) => u.id === userId);
      if (!user) return null;
      user.name = partial.name;
      user.email = partial.email;
      return user;
    }),

  updateUserSecurity: (
    userId: string,
    partial: Pick<
      User,
      | "twoFactorEnabled"
      | "twoFactorSecret"
      | "twoFactorPendingSecret"
      | "twoFactorRecoveryHashes"
      | "kycStatus"
      | "kycDetails"
    >
  ) =>
    mutateData((data) => {
      const user = data.users.find((u) => u.id === userId);
      if (!user) return null;
      Object.assign(user, partial);
      return user;
    }),

  getAllInvestments: () => readData((data) => data.investments),

  getDepositAccounts: () => readData((data) => data.depositAccounts || []),

  createDepositAccount: (account: DepositAccount) =>
    mutateData((data) => {
      data.depositAccounts = data.depositAccounts || [];
      data.depositAccounts.unshift(account);
      return account;
    }),

  updateDepositAccount: (id: string, partial: Partial<DepositAccount>) =>
    mutateData((data) => {
      const account = data.depositAccounts?.find((entry) => entry.id === id);
      if (!account) return null;
      Object.assign(account, partial, { id: account.id, createdAt: account.createdAt });
      return account;
    }),

  deleteDepositAccount: (id: string) =>
    mutateData((data) => {
      const initialLength = data.depositAccounts?.length || 0;
      data.depositAccounts = (data.depositAccounts || []).filter((entry) => entry.id !== id);
      return data.depositAccounts.length !== initialLength;
    }),

  getPayoutWalletsByUserId: (userId: string) =>
    readData(
      (data) => data.payoutWallets?.filter((wallet) => wallet.userId === userId) || []
    ),

  createPayoutWallet: (wallet: PayoutWallet) =>
    mutateData((data) => {
      data.payoutWallets = data.payoutWallets || [];
      const userWallets = data.payoutWallets.filter(
        (entry) => entry.userId === wallet.userId
      );
      if (wallet.isProfitDestination || userWallets.length === 0) {
        for (const entry of userWallets) entry.isProfitDestination = false;
        wallet.isProfitDestination = true;
      }
      data.payoutWallets.push(wallet);
      return wallet;
    }),

  setProfitDestinationWallet: (userId: string, walletId: string) =>
    mutateData((data) => {
      const wallets =
        data.payoutWallets?.filter((wallet) => wallet.userId === userId) || [];
      if (!wallets.some((wallet) => wallet.id === walletId)) return false;
      for (const wallet of wallets) wallet.isProfitDestination = wallet.id === walletId;
      return true;
    }),

  deletePayoutWallet: (userId: string, walletId: string) =>
    mutateData((data) => {
      const wallet = data.payoutWallets?.find(
        (entry) => entry.id === walletId && entry.userId === userId
      );
      if (!wallet) return false;
      data.payoutWallets = (data.payoutWallets || []).filter(
        (entry) => entry.id !== walletId
      );
      if (wallet.isProfitDestination) {
        const remaining = data.payoutWallets.find((entry) => entry.userId === userId);
        if (remaining) remaining.isProfitDestination = true;
      }
      return true;
    }),
};

