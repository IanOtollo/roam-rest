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
  // The name is optional: a blank one is shown as "Guest".
  const author = String(form.get("author") ?? "").trim().slice(0, 60) || "Guest";
  const quote = String(form.get("quote") ?? "").slice(0, 1000);

  const rating = Number(form.get("rating"));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Please choose a star rating from 1 to 5." };

  try {
    await fetchMutation(api.reviews.submit, { token, author, quote, rating });
    return { done: true };
  } catch (e) {
    if (e instanceof ConvexError && typeof e.data === "string") return { error: e.data };
    return { error: "Something went wrong. Please try again in a moment." };
  }
}
