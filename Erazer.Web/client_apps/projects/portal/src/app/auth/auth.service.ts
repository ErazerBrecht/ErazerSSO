import { Injectable, isDevMode } from '@angular/core';
import { JwksValidationHandler, OAuthService, OAuthErrorEvent } from 'angular-oauth2-oidc';
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

    private initDev() {
        return new Promise((resolveFn, rejectFn) => {
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

            this.http
                .post<string>('http://localhost:5000/connect/token', tokenRequest.toString(), httpOptions)
                .toPromise()
                .then((data: any) => {
                    sessionStorage.setItem('access_token', data.access_token);
                    resolveFn();
                })
                .catch((err: any) => rejectFn(err));
        });
    }

    private initProd(): Promise<any> {
        return new Promise((resolveFn, rejectFn) => {
            // setup oauthService
            this.oauthService.configure(authConfig);
            this.oauthService.setStorage(sessionStorage);
            this.oauthService.tokenValidationHandler = new JwksValidationHandler();

            this.oauthService.events.subscribe(event => {
                if (event instanceof OAuthErrorEvent) {
                    console.error(event);
                    window.location.href = "/auth/logout/local";
                }
            });

            // continue initializing app (provoking a token_received event) or redirect to login-page
            this.oauthService.loadDiscoveryDocumentAndLogin().then(isLoggedIn => {
                if (isLoggedIn) {
                    //this.oauthService.setupAutomaticSilentRefresh();
                    resolveFn();
                } else {
                    this.oauthService.initLoginFlow();
                    rejectFn();
                }
            });
        });
    }

    private getEnv(name: string) {
        if (environment.hasOwnProperty(name))
            return environment[name];
        throw Error('Environment variable is not defined!');
    }


}