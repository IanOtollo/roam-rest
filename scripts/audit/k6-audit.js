// Reliability / scalability audit, run after every property upload.
//   k6 run scripts/audit/k6-audit.js
//   k6 run -e SITE=https://www.roamandrest.co.ke -e SLUG=kajiado-stone-house scripts/audit/k6-audit.js
// Read-only: only public pages and public Convex queries are called. Keep VUS modest so the
// audit never behaves like an attack on production or eats the Convex plan.
import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

const SITE = __ENV.SITE || "https://www.roamandrest.co.ke";
const CONVEX = __ENV.CONVEX || "https://strong-corgi-692.convex.cloud";
const SLUG = __ENV.SLUG || "karen-estate";
const VUS = Number(__ENV.VUS || 15);

const listMs = new Trend("convex_list_ms", true);
const listKb = new Trend("convex_list_kb");

export const options = {
  stages: [
    { duration: "10s", target: VUS },
    { duration: "30s", target: VUS },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    "http_req_duration{page:home}": ["p(95)<2500"],
    "http_req_duration{page:stay}": ["p(95)<2500"],
    convex_list_ms: ["p(95)<1000"],
    convex_list_kb: ["max<2048"], // homepage payload ceiling: 2 MB
  },
};

export default function () {
  const home = http.get(`${SITE}/`, { tags: { page: "home" } });
  check(home, { "home 200": (r) => r.status === 200 });

  const stay = http.get(`${SITE}/stays/${SLUG}`, { tags: { page: "stay" } });
  check(stay, { "stay 200": (r) => r.status === 200 });

  // The query behind the homepage cards: grows with every property and image.
  const q = http.post(`${CONVEX}/api/query`, JSON.stringify({ path: "properties:list", args: {}, format: "json" }), {
    headers: { "Content-Type": "application/json" },
    tags: { page: "convex_list" },
  });
  const ok = check(q, { "list ok": (r) => r.status === 200 && r.json("status") === "success" });
  if (ok) {
    listMs.add(q.timings.duration);
    listKb.add(q.body.length / 1024);
  }
  sleep(1);
}

export function handleSummary(data) {
  const n = (m, k) => (data.metrics[m] && data.metrics[m].values[k] !== undefined ? data.metrics[m].values[k] : NaN);
  const out = [
    `requests: ${n("http_reqs", "count")}  failed: ${(n("http_req_failed", "rate") * 100).toFixed(2)}%`,
    `home  p95: ${n("http_req_duration{page:home}", "p(95)").toFixed(0)} ms`,
    `stay  p95: ${n("http_req_duration{page:stay}", "p(95)").toFixed(0)} ms`,
    `convex list p95: ${n("convex_list_ms", "p(95)").toFixed(0)} ms, payload ${n("convex_list_kb", "max").toFixed(0)} KB`,
  ].join("\n");
  return { stdout: `\n=== AUDIT SUMMARY ===\n${out}\n` };
}
