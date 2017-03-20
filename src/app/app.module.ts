import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {AngularFireModule, AuthProviders, AuthMethods} from "angularfire2";

export const fireBaseConfig = {
  apiKey: "AIzaSyCMLXHDso7niqEQFV2XTVChk-PtpJimuaw",
  authDomain: "gulls-nest.firebaseapp.com",
  databaseURL: "https://gulls-nest.firebaseio.com",
  storageBucket: "gulls-nest.appspot.com",
  messagingSenderId: "995073188328"
};

const firebaseAuthConfig = {
  provider: AuthProviders.Google,
  method: AuthMethods.Redirect
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(fireBaseConfig, firebaseAuthConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
