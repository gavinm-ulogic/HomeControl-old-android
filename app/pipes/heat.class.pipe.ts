import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'heatClass'})
export class HeatClassPipe implements PipeTransform {
  transform(value: number): any {
      if (value === -999) { return ''; }
      let iPos = Math.min(25, Math.max(4, Math.floor(value)));
      return 'temperature-' + iPos;
  }
}
