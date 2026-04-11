import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'seminarStatus',
})
export class SeminarStatusPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
