import {Component, OnInit, Inject} from '@angular/core';
import {AngularFire, FirebaseListObservable, FirebaseApp, FirebaseAuthState} from "angularfire2";
import {User, AuthenticationService} from "./authentication.service";

export interface File {
  name: string,
  path: string,
  size: number
  //refUserId: string
}

export interface FbFile extends File {
  $key: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  files: FirebaseListObservable<any[]>;

  constructor(private af: AngularFire, @Inject(FirebaseApp) private firebaseApp: any, public authenticationService: AuthenticationService) {

  }

  ngOnInit(): void {

    this.af.auth.subscribe((auth: FirebaseAuthState) => {

      if (auth) {

        // login happened
        console.log("Login happened...");
        console.log(auth);

        let act: User = {};
        let user = auth.auth;

        if (user.displayName) act.displayName = user.displayName;
        if (user.photoURL) act.photoUrl = user.photoURL;
        act.uid = user.uid;

        this.authenticationService.setActiveUser(act);

        // create realtime database list,
        // it updates itself when data is added/removed/updated
        this.files = this.af.database.list('/files/' + this.authenticationService.getActiveUser().uid);

      } else {
        // logout or not signed in happened
        this.authenticationService.setActiveUser(null);
        this.files = null;
      }

    });

  }

  login() {
    this.af.auth.login();
  }

  logout(){
    this.af.auth.logout();
  }

  handleDrop(e) {

    let files:File = e.dataTransfer.files;
    const storageRef = this.firebaseApp.storage().ref("/" + this.authenticationService.getActiveUser().uid);

    Object.keys(files).forEach((key) => {
      if(files[key].type === "image/png" || files[key].type === "image/jpeg") {

        let name = files[key].name;
        let lastDotIndex = name.lastIndexOf("."); // get last dot position
        let newName = name.slice(0, lastDotIndex) + "_" + this.generateNonce(20) + name.slice(lastDotIndex);

        let fileRef = storageRef.child(newName);

        fileRef.put(files[key]).then(snapshot => {

          console.log(snapshot);

          if (snapshot) {

            // TODO handle different scenarios
            if (snapshot.a && snapshot.f === "success") {

              // TODO get path that needs authentication,
              // snapshot.a.downloadURLs[0] is accessible for everyone

              let file: File = {
                name: snapshot.a.name,
                path: snapshot.a.downloadURLs[0],
                size: snapshot.a.size
              };

              this.files.push(file).then(() => {

              }).catch(error => {
                // TODO create something  valid here
                console.error(error)
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

      }
      else {
        alert("File must be a PNG or JPEG!");
      }
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

  deleteFile(file: FbFile){

    console.log(file);

    const storageRef = this.firebaseApp.storage().ref("/" + this.authenticationService.getActiveUser().uid);
    let fileRef = storageRef.child(file.name);

    fileRef.delete().then(() => {

      // file deleted successfully,
      // next delete database reference
      this.files.remove(file.$key).then(() => {
        console.log("File deleted successfully");
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

      let text: string = "";
      let possible: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for(let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;

  }

}
