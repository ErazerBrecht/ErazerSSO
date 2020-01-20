import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {

    issuer: 'http://localhost:5000',
    redirectUri: document.getElementsByTagName('base')[0].href + 'index.html',
    clientId: 'angular',
    responseType: 'code',
    scope: 'openid profile api',
    showDebugInformation: true,
}