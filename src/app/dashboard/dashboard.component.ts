import { Component, Inject, OnInit } from '@angular/core';
import {AngularFire, FirebaseApp, FirebaseAuthState, FirebaseListObservable} from 'angularfire2';
import { User, AuthenticationService } from '../authentication.service';
import {Router} from '@angular/router';
import {ElectronService} from 'ngx-electron';


export interface File {
  name: string;
  path: string;
  size: number;
  type: string;
  md5Hash: string;
}

export interface FbFile extends File {
  $key: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  folders: FirebaseListObservable<any[]>;
  files: FirebaseListObservable<any[]>;

  constructor(
    private af: AngularFire, @Inject(FirebaseApp) private firebaseApp: any,
    public authenticationService: AuthenticationService, private router: Router,
    private electronService: ElectronService
  ) {
  }

  ngOnInit() {
    // check that user is logged in
    if (this.authenticationService.getActiveUser()) {
      // create realtime database list of folders,
      // it updates itself when data is added/removed/updated
      this.folders = this.af.database.list('/folders/' + this.authenticationService.getActiveUser().uid);
      this.files = this.af.database.list('/files/' + this.authenticationService.getActiveUser().uid);

      // just for testing
      this.addFolder();

    } else {
      // not signed in, redirect to login
      this.nullAndRedirect();
    }

    // render and main process messaging test
    console.log(this.electronService.ipcRenderer.sendSync('synchronous-message', 'ping'));

    this.electronService.ipcRenderer.on('asynchronous-reply', (event, arg) => {
      console.log(arg); // prints "pong"
    });

    this.electronService.ipcRenderer.send('asynchronous-message', 'ping');

  }

  toggleSearch() {
  }

  /**
   * Logout the user
   */
  logout() {
    this.af.auth.logout();
    this.nullAndRedirect();

  }

  private nullAndRedirect() {
    this.authenticationService.setActiveUser(null);
    this.folders = null;
    this.files = null;
    this.router.navigate(['/']);
  }

  handleDrop(e) {

    const files: File = e.dataTransfer.files;
    const storageRef = this.firebaseApp.storage().ref('/' + this.authenticationService.getActiveUser().uid);

    Object.keys(files).forEach((key) => {

      const name = files[key].name;
      const lastDotIndex = name.lastIndexOf('.'); // get last dot position
      const newName = name.slice(0, lastDotIndex) + '_' + this.generateNonce(20) + name.slice(lastDotIndex);

      const fileRef = storageRef.child(newName);

      fileRef.put(files[key]).then(snapshot => {

        console.log(snapshot);

        if (snapshot) {

          // TODO handle different scenarios
          if (snapshot.a && snapshot.f === 'success') {

            // TODO get path that needs authentication,
            // snapshot.a.downloadURLs[0] is accessible for everyone

            const file: File = {
              name: snapshot.a.name,
              path: snapshot.a.downloadURLs[0],
              size: snapshot.a.size,
              type: snapshot.a.contentType,
              md5Hash: snapshot.a.md5Hash
            };

            this.files.push(file).then(() => {

            }).catch(error => {
              // TODO create something  valid here
              console.error(error);
            });

          }

        }

      }).catch(error => {

        // TODO give some kind of info about the error to the end user

        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;

          case 'storage/canceled':
            // User canceled the upload
            break;

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }

      });

    });

    return false;
  }

  /**
   * Handle preview click event and send link to preview directive
   *
   * @param e
   */
  preview(e: Event) {

    e.preventDefault();
    // TODO send link of preview to child directive

  }

  addFolder() {

    let nameExists: boolean = false;

    // TODO handle folder name
    let folderName = "moi" + Math.random() * 100;

    this.folders.forEach((folder: any) => {
      console.log(folder);
      // check if name already exists
      if (folderName === folder.name) {
          nameExists = true;
          // break;
      }
    });

    if (nameExists) {
      // name already exist, inform user about this
    } else {
      // create folder
      const folder: { name: string } = {
        name: folderName
      };

      this.folders.push(folder).then((res) => {

        console.log(res);

      }).catch(error => {
        // TODO create something  valid here
        console.error(error);
      });


    }

  }

  downloadFile(file: FbFile) {
    const storageRef = this.firebaseApp.storage().ref('/' + this.authenticationService.getActiveUser().uid);
    const fileRef = storageRef.child(file.name);

    fileRef.getMetadata().then(metadata => {

      // Test integrity by comparing storage and database hashes
      if (metadata.md5Hash === file.md5Hash) {
        // hashes matched,
        // create link tag and click it aka download a file
        const dl = document.createElement('a');
        dl.setAttribute('href', file.path);
        dl.setAttribute('download', file.name);
        dl.click();
      } else {
        // integrity is compromised
        // TODO don't let user load this file and inform user about this
      }

    });

  }

  deleteFile(file: FbFile){

    const storageRef = this.firebaseApp.storage().ref('/' + this.authenticationService.getActiveUser().uid);
    const fileRef = storageRef.child(file.name);

    fileRef.delete().then(() => {

      // file deleted successfully,
      // next delete database reference
      this.files.remove(file.$key).then(() => {
        console.log('File deleted successfully');
      }).catch(error => {
        console.error(error);
      });

    }).catch(error => {
      // TODO inform the user about error
      console.error(error);
    });

  }

  /**
   * Generate alpha-numeric nonce
   *
   * @param length
   * @returns {string}
   */
  private generateNonce(length: number){

    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;

  }

}
