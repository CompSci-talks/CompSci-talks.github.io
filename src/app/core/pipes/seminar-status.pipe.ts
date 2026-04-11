import { Pipe, PipeTransform } from '@angular/core';

export type StatusType = 'live' | 'soon' | 'upcoming' | 'past';

@Pipe({
    name: 'seminarStatus',
    standalone: true
})
export class SeminarStatusPipe implements PipeTransform {
    transform(dateTimeMs: number | Date): StatusType {
        const time = dateTimeMs instanceof Date ? dateTimeMs.getTime() : dateTimeMs;
        const now = Date.now();
        const diff = time - now;

        // Past: more than 1.5 hours after start time
        if (diff < -5400000) return 'past';

        // Live: within 1.5 hours after start to 0 diff
        if (diff <= 0 && diff >= -5400000) return 'live';

        // Soon: within 15 minutes before start
        if (diff > 0 && diff <= 900000) return 'soon';

        // Otherwise it's upcoming
        return 'upcoming';
    }
}
