import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";
import { adminMutation, clientKey, convexReady } from "@/lib/admin/server";
import { inquiryEmail, notifyAddress, sendEmail } from "@/lib/email";
import { brand } from "@/lib/property";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const none = () => new NextResponse(null, { status: 204 });

/**
 * A guest tapped "Reserve on WhatsApp" with dates chosen. Record the inquiry and email the host
 * two buttons (booking successful / not successful). The browser fires this in the background,
 * so it must never get in the way of opening WhatsApp: it always answers 204.
 */
export async function POST(req: Request) {
  try {
    const pepper = process.env.ADMIN_EMAIL_PEPPER;
    if (!convexReady() || !pepper) return none();

    const b = (await req.json()) as Record<string, unknown>;
    const str = (k: string, max: number) => (typeof b[k] === "string" && (b[k] as string).length <= max ? (b[k] as string) : "");
    const slug = str("slug", 60);
    const unit = str("unit", 60);
    const start = str("start", 10);
    const end = str("end", 10);
    const guests = Number(b.guests);
    if (!slug || !unit || !start || !end || !Number.isFinite(guests)) return none();

    const token = randomBytes(32).toString("base64url");
    const r = await adminMutation(api.inquiries.create, {
      token,
      ipHash: await clientKey(pepper),
      propertySlug: slug,
      unit,
      start,
      end,
      guests,
    });
    if (!r.ok) return none();

    const base = `${siteUrl()}/inquiry/${token}`;
    const mail = inquiryEmail({
      brand: brand.name,
      propertyTitle: r.propertyTitle,
      area: r.area,
      unitLabel: r.unitLabel,
      showUnit: r.showUnit,
      start,
      end,
      nights: r.nights,
      guests: Math.round(guests),
      total: r.nightlyRate > 0 ? r.nightlyRate * r.nights : null,
      bookedUrl: `${base}?answer=booked`,
      declinedUrl: `${base}?answer=declined`,
    });
    await sendEmail({ to: notifyAddress(), ...mail });
  } catch (e) {
    console.error("[inquiry] failed:", e);
  }
  return none();
}
