import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Smooth expo-out easing used for every reveal. */
export const ease = [0.16, 1, 0.3, 1] as const;

export function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}
