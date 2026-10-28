import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const dbFile = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : path.join(process.cwd(), ".data", "db.json");
const email = (process.env.ADMIN_EMAIL || process.argv[2] || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || process.argv[3] || "";
const name = (process.env.ADMIN_NAME || process.argv[4] || "Platform Admin").trim();

if (!fs.existsSync(dbFile)) {
  console.error("Database file not found. Start the app once before creating an admin.");
  process.exit(1);
}
if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12) {
  console.error("Provide ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dbFile, "utf8"));
if (data.users.some((user) => user.email.toLowerCase() === email)) {
  console.error("A user with this email already exists.");
  process.exit(1);
}

const userId = "usr_admin_" + randomBytes(8).toString("hex");
let referralCode = "";
do {
  referralCode = "ADMIN" + randomBytes(3).toString("hex").toUpperCase();
} while (data.users.some((user) => user.referralCode === referralCode));

data.users.push({
  id: userId,
  email,
  name,
  passwordHash: bcrypt.hashSync(password, 12),
  role: "ADMIN",
  referralCode,
  createdAt: new Date().toISOString(),
});
data.wallets.push({
  id: "wlt_" + randomBytes(8).toString("hex"),
  userId,
  currentBalance: 0,
  totalInvested: 0,
  totalProfit: 0,
  totalDeposited: 0,
  totalWithdrawn: 0,
  updatedAt: new Date().toISOString(),
});

const tempFile = `${dbFile}.${process.pid}.tmp`;
fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf8");
fs.renameSync(tempFile, dbFile);
console.log(`Admin created: ${email}`);
