"use server";

import { redirect } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { adminMutation, explain, refreshSite } from "@/lib/admin/server";

/** The host's answer, from the confirmation page the email buttons lead to. */
export async function answerInquiry(token: string, decision: "booked" | "declined") {
  let error = "";
  try {
    await adminMutation(api.inquiries.decide, { token, decision });
    if (decision === "booked") refreshSite(); // the nights show as taken straight away
  } catch (e) {
    error = explain(e);
  }
  redirect(`/inquiry/${encodeURIComponent(token)}${error ? `?error=${encodeURIComponent(error)}` : ""}`);
}
