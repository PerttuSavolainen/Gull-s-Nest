import { Injectable } from '@angular/core';

export interface User {
 displayName?: string;
 photoUrl?: string;
 uid?: string;
}

@Injectable()
export class AuthenticationService {

  private activeUser: User;

  constructor() { }

  getActiveUser(): User {
    return this.activeUser;
  }

  setActiveUser(user: User) {
    this.activeUser = user;
  }

}
