import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'duration',
    standalone: true
})
export class DurationPipe implements PipeTransform {
    transform(value: number | null | undefined): string {
        if (!value) return '60 min'; // Default fallback

        if (value < 60) {
            return `${value} min`;
        }

        const hours = Math.floor(value / 60);
        const mins = value % 60;

        if (mins === 0) {
            return `${hours} hr${hours > 1 ? 's' : ''}`;
        }

        return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min`;
    }
}
