import { Component, OnInit, Inject } from '@angular/core';
//import { AngularFire, FirebaseApp, FirebaseAuthState } from 'angularfire2';
import { FirebaseApp } from 'angularfire2';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { User, AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  isLoading: boolean;

  constructor(/*private af: AngularFire,*/ private afAuth: AngularFireAuth, @Inject(FirebaseApp) private firebaseApp: any, public authenticationService: AuthenticationService, private router: Router) {
  }

  ngOnInit() {

    this.isLoading = true;

    //this.af.auth.subscribe((auth: FirebaseAuthState) => {
    this.afAuth.authState.subscribe((auth: any) => {

      console.log(auth);

      this.isLoading = false;

      if (auth) {
        // login happened
        console.log('Login happened...');

        let act: User = {};
        //let user = auth.auth;

        if (auth.displayName) act.displayName = auth.displayName;
        if (auth.photoURL) act.photoUrl = auth.photoURL;
        act.uid = auth.uid;

        this.authenticationService.setActiveUser(act);
        this.router.navigate(['/dashboard']);

      } else {
        // logout or not signed in happened
        this.authenticationService.setActiveUser(null);
      }

    });

  }

  login() {
    //this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.afAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  }
}
