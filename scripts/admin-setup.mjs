#!/usr/bin/env node
/**
 * One-time admin setup:  npm run admin:setup
 *
 * Asks for the single admin email and a password, then stores ONLY hashes of them in
 * .env.local, so the real email and password are never saved anywhere and cannot be read
 * back by anyone who sees your environment files:
 *   ADMIN_EMAIL_HASH     keyed hash (HMAC-SHA256) of the email
 *   ADMIN_PASSWORD_HASH  salted scrypt hash of the password
 * It also creates the random secrets the site needs (kept if they already exist):
 *   ADMIN_EMAIL_PEPPER, ADMIN_SESSION_SECRET, ADMIN_API_SECRET
 * and sets ADMIN_API_SECRET on your Convex deployment.
 *
 * The hash format here must match src/lib/admin/crypto.ts (colon-separated, because Next.js
 * would mangle any "$" inside a .env value).
 *
 * For automation/testing only, ADMIN_SETUP_EMAIL and ADMIN_SETUP_PASSWORD may be set in the
 * environment instead of being typed.
 */
import { createHmac, randomBytes, scryptSync } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import readline from "node:readline";

const ENV_FILE = ".env.local";
const N = 16384, R = 8, P = 1, KEYLEN = 64;

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.startsWith(question)) process.stdout.write(s);
        else if (/^[\r\n]+$/.test(s)) process.stdout.write(s);
        else process.stdout.write("*");
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

function readEnv() {
  const map = new Map();
  if (!existsSync(ENV_FILE)) return map;
  for (const line of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) map.set(m[1], m[2]);
  }
  return map;
}

function writeEnv(updates) {
  const lines = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8").split(/\r?\n/) : [];
  const done = new Set();
  const out = lines.map((line) => {
    const m = line.match(/^([A-Z0-9_]+)=/);
    if (m && m[1] in updates) {
      done.add(m[1]);
      return `${m[1]}=${updates[m[1]]}`;
    }
    return line;
  });
  while (out.length && out[out.length - 1] === "") out.pop();
  for (const [k, v] of Object.entries(updates)) if (!done.has(k)) out.push(`${k}=${v}`);
  writeFileSync(ENV_FILE, out.join("\n") + "\n");
}

const hashEmail = (email, pepper) => createHmac("sha256", pepper).update(email.trim().toLowerCase()).digest("hex");
function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt:${N}:${R}:${P}:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

async function main() {
  console.log("\nRoam & Rest admin setup\n-----------------------");
  console.log("Only hashes are stored. Your real email and password are never written to disk.\n");

  const email = (process.env.ADMIN_SETUP_EMAIL ?? (await ask("Admin email: "))).trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("That doesn't look like an email address.");

  let password = process.env.ADMIN_SETUP_PASSWORD;
  if (!password) {
    password = await ask("Password (6+ characters): ", true);
    const again = await ask("Repeat password: ", true);
    if (password !== again) throw new Error("The passwords don't match.");
  }
  if (password.length < 6) throw new Error("Please use at least 6 characters.");
  if (password.length < 12) console.log("\nNote: shorter passwords are easier to guess. A longer one is safer.");

  const env = readEnv();
  const pepper = env.get("ADMIN_EMAIL_PEPPER") || randomBytes(32).toString("hex");
  const session = env.get("ADMIN_SESSION_SECRET") || randomBytes(48).toString("hex");
  const api = env.get("ADMIN_API_SECRET") || randomBytes(48).toString("hex");

  writeEnv({
    ADMIN_EMAIL_PEPPER: pepper,
    ADMIN_EMAIL_HASH: hashEmail(email, pepper),
    ADMIN_PASSWORD_HASH: hashPassword(password),
    ADMIN_SESSION_SECRET: session,
    ADMIN_API_SECRET: api,
  });
  console.log(`\n✔ Saved hashed credentials and secrets to ${ENV_FILE}`);

  // Give the Convex deployment the same API secret, so only this site can call admin functions.
  // Run the Convex CLI directly with node (no shell, so nothing needs escaping).
  const convexArgs = ["node_modules/convex/bin/main.js", "env", "set", "ADMIN_API_SECRET", api];
  // When a deploy key file exists (.env.cloud), target that cloud deployment.
  if (existsSync(".env.cloud")) convexArgs.push("--env-file", ".env.cloud");
  const result = spawnSync(process.execPath, convexArgs, {
    stdio: "pipe",
    env: { ...process.env, CONVEX_AGENT_MODE: process.env.CONVEX_AGENT_MODE ?? "" },
  });
  if (result.status === 0) {
    console.log("✔ Set ADMIN_API_SECRET on your Convex deployment");
  } else {
    console.log("\n! Couldn't set ADMIN_API_SECRET on Convex automatically. Run this yourself, then you're done:");
    console.log(`  npx convex env set ADMIN_API_SECRET ${api}`);
  }

  console.log("\nFor production hosting (for example Vercel), add these same variables there too:");
  console.log("  ADMIN_EMAIL_HASH, ADMIN_PASSWORD_HASH, ADMIN_EMAIL_PEPPER, ADMIN_SESSION_SECRET, ADMIN_API_SECRET,");
  console.log("  NEXT_PUBLIC_CONVEX_URL  (values are in .env.local; never share them or commit that file)\n");
  console.log("Restart the site (npm run dev), then sign in at /admin.\n");
}

main().catch((e) => {
  console.error(`\n✖ ${e.message}\n`);
  process.exit(1);
});
