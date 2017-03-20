import {Component, OnInit, Inject} from '@angular/core';
import {AngularFire, FirebaseListObservable, FirebaseApp, FirebaseAuthState} from "angularfire2";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  activeUser: {
    displayName?: string,
    photoUrl?: string,
    uid?: string
  };

  images:Array<Object> = [];
  items: FirebaseListObservable<any[]>;

  constructor(private af: AngularFire, @Inject(FirebaseApp) private firebaseApp: any) {

  }

  ngOnInit(): void {

    this.af.auth.subscribe((auth: FirebaseAuthState) => {

      if (auth) {

        // login happened
        console.log("Login happened...");

        let act: { displayName?: string, photoUrl?: string, uid?: string } = {};
        let user = auth.auth;

        if (user.displayName) act.displayName = user.displayName;
        if (user.photoURL) act.photoUrl = user.photoURL;
        act.uid = user.uid;

        this.activeUser = act;

      } else {
        // logout or not signed in happened
        this.activeUser = null;
      }

    });

    const storageRef = this.firebaseApp.storage().ref();
    console.log(storageRef);




  }

  login() {
    this.af.auth.login();
  }

  logout(){
    this.af.auth.logout();
  }

  handleDrop(e) {

    let files:File = e.dataTransfer.files;

    const storageRef = this.firebaseApp.storage().ref();


    Object.keys(files).forEach((key) => {
      if(files[key].type === "image/png" || files[key].type === "image/jpeg") {

        let imageref = storageRef.child(files[key].name);

        imageref.put(files[key]).then(snapshot => {
          this.images.push(files[key]);
        });

      }
      else {
        alert("File must be a PNG or JPEG!");
      }
    });

    return false;
  }

}
