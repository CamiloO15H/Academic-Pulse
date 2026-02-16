/**
 * Academic dates (clases, notes) are stored as "YYYY-MM-DD" but often processed as UTC midnight.
 * To avoid the "one day prior" shift in local timezones (e.g., -05:00), we must handle them as UTC.
 */

/**
 * Parses a "YYYY-MM-DD" string or a Date object into a Date object at UTC midnight.
 */
export function toUTCDate(input: string | Date | undefined): Date {
    if (!input) return new Date();

    if (input instanceof Date) {
        return new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
    }

    // Handle string "YYYY-MM-DD"
    const [year, month, day] = input.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Formats a Date object as a human-readable string in UTC timezone.
 * Example: "12 feb 2026"
 */
export function formatUTC(date: Date | string | undefined, options: Intl.DateTimeFormatOptions = {}): string {
    if (!date) return 'Sin fecha';
    const d = typeof date === 'string' ? new Date(date) : date;

    return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
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
