"use server";

import { fetchMutation } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { api } from "../../../convex/_generated/api";

export type ReviewState = { done?: boolean; error?: string };

/** Public: a guest submits their review using their personal one-time link. */
export async function submitReviewAction(_prev: ReviewState, form: FormData): Promise<ReviewState> {
  // Hidden field that real people never fill in; bots usually do.
  if (String(form.get("website") ?? "") !== "") return { done: true };

  const token = String(form.get("token") ?? "").slice(0, 200);
  const author = String(form.get("author") ?? "").slice(0, 100);
  const quote = String(form.get("quote") ?? "").slice(0, 1000);

  try {
    await fetchMutation(api.reviews.submit, { token, author, quote });
    return { done: true };
  } catch (e) {
    if (e instanceof ConvexError && typeof e.data === "string") return { error: e.data };
    return { error: "Something went wrong. Please try again in a moment." };
  }
}
