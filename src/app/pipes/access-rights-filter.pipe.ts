import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accessRightsFilter',
  pure: false
})
//Filtering Access Rights with 'All', 'Marked' & 'UnMarked'.
export class AccessRightsFilterPipe implements PipeTransform {
  transform(items: string[], accessRightSearch: string): any {
    return items.filter(item => item.toLowerCase().indexOf(accessRightSearch.toLowerCase()) !== -1);
  }
}
