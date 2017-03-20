import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  images:Array<Object> = [];

  constructor() {}

  handleDrop(e) {
    let files:File = e.dataTransfer.files;
    let self = this;
    Object.keys(files).forEach((key) => {
      if(files[key].type === "image/png" || files[key].type === "image/jpeg") {
        self.images.push(files[key]);
      }
      else {
        alert("File must be a PNG or JPEG!");
      }
    });

    return false;
  }

}
