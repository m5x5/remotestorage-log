import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * Used by shadcn/ui components if you add them later
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

