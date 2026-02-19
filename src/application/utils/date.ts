export const COLOMBIA_TIMEZONE = 'America/Bogota';

/**
 * Returns the current date and time in Colombia's timezone.
 */
export function getColombiaNow(): Date {
    // Current time in UTC
    const now = new Date();
    // Use Intl.DateTimeFormat to get the string in Colombia's time, then parse back
    // This is a common way to get "now" in a specific timezone using native JS
    const colombiaString = now.toLocaleString('en-US', { timeZone: COLOMBIA_TIMEZONE });
    return new Date(colombiaString);
}

/**
 * Parses a "YYYY-MM-DD" string or a Date object into a Date object at UTC midnight.
 */
export function toUTCDate(input: string | Date | undefined): Date {
    if (!input) return getColombiaNow();

    if (input instanceof Date) {
        return new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
    }

    // Handle string "YYYY-MM-DD"
    const [year, month, day] = input.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Formats a Date object as a human-readable string.
 * Defaults to Colombia timezone but can be overridden.
 * Example: "12 feb 2026"
 */
export function formatUTC(date: Date | string | undefined, options: Intl.DateTimeFormatOptions = {}): string {
    if (!date) return 'Sin fecha';
    const d = typeof date === 'string' ? new Date(date) : date;

    return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: COLOMBIA_TIMEZONE, // Default to Colombia
        ...options
    });
}

/**
 * Normalizes a Date to an ISO string "YYYY-MM-DD" based on its UTC values.
 */
export function toISODateUTC(date: Date | string | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
}
