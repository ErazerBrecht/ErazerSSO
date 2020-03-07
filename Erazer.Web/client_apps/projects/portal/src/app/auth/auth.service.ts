import { Injectable, isDevMode } from '@angular/core';
import { OAuthService, OAuthErrorEvent } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';
import { environment } from '../../environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class InitialAuthService {
    constructor(private http: HttpClient, private oauthService: OAuthService) { }

    initAuth(): Promise<any> {
        if (isDevMode()) {
            return this.initDev();
        }
        return this.initProd();
    }

    private async initDev() {
        const tokenRequest = new URLSearchParams();

        tokenRequest.set('grant_type', "password");
        tokenRequest.set('username', this.getEnv('username'));
        tokenRequest.set('password', this.getEnv('password'));
        tokenRequest.set('client_id', this.getEnv('client_id'));
        tokenRequest.set('client_secret', this.getEnv('client_secret'));

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        }

        try {
            const data = await this.http
                .post<any>(`${this.getEnv('idsrv')}/connect/token`, tokenRequest.toString(), httpOptions)
                .toPromise();

            sessionStorage.setItem('access_token', data.access_token);
        }
        catch (err) {
            // TODO This doesn't log find out why...
            console.error(err);
            throw err;
        }
    }

    private async initProd(): Promise<any> {
        // setup oauthService
        this.oauthService.configure(authConfig);
        this.oauthService.setStorage(sessionStorage);

        this.oauthService.events.subscribe(event => {
            if (event instanceof OAuthErrorEvent) {
                console.error(event);
                sessionStorage.clear();
                window.location.href = "/auth/logout/local";
            }
        });

        // continue initializing app (provoking a token_received event) or redirect to login-page
        const isLoggedIn = await this.oauthService.loadDiscoveryDocumentAndLogin();
        if (isLoggedIn) {
            this.oauthService.setupAutomaticSilentRefresh();
        } else {
            console.log('User is not logged in...');
            throw new Error('Not logged in user -> Redirect to login page');
        }
    }

    private getEnv(name: string) {
        if (environment.hasOwnProperty(name))
            return environment[name];
        throw Error('Environment variable is not defined!');
    }
}
