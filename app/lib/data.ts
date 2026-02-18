import { District, RamadanData } from './types';

import ramadanData from './ramadan.json';

export async function getRamadanData(): Promise<RamadanData> {
    // Return the imported data directly
    return ramadanData as RamadanData;
}

export function calculateTimings(baseSchedule: any[], offset: number) {
    return baseSchedule.map(day => {
        // Helper to add minutes to time string "HH:MM"
        const processTime = (timeStr: string, mins: number, isPm: boolean) => {
            let [h, m] = timeStr.split(':').map(Number);

            // Iftar is always PM, convert 5:00 -> 17:00 for calculation
            if (isPm && h < 12) h += 12;

            const date = new Date();
            date.setHours(h, m + mins, 0);

            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        };

        return {
            ...day,
            sehri: processTime(day.sehri, offset, false),
            fajr: processTime(day.fajr, offset, false),
            iftar: processTime(day.iftar, offset, true) // Force PM for Iftar
        };
    });
}
