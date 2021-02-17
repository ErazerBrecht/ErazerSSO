import { Injectable, isDevMode } from '@angular/core';
import { Location } from '@angular/common';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OAuthService, OAuthErrorEvent } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class InitialAuthService {
    constructor(private http: HttpClient, private oauthService: OAuthService, private location: Location, private router: Router) { }

    public initAuth(): Promise<any> {
        if (isDevMode()) {
            return this.initDev();
        }
        return this.initProd();
    }

    private async initDev() {
        const tokenRequest = new URLSearchParams();

        if (!environment.username || !environment.password || !environment.client_id || !environment.client_secret) {
            throw new Error("Can't complete dev authentication flow, missing environment variables");
        }

        tokenRequest.set('grant_type', "password");
        tokenRequest.set('username', environment.username);
        tokenRequest.set('password', environment.password);
        tokenRequest.set('client_id', environment.client_id);
        tokenRequest.set('client_secret', environment.client_secret);

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        }

        try {
            const data = await this.http
                .post<any>(`${environment.idsrv}/connect/token`, tokenRequest.toString(), httpOptions)
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
        const isLoggedIn = await this.oauthService.loadDiscoveryDocumentAndLogin({state: this.location.path()});
        if (isLoggedIn) {
            const state = this.oauthService.state;
            if (state) {
                this.router.navigateByUrl(decodeURIComponent(state));
            }
            this.oauthService.setupAutomaticSilentRefresh();
        } else {
            console.log('User is not logged in...');
            throw new Error('Not logged in user -> Redirect to login page');
        }
    }
}
