import { Pipe, PipeTransform } from '@angular/core';

import { File } from './dashboard/dashboard.component';

@Pipe({
  name: 'activeFiles'
})
export class ActiveFilesPipe implements PipeTransform {

  transform(arr: Array<File>, actFolderId?: string): Array<File> {



    if (arr) return arr.filter((file: File) => file.folderRefId === actFolderId);
    else return [];
  }

}
