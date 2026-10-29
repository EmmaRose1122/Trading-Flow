import type { Transaction } from "./db";

export const DAILY_RETURN_PERCENT = 2;
export const MIN_DEPOSIT = 10;
export const MIN_WITHDRAWAL = 10;
export const DEPOSIT_MATURITY_MS = 24 * 60 * 60 * 1000;
export const WITHDRAWAL_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function approvedDeposits(transactions: Transaction[], userId?: string) {
  return transactions
    .filter(
      (tx) =>
        tx.type === "DEPOSIT" &&
        tx.status === "APPROVED" &&
        (!userId || tx.userId === userId)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function depositApprovedAt(transaction: Transaction) {
  return new Date(transaction.approvedAt || transaction.createdAt).getTime();
}

export function depositEligibleAt(transaction: Transaction) {
  return new Date(depositApprovedAt(transaction) + DEPOSIT_MATURITY_MS);
}

export function isDepositEligible(transaction: Transaction, now = Date.now()) {
  return depositApprovedAt(transaction) + DEPOSIT_MATURITY_MS <= now;
}

export function approvedDepositTotal(transactions: Transaction[], userId?: string) {
  return round(
    approvedDeposits(transactions, userId).reduce((total, tx) => total + tx.amount, 0)
  );
}

export function eligibleDepositTotal(
  transactions: Transaction[],
  userId?: string,
  now = Date.now()
) {
  return round(
    approvedDeposits(transactions, userId)
      .filter((tx) => isDepositEligible(tx, now))
      .reduce((total, tx) => total + tx.amount, 0)
  );
}

export function dailyDepositProfit(totalDeposits: number) {
  return round((totalDeposits * DAILY_RETURN_PERCENT) / 100);
}

export function mostRecentWithdrawal(transactions: Transaction[]) {
  return [...transactions]
    .filter((tx) => tx.type === "WITHDRAWAL")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

export function round(value: number) {
  return Math.round(value * 100) / 100;
}
