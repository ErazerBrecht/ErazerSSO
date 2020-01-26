// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// IMPORTANT: In a real environment the secret values (password & client_secret) would be loaded by dotenv or something similiar!!
// They shouldn't be commited into vcs!!
export const environment = {
  production: true, 
  host: 'localhost',
  username: 'alice',                
  password: 'alice',                
  client_id: 'angular_dev',
  client_secret: '425A4639-4079-49E1-9F86-E832F246F5FB'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
