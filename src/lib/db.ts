import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { calculateDailyProfit } from "./money";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "USER" | "ADMIN";
  referralCode: string;
  referredBy?: string;
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
  type: "DEPOSIT" | "WITHDRAWAL" | "INVESTMENT" | "PROFIT" | "CAPITAL_RETURN" | "BONUS";
  amount: number;
  fee: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUCCESS";
  method: string;
  txHash?: string;
  destination?: string;
  proofUrl?: string;
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
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@tradingflow.com").trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
  const adminName = (process.env.ADMIN_NAME || "Platform Master Admin").trim();
  const adminReferral = (process.env.ADMIN_REFERRAL_CODE || "ADMIN001").trim().toUpperCase();

  // If custom password provided in environment variables (minimum 6 characters)
  if (adminPassword.length >= 6) {
    const existing = data.users.find((u) => u.email.toLowerCase() === adminEmail);
    if (existing) {
      existing.passwordHash = bcrypt.hashSync(adminPassword, 12);
      existing.role = "ADMIN";
      existing.name = adminName;
      return true;
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

    if (!data.wallets.some((w) => w.userId === userId)) {
      data.wallets.push({
        id: "wlt_bootstrap_admin",
        userId,
        currentBalance: 500000.0,
        totalInvested: 0,
        totalProfit: 0,
        totalDeposited: 500000.0,
        totalWithdrawn: 0,
        updatedAt: new Date().toISOString(),
      });
    }
    return true;
  }

  // Fallback: Ensure at least one admin exists if database has no admin
  if (!data.users.some((u) => u.role === "ADMIN")) {
    const userId = "usr_admin";
    data.users.unshift({
      id: userId,
      email: adminEmail,
      name: adminName,
      passwordHash: bcrypt.hashSync("admin123", 12),
      role: "ADMIN",
      referralCode: adminReferral,
      createdAt: new Date().toISOString(),
    });
    if (!data.wallets.some((w) => w.userId === userId)) {
      data.wallets.push({
        id: "wlt_admin",
        userId,
        currentBalance: 500000.0,
        totalInvested: 0,
        totalProfit: 0,
        totalDeposited: 500000.0,
        totalWithdrawn: 0,
        updatedAt: new Date().toISOString(),
      });
    }
    return true;
  }

  return false;
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
        referralCode: "ADMIN001",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "usr_investor",
        email: "user@tradingflow.com",
        name: "Alex Stewart",
        passwordHash: userHash,
        role: "USER",
        referralCode: "TF89231",
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
    if (plansChanged || adminCreated) saveDatabase(inMemoryData);
    return inMemoryData;
  }

  const initialData = getDefaultData();
  ensureBootstrapAdmin(initialData);
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

// Database helper functions
export const db = {
  getUsers: () => loadDatabase().users,
  findUserByEmail: (email: string) =>
    loadDatabase().users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id: string) => loadDatabase().users.find((u) => u.id === id),
  createUser: (user: User, initialBalance: number = 0) => {
    const data = loadDatabase();
    if (data.users.some((entry) => entry.email.toLowerCase() === user.email.toLowerCase())) {
      throw new Error("DUPLICATE_EMAIL");
    }
    if (data.users.some((entry) => entry.referralCode === user.referralCode)) {
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
      updatedAt: new Date().toISOString(),
    });
    saveDatabase(data);
    return user;
  },

  getWalletByUserId: (userId: string) => {
    const data = loadDatabase();
    return data.wallets.find((w) => w.userId === userId);
  },

  updateWallet: (userId: string, partial: Partial<Wallet>) => {
    const data = loadDatabase();
    const idx = data.wallets.findIndex((w) => w.userId === userId);
    if (idx !== -1) {
      data.wallets[idx] = { ...data.wallets[idx], ...partial, updatedAt: new Date().toISOString() };
      saveDatabase(data);
      return data.wallets[idx];
    }
    return null;
  },

  getPlans: () => loadDatabase().plans,
  getPlanById: (planId: string) => loadDatabase().plans.find((p) => p.id === planId),

  getInvestmentsByUserId: (userId: string) =>
    loadDatabase().investments.filter((inv) => inv.userId === userId),

  createInvestment: (investment: Investment) => {
    const data = loadDatabase();
    data.investments.push(investment);
    saveDatabase(data);
    return investment;
  },

  getTransactions: (userId?: string) => {
    const data = loadDatabase();
    if (userId) {
      return data.transactions.filter((tx) => tx.userId === userId);
    }
    return data.transactions;
  },

  createTransaction: (tx: Transaction) => {
    const data = loadDatabase();
    data.transactions.unshift(tx);
    saveDatabase(data);
    return tx;
  },

  accrueProfits: (date = new Date()) => {
    const data = loadDatabase();
    const accrualDate = date.toISOString().slice(0, 10);
    let processed = 0;
    let distributed = 0;

    for (const investment of data.investments) {
      if (investment.status !== "ACTIVE" || investment.remainingDays <= 0) continue;
      if (investment.lastAccruedAt === accrualDate) continue;
      const wallet = data.wallets.find((entry) => entry.userId === investment.userId);
      const user = data.users.find((entry) => entry.id === investment.userId);
      if (!wallet || !user) continue;

      const profit = calculateDailyProfit(investment.investedAmount, investment.dailyPercentage);
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
        note: `Daily profit for ${investment.planName}`,
        createdAt: date.toISOString(),
      });
      processed += 1;
      distributed += profit;

      if (investment.remainingDays === 0) {
        investment.status = "COMPLETED";
        wallet.totalInvested = Math.max(0, Math.round((wallet.totalInvested - investment.investedAmount) * 100) / 100);
        const plan = data.plans.find((entry) => entry.id === investment.planId);
        if (plan?.capitalBack) {
          wallet.currentBalance = Math.round((wallet.currentBalance + investment.investedAmount) * 100) / 100;
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

    if (processed > 0) saveDatabase(data);
    return { processed, distributed: Math.round(distributed * 100) / 100, accrualDate };
  },

  updateTransactionStatus: (txId: string, status: "APPROVED" | "REJECTED") => {
    const data = loadDatabase();
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
      wallet.currentBalance = Math.round((wallet.currentBalance + tx.amount + tx.fee) * 100) / 100;
    }

    tx.status = status;
    wallet.updatedAt = new Date().toISOString();
    saveDatabase(data);
    return { transaction: tx };
  },

  updateUserPassword: (userId: string, newPasswordHash: string) => {
    const data = loadDatabase();
    const user = data.users.find((u) => u.id === userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    saveDatabase(data);
    return true;
  },
};

