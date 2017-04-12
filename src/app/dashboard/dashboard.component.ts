import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {AngularFire, FirebaseApp, FirebaseAuthState, FirebaseListObservable} from 'angularfire2';
import { User, AuthenticationService } from '../authentication.service';
import {Router} from '@angular/router';
import {ElectronService} from 'ngx-electron';
import {Subscription} from "rxjs";



export interface Folder {
  name: string;
  $key?: string;
}

export interface File {
  name: string;
  path: string;
  size: number;
  type: string;
  md5Hash: string;
  folderRefId: string;
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

  activeFolder: Folder;
  folders: FirebaseListObservable<Array<Folder>>;
  files: FirebaseListObservable<Array<File>>;

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

      // set first folder as a active folder
      this.folders.subscribe((res: Array<Folder>) => {
        this.activeFolder = res[0];
      });

      this.files.subscribe((res) => {

        console.log("active")
        console.log(this.activeFolder)

        console.log(res)
      })

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
    this.activeFolder = null;
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
              md5Hash: snapshot.a.md5Hash,
              folderRefId: this.activeFolder.$key
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
  preview(path) {

    console.log(path);

    //e.preventDefault();
    // TODO send link of preview to child directive

  }

  activateFolder(folder: Folder) {
    this.activeFolder = folder;
    console.log(this.activeFolder);
  }

  handleFiles() {

    let array: Array<File> = [];

    this.files.forEach((file: any) => {

      if (file.folderRefId === this.activeFolder.$key) {
        array.push(file);
      }

    }).then(() => {
      return array;
    });





/*    return this.files.subscribe((res: Array<File>) => {

      let array: Array<File> = [];

      for (let file of res) {
        if (file.folderRefId === this.activeFolder.$key) {
          array.push(file);
        }
      }

      return array;

    });*/
  }

  addFolder() {

    let nameExists: boolean = false;

    // TODO handle folder name
    let folderName = "folder-" + this.generateNonce(20);

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
      const folder: Folder = {
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

  onDelete(e){
    // TODO: delete folder and all the files
    console.log('drop');
    console.log(e);
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

  generateColorClass(): string {
    return 'p-' + Math.round(Math.random()*4);
  }

}
