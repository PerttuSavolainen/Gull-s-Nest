import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import {AngularFireModule, AuthProviders, AuthMethods} from "angularfire2";
import {AuthenticationService} from "./authentication.service";
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import {MdProgressCircleModule} from "@angular2-material/progress-circle";
import {NgxElectronModule} from "ngx-electron";
import { ActiveFilesPipe } from './active-files.pipe';
import { EventlistenerDirective } from './eventlistener.directive';

const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent }
];

export const fireBaseConfig = {
  apiKey: 'AIzaSyCMLXHDso7niqEQFV2XTVChk-PtpJimuaw',
  authDomain: 'gulls-nest.firebaseapp.com',
  databaseURL: 'https://gulls-nest.firebaseio.com',
  storageBucket: 'gulls-nest.appspot.com',
  messagingSenderId: '995073188328'
};

const firebaseAuthConfig = {
  provider: AuthProviders.Google,
  method: AuthMethods.Redirect
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    ActiveFilesPipe,
    EventlistenerDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes),
    AngularFireModule.initializeApp(fireBaseConfig, firebaseAuthConfig),
    MdProgressCircleModule,
    NgxElectronModule
  ],
  providers: [AuthenticationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
