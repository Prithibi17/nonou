import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR", symbol: string = "₹"): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${symbol}0.00`;
  
  if (currency === "INR" || symbol === "₹") {
    // Indian Lakh / Crore numbering format
    return `${symbol}${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCompactNumber(amount: number, symbol: string = "₹"): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${symbol}0`;

  if (amount >= 10000000) {
    return `${symbol}${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `${symbol}${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)} K`;
  }

  return `${symbol}${amount.toFixed(0)}`;
}

export function formatDate(dateString: string | Date | null | undefined, formatStr: string = "dd MMM yyyy"): string {
  if (!dateString) return "-";
  try {
    const d = typeof dateString === "string" ? parseISO(dateString) : dateString;
    if (!isValid(d)) return "-";
    return format(d, formatStr);
  } catch {
    return "-";
  }
}

export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return "-";
  try {
    const d = typeof dateString === "string" ? parseISO(dateString) : dateString;
    if (!isValid(d)) return "-";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "-";
  }
}

export function getInitials(name: string): string {
  if (!name) return "OS";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
