/**
 * Utility functions for the Resist extension
 */

import { logger } from './utils/logger'

/**
 * Format time spent in minutes and seconds
 */
export function formatTimeSpent(milliseconds: number): string {
  if (!milliseconds || milliseconds === 0) return '0s';
  
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  
  if (minutes === 0) {
    return `${seconds}s`;
  } else if (seconds === 0) {
    return `${minutes}m`;
  } else {
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * Format time nicely for "time ago" display
 */
export function formatTimeAgo(timestamp: number): string {
  if (!timestamp) return 'Unknown';
  
  try {
    const time = new Date(timestamp);
    if (isNaN(time.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 300) { // Less than 5 minutes
      if (diffInSeconds < 60) {
        return 'Just now';
      } else {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
    } else {
      // More than 5 minutes ago - return formatted date and time
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return time.toLocaleDateString('en-US', options);
    }
  } catch (error) {
    logger.error('[Utils] Error formatting time:', error);
    return 'Unknown';
  }
}
