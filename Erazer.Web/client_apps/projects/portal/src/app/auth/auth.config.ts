import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

export const authConfig: AuthConfig = {
    issuer: environment.idsrv,
    redirectUri: document.getElementsByTagName('base')[0].href + 'index.html',
    silentRefreshRedirectUri: document.getElementsByTagName('base')[0].href + 'silent-refresh.html',
    clientId: 'angular',
    responseType: 'code',
    scope: 'openid profile api',
    showDebugInformation: true,
    silentRefreshShowIFrame: false,
    timeoutFactor: 0.2
}