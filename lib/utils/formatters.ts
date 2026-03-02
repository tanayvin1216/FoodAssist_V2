import { format, parseISO } from 'date-fns';
import { OperatingHours, DayOfWeek } from '@/types/database';
import { DAY_ABBREVIATIONS, DAYS_OF_WEEK } from './constants';

/**
 * Format a phone number as (XXX) XXX-XXXX
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Parse a formatted phone number to digits only
 */
export function parsePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

/**
 * Format time from 24h to 12h format
 */
export function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get a summary of operating hours
 */
export function formatOperatingHours(hours: OperatingHours[]): string {
  if (!hours || hours.length === 0) return 'Hours not available';

  const openDays = hours.filter((h) => !h.is_closed);
  if (openDays.length === 0) return 'Closed';

  // Check if all open days have the same hours
  const firstDay = openDays[0];
  const allSameHours = openDays.every(
    (h) => h.open_time === firstDay.open_time && h.close_time === firstDay.close_time
  );

  if (allSameHours && firstDay.open_time && firstDay.close_time) {
    const dayList = openDays.map((h) => DAY_ABBREVIATIONS[h.day]).join(', ');
    return `${dayList}: ${formatTime(firstDay.open_time)} - ${formatTime(firstDay.close_time)}`;
  }

  // Group consecutive days with same hours
  return openDays
    .map((h) => {
      if (!h.open_time || !h.close_time) {
        return `${DAY_ABBREVIATIONS[h.day]}: Hours vary`;
      }
      return `${DAY_ABBREVIATIONS[h.day]}: ${formatTime(h.open_time)} - ${formatTime(h.close_time)}`;
    })
    .join('\n');
}

/**
 * Get short hours summary for cards
 */
export function getShortHoursSummary(hours: OperatingHours[]): string {
  if (!hours || hours.length === 0) return 'Hours not available';

  const openDays = hours.filter((h) => !h.is_closed);
  if (openDays.length === 0) return 'Closed';

  // Find consecutive day ranges
  const dayIndices = openDays
    .map((h) => DAYS_OF_WEEK.indexOf(h.day))
    .sort((a, b) => a - b);

  // Simple summary
  if (dayIndices.length === 7) {
    return 'Open daily';
  }

  if (dayIndices.length === 5 && dayIndices[0] === 0 && dayIndices[4] === 4) {
    return 'Mon-Fri';
  }

  if (dayIndices.length === 2 && dayIndices[0] === 5 && dayIndices[1] === 6) {
    return 'Sat-Sun';
  }

  return openDays.map((h) => DAY_ABBREVIATIONS[h.day]).join(', ');
}

/**
 * Check if organization is open on a specific day
 */
export function isOpenOnDay(hours: OperatingHours[], day: DayOfWeek): boolean {
  const dayHours = hours?.find((h) => h.day === day);
  return dayHours ? !dayHours.is_closed : false;
}

/**
 * Get today's operating hours
 */
export function getTodayHours(hours: OperatingHours[]): string {
  const today = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todayHours = hours?.find((h) => h.day === today);

  if (!todayHours || todayHours.is_closed) {
    return 'Closed today';
  }

  if (todayHours.open_time && todayHours.close_time) {
    return `Today: ${formatTime(todayHours.open_time)} - ${formatTime(todayHours.close_time)}`;
  }

  return 'Open today';
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate Google Maps direction link
 */
export function getDirectionsUrl(address: string, town: string, zip: string): string {
  const fullAddress = encodeURIComponent(`${address}, ${town}, NC ${zip}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${fullAddress}`;
}

/**
 * Check if organization is currently open
 */
export function isOpenNow(hours: OperatingHours[]): boolean {
  if (!hours || hours.length === 0) return false;

  const now = new Date();
  const dayIndex = now.getDay();
  // Convert Sunday=0 to match our monday-first array
  const today = DAYS_OF_WEEK[dayIndex === 0 ? 6 : dayIndex - 1];
  const todayHours = hours.find((h) => h.day === today);

  if (!todayHours || todayHours.is_closed) return false;
  if (!todayHours.open_time || !todayHours.close_time) return true; // Assume open if no specific times

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = todayHours.open_time.split(':').map(Number);
  const [closeH, closeM] = todayHours.close_time.split(':').map(Number);
  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;

  return currentTime >= openTime && currentTime < closeTime;
}
