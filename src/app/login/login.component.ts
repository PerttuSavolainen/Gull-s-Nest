import { Component, OnInit, Inject } from '@angular/core';
import { AngularFire, FirebaseApp, FirebaseAuthState } from 'angularfire2';
import { User, AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  isLoading: boolean;

  constructor(private af: AngularFire, @Inject(FirebaseApp) private firebaseApp: any, public authenticationService: AuthenticationService, private router: Router) {
  }

  ngOnInit() {

    this.isLoading = true;

    this.af.auth.subscribe((auth: FirebaseAuthState) => {

      this.isLoading = false;

      if (auth) {
        // login happened
        console.log('Login happened...');

        let act: User = {};
        let user = auth.auth;

        if (user.displayName) act.displayName = user.displayName;
        if (user.photoURL) act.photoUrl = user.photoURL;
        act.uid = user.uid;

        this.authenticationService.setActiveUser(act);
        this.router.navigate(['/dashboard']);

      } else {
        // logout or not signed in happened
        this.authenticationService.setActiveUser(null);
      }

    });

  }

  login() {
    this.af.auth.login();
  }
}
