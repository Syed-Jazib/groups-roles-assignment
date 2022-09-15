import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false
})
//Filtering Roles with 'All', 'Marked' & 'UnMarked'.
export class FilterPipe implements PipeTransform {
  transform<T extends { label: string }>(items: T[], label: string): any {
    return items.filter(item => item.label.toLowerCase().indexOf(label.toLowerCase()) !== -1);
  }
}
