// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  fireBase: {
    apiKey: 'AIzaSyCMLXHDso7niqEQFV2XTVChk-PtpJimuaw',
    authDomain: 'gulls-nest.firebaseapp.com',
    databaseURL: 'https://gulls-nest.firebaseio.com',
    storageBucket: 'gulls-nest.appspot.com',
    messagingSenderId: '995073188328'
  }
};
