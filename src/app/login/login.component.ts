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

  constructor(private af: AngularFire, @Inject(FirebaseApp) private firebaseApp: any, public authenticationService: AuthenticationService, private router: Router) {
  }

  ngOnInit() {
    this.af.auth.subscribe((auth: FirebaseAuthState) => {
      if (auth) {
        // login happened
        console.log('Login happened...');
        console.log(auth);
        // TODO: redirect to project page
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
