#!/usr/bin/env node
/**
 * Move the backend to a Convex PRODUCTION deployment:   npm run go:production
 *
 * You run this yourself, on your own machine. The production deploy key stays in a file
 * only you create and that git ignores; nothing is sent anywhere except Convex itself,
 * and no secret value is ever printed.
 *
 * Before running:
 *   1. Run `npm run admin:setup` once (creates your hashed admin login in .env.local).
 *   2. In the Convex dashboard open the Production deployment, then Settings, then
 *      "URL & Deploy Key", and generate a Production Deploy Key.
 *   3. Create a file named .env.cloud-prod in this folder containing one line:
 *        CONVEX_DEPLOY_KEY=prod:your-deployment|...the rest of the key...
 *
 * What it does:
 *   - deploys the backend functions and database schema to production
 *   - gives production its own fresh API secret and session secret (separate from development)
 *   - reuses your hashed admin email and password, so you keep one login
 *   - loads the starter property (The Karen Estate) if production is empty
 *   - writes .env.production.local (Next.js uses it automatically for production builds)
 *
 * Use --dry-run to check your setup without changing anything.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const DRY = process.argv.includes("--dry-run");
const KEY_FILE = ".env.cloud-prod";
const OUT_FILE = ".env.production.local";

const fail = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};
const parse = (file) =>
  existsSync(file)
    ? Object.fromEntries(
        readFileSync(file, "utf8")
          .split(/\r?\n/)
          .filter((l) => /^[A-Z0-9_]+=/.test(l))
          .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
      )
    : {};

/* ---- 1. Check everything is in place ------------------------------------------------ */
const dev = parse(".env.local");
for (const k of ["ADMIN_EMAIL_HASH", "ADMIN_PASSWORD_HASH", "ADMIN_EMAIL_PEPPER"]) {
  if (!dev[k]) fail("Your admin login isn't set up yet. Run `npm run admin:setup` first, then run this again.");
}

if (!existsSync(KEY_FILE)) {
  fail(`Create a file named ${KEY_FILE} in this folder with one line:\n  CONVEX_DEPLOY_KEY=prod:your-deployment|...\n(Generate it in the Convex dashboard: Production deployment, Settings, URL & Deploy Key.)`);
}
const keyEnv = parse(KEY_FILE);
const key = keyEnv.CONVEX_DEPLOY_KEY;
if (!key) fail(`${KEY_FILE} has no CONVEX_DEPLOY_KEY line.`);
if (!key.startsWith("prod:")) {
  fail("That key isn't a PRODUCTION key (production keys start with \"prod:\"). Generate one from the Production deployment in the dashboard.");
}
const name = key.slice(5, key.indexOf("|"));
if (!name || key.indexOf("|") < 0) fail("The deploy key looks malformed. Copy it again from the dashboard.");
const url = `https://${name}.convex.cloud`;
const siteUrl = `https://${name}.convex.site`;

console.log(`\nProduction deployment: ${name}`);
console.log(`Address:               ${url}`);
if (DRY) {
  console.log("\nDry run: everything above checks out. Nothing was changed.\n");
  process.exit(0);
}

/* ---- 2. Deploy the backend ---------------------------------------------------------- */
const convex = (...args) =>
  spawnSync(process.execPath, ["node_modules/convex/bin/main.js", ...args, "--env-file", KEY_FILE], {
    encoding: "utf8",
    stdio: "pipe",
    env: { ...process.env, CONVEX_DEPLOYMENT: `prod:${name}` },
  });
const scrub = (s) => String(s).split(key).join("<hidden>").slice(-600);

console.log("\n1/4  Deploying the backend to production…");
const deploy = convex("deploy", "--yes");
if (deploy.status !== 0) fail("Deploy failed:\n" + scrub(deploy.stderr || deploy.stdout));
console.log("     ✔ Backend deployed");

/* ---- 3. Secrets (reused if you re-run this) ----------------------------------------- */
const existing = parse(OUT_FILE);
const apiSecret = existing.ADMIN_API_SECRET || randomBytes(48).toString("hex");
const sessionSecret = existing.ADMIN_SESSION_SECRET || randomBytes(48).toString("hex");

console.log("2/4  Setting the production API secret…");
const setSecret = spawnSync(process.execPath, ["node_modules/convex/bin/main.js", "env", "set", "ADMIN_API_SECRET", apiSecret, "--env-file", KEY_FILE], {
  encoding: "utf8",
  stdio: "pipe",
  env: { ...process.env, CONVEX_DEPLOYMENT: `prod:${name}` },
});
if (setSecret.status !== 0) fail("Couldn't set the secret:\n" + scrub((setSecret.stderr || setSecret.stdout).split(apiSecret).join("<hidden>")));
console.log("     ✔ Secret set");

/* ---- 4. Starter property ------------------------------------------------------------ */
console.log("3/4  Loading the starter property if production is empty…");
const { ConvexHttpClient } = await import("convex/browser");
const client = new ConvexHttpClient(url);
const count = await client.query("properties:publicCount", {});
if (count === 0) {
  const { properties } = await import(pathToFileURL(process.cwd() + "/src/lib/property.ts").href);
  for (const p of properties) {
    const { bookings: _b, reviews: _r, availabilityKnown: _a, ...fields } = p;
    await client.mutation("properties:upsert", { secret: apiSecret, property: fields });
    await client.mutation("properties:setPublished", { secret: apiSecret, slug: p.slug, published: true });
  }
  console.log(`     ✔ Loaded ${properties.length} property`);
} else {
  console.log(`     ✔ Production already has ${count} propert${count === 1 ? "y" : "ies"}, left untouched`);
}

/* ---- 5. Production environment file ------------------------------------------------- */
console.log(`4/4  Writing ${OUT_FILE}…`);
const lines = [
  "# Production settings. Next.js uses this file automatically for `next build` and `next start`.",
  "# Secret: never commit or share.",
  `CONVEX_DEPLOYMENT=prod:${name}`,
  `NEXT_PUBLIC_CONVEX_URL=${url}`,
  `NEXT_PUBLIC_CONVEX_SITE_URL=${siteUrl}`,
  `ADMIN_EMAIL_PEPPER=${dev.ADMIN_EMAIL_PEPPER}`,
  `ADMIN_EMAIL_HASH=${dev.ADMIN_EMAIL_HASH}`,
  `ADMIN_PASSWORD_HASH=${dev.ADMIN_PASSWORD_HASH}`,
  `ADMIN_SESSION_SECRET=${sessionSecret}`,
  `ADMIN_API_SECRET=${apiSecret}`,
  `NEXT_PUBLIC_SITE_URL=${existing.NEXT_PUBLIC_SITE_URL || ""}`,
];
writeFileSync(OUT_FILE, lines.join("\n") + "\n");
console.log("     ✔ Saved");

console.log(`
Done. Production is ready at ${url}

Next:
  • Hosting (for example Vercel): add these variables from ${OUT_FILE} to your project's settings:
      NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_CONVEX_SITE_URL, ADMIN_EMAIL_PEPPER, ADMIN_EMAIL_HASH,
      ADMIN_PASSWORD_HASH, ADMIN_SESSION_SECRET, ADMIN_API_SECRET, NEXT_PUBLIC_SITE_URL (your real web address)
  • Local production test:  npm run build  then  npm start
  • Later backend changes:   npm run convex:deploy
`);
