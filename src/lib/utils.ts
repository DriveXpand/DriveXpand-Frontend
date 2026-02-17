import type { TimeRange } from "@/types/ui";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateDateRange(range: TimeRange) {
    const now = new Date();
    let since: Date | undefined;
    let end: Date | undefined;

    if (range === "this_month") {
        since = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === "last_month") {
        since = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (range === "last_3_months") {
        since = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    } else if (range === "last_6_months") {
        since = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    } else if (range === "this_year") {
        since = new Date(now.getFullYear(), 0, 1);
    } else if (range === "last_year") {
        since = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear(), 0, 0, 23, 59, 59);
    }
    return { since, end };
}

