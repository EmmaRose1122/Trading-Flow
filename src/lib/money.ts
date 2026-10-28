export function parseMoney(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || !Number.isSafeInteger(Math.round(amount * 100))) return null;
  return Math.round(amount * 100) / 100;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateDailyProfit(investedAmount: number, dailyPercentage: number): number {
  return roundMoney((investedAmount * dailyPercentage) / 100);
}
