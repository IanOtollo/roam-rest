import "server-only";

/**
 * Sends mail through Resend's HTTP API (no SDK needed). Needs RESEND_API_KEY.
 * RESEND_FROM must be an address on a domain verified in Resend (e.g. info@roamandrest.co.ke).
 * Until then, Resend only allows "onboarding@resend.dev" and only to the Resend account owner.
 * Never throws: email trouble must never break a guest's booking flow.
 */
export async function sendEmail(opts: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[email] RESEND_API_KEY is not set; email not sent.");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Roam & Rest <info@roamandrest.co.ke>",
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend rejected the message:", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] Could not reach Resend:", e);
    return false;
  }
}

export const notifyAddress = () => process.env.NOTIFY_EMAIL || "info@roamandrest.co.ke";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const longDate = (key: string) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export interface InquiryEmail {
  brand: string;
  propertyTitle: string;
  area: string;
  unitLabel: string;
  showUnit: boolean;
  start: string;
  end: string;
  nights: number;
  guests: number;
  total: number | null;
  bookedUrl: string;
  declinedUrl: string;
}

/** The host's "new inquiry" email: neat summary plus two buttons. Inline styles are required in email. */
export function inquiryEmail(i: InquiryEmail) {
  const rows: [string, string][] = [
    ["Property", i.propertyTitle],
    ...(i.showUnit ? ([["Option", i.unitLabel]] as [string, string][]) : []),
    ["Location", i.area],
    ["Check-in", longDate(i.start)],
    ["Check-out", longDate(i.end)],
    ["Nights", String(i.nights)],
    ["Guests", String(i.guests)],
    ...(i.total ? ([["Total shown on the site", `KES ${i.total.toLocaleString("en-KE")}`]] as [string, string][]) : []),
  ];
  const subject = `New booking inquiry: ${i.propertyTitle}, ${longDate(i.start)} to ${longDate(i.end)}`;

  const tableRows = rows
    .map(
      ([k, v], n) =>
        `<tr><td style="padding:12px 16px;font-size:13px;color:#78716c;width:42%;${n ? "border-top:1px solid #e7e5e4;" : ""}">${esc(k)}</td><td style="padding:12px 16px;font-size:15px;font-weight:600;${n ? "border-top:1px solid #e7e5e4;" : ""}">${esc(v)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f1ec;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:#1c1917;">
<tr><td style="padding:28px 32px 8px 32px;">
<p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#78716c;">${esc(i.brand)}</p>
<h1 style="margin:10px 0 0 0;font-size:24px;line-height:1.3;font-weight:600;">New booking inquiry</h1>
<p style="margin:10px 0 0 0;font-size:15px;line-height:1.6;color:#57534e;">A guest just tapped <strong>Reserve on WhatsApp</strong>. They should message you shortly. Once you know how it went, press one of the buttons below.</p>
</td></tr>
<tr><td style="padding:20px 32px 4px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7e5e4;border-radius:12px;">
${tableRows}
</table>
</td></tr>
<tr><td style="padding:24px 32px 8px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="50%" style="padding-right:6px;"><a href="${esc(i.bookedUrl)}" style="display:block;text-align:center;background:#166534;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 8px;border-radius:12px;">Booking successful</a></td>
<td width="50%" style="padding-left:6px;"><a href="${esc(i.declinedUrl)}" style="display:block;text-align:center;background:#ffffff;color:#1c1917;text-decoration:none;font-size:15px;font-weight:600;padding:13px 8px;border-radius:12px;border:1px solid #a8a29e;">Not successful</a></td>
</tr></table>
</td></tr>
<tr><td style="padding:12px 32px 28px 32px;">
<p style="margin:0;font-size:13px;line-height:1.6;color:#78716c;"><strong>Booking successful</strong> crosses these dates out on the website calendar. <strong>Not successful</strong> leaves them open. Each button asks you to confirm on the next page, so nothing changes by accident.</p>
</td></tr>
</table>
</td></tr></table></body></html>`;

  const text = [
    "New booking inquiry (guest tapped Reserve on WhatsApp)",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    `Booking successful (crosses the dates out): ${i.bookedUrl}`,
    `Not successful (dates stay open): ${i.declinedUrl}`,
  ].join("\n");

  return { subject, html, text };
}
