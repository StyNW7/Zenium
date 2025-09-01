import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get timezone-aware greeting based on current hour
 * Uses JavaScript Date.prototype.getHours() method
 * @returns Time-based greeting string
 */
export function getTimezoneGreeting(): string {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
}

/**
 * Get formatted timezone information
 * @returns String with current timezone
 */
export function getTimezoneInfo(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC'; // fallback
  }
}
